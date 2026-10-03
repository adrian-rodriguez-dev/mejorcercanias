"""Produce an auditable map snapshot; production changes require --promote."""
from pathlib import Path
import argparse
import difflib
import hashlib
import json
import os
import shutil
import sys
import zipfile

REPO = Path(__file__).resolve().parents[2]
BASE = REPO / "data/maps"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def review_reasons(root):
    """Review stamps must describe these exact inputs, including supporting maps."""
    maps = {m["core"]: m for m in read(root / "sources/manifest.json")}
    legends = read(root / "annotations/legends.json")
    feed_hash = digest(root / "sources/gtfs.zip")
    reasons = []
    for core, source in maps.items():
        if digest(root / source["file"]) != source["sha256"]:
            raise ValueError("Source integrity failure: " + core)
        if legends.get(core, {}).get("source_sha256") != source["sha256"]:
            reasons.append({"kind": "legend_changed", "core": core})
    observations = read(root / "annotations/connections.json")
    ids = {a["id"] for a in observations}
    if len(ids) != len(observations):
        raise ValueError("Duplicate observation IDs")
    for a in observations:
        if a["source_sha256"] != maps[a["core"]]["sha256"]:
            reasons.append({"kind": "map_changed", "id": a["id"], "core": a["core"]})
        if a["gtfs_source_sha256"] != feed_hash:
            reasons.append({"kind": "gtfs_changed", "id": a["id"]})
        for support in a.get("supporting_sources", []):
            if support.get("local_file") and digest(root / support["local_file"]) != support["sha256"]:
                reasons.append({"kind": "support_changed", "id": a["id"]})
    by_id = {a["id"]: a for a in observations}
    for rule in read(root / "annotations/boarding_points.json"):
        a = by_id.get(rule["observation_id"])
        if not a or rule["map_sha256"] != maps[a["core"]]["sha256"] or rule["gtfs_sha256"] != feed_hash:
            reasons.append({"kind": "boarding_points_changed", "id": rule["observation_id"]})
    return reasons


def apply_feed_review(root, reviews):
    """Apply only an explicitly reviewed ZIP crosswalk; original annotations stay in Git."""
    actual = digest(root / "sources/gtfs.zip")
    review = next((r for r in reviews if r["sha256"] == actual), None)
    if review is None:
        return None
    with zipfile.ZipFile(root / "sources/gtfs.zip") as archive:
        for table, key in [("stops.txt", "stopsSha256"), ("transfers.txt", "transfersSha256")]:
            if hashlib.sha256(archive.read(table)).hexdigest() != review[key]:
                raise ValueError("Reviewed feed table integrity failure: " + table)
    for file, field in [("connections.json", "gtfs_source_sha256"), ("boarding_points.json", "gtfs_sha256")]:
        path = root / "annotations" / file
        records = read(path)
        if any(r[field] not in (review["reviewedFromSha256"], actual) for r in records):
            raise ValueError("Feed review does not apply to these annotations")
        for record in records:
            record[field] = actual
        path.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return review


def corrections(root, policy, previous):
    """Compile the app's existing generic contract from approved observations."""
    import pipeline
    observations = read(root / "data/connections.json")
    by_id = {a["id"]: a for a in observations}
    maps = {m["core"]: m for m in read(root / "sources/manifest.json")}
    if review_reasons(root):
        raise ValueError("Review required before generating operational corrections")
    seconds = policy["estimatedWalkSeconds"]
    if type(seconds) is not int or seconds <= 0:
        raise ValueError("Estimated margin must be a positive integer")
    links = []
    for a in observations:
        if a["review_status"] != "visual_reviewed":
            raise ValueError("Observation is not reviewed: " + a["id"])
        if a["kind"] != "walking_connection":
            continue
        if a["gtfs_match_status"] != "reviewed" or len(set(a["stop_ids"])) != 2 or not a.get("pedestrian_link"):
            raise ValueError("Unresolved walking connection: " + a["id"])
        links.append({"id": a["id"], "network": a["core"], "stops": a["stop_ids"],
                      "source": maps[a["core"]]["url"], "mapSha256": a["source_sha256"],
                      "reviewedGtfsSha256": a["gtfs_source_sha256"],
                      "upperBoundSeconds": a["walk_time_upper_bound_seconds"]})
    with zipfile.ZipFile(root / "sources/gtfs.zip") as feed:
        routes = {r["route_id"]: r for r in pipeline.rows(feed, "routes.txt")}
    boarding = []
    for rule in read(root / "annotations/boarding_points.json"):
        a = by_id[rule["observation_id"]]
        if a["stop_ids"] != [rule["gtfs_stop_id"]] or not a.get("pedestrian_link"):
            raise ValueError("Boarding-point evidence does not match its GTFS parent")
        points = []
        for node in rule["nodes"]:
            lines = sorted({routes[r]["route_short_name"] for r in node["route_ids"]})
            points.append({"id": node["node_id"], "name": policy.get("pointNames", {}).get(node["node_id"], node["name"]), "lines": lines})
        if len(points) != 2 or set(points[0]["lines"]) & set(points[1]["lines"]):
            raise ValueError("Boarding points cannot be represented by disjoint line assignments")
        boarding.append({"network": a["core"], "stop": rule["gtfs_stop_id"], "points": points,
                         "evidence": a.get("supporting_sources", [])})
    result = {"estimatedWalkSeconds": seconds, "reviewedLinks": links, "boardingPoints": boarding}
    # Removal is a separate reviewed migration, never an extraction side effect.
    old_points = {(b["network"], b["stop"], p["id"]) for b in previous["boardingPoints"] for p in b["points"]}
    new_points = {(b["network"], b["stop"], p["id"]) for b in boarding for p in b["points"]}
    if not old_points <= new_points:
        raise ValueError("Existing boarding-point correction would be lost")
    if not {r["id"] for r in previous["reviewedLinks"]} <= {r["id"] for r in links}:
        raise ValueError("Existing walking correction would be lost")
    return result


def propose_matches(root):
    """Names suggest stop IDs; they never approve a connection or walking duration."""
    import pipeline
    stops, _ = pipeline.gtfs()
    exact = {}
    for stop in stops:
        exact.setdefault(pipeline.norm(stop["stop_name"]), []).append(stop["stop_id"])
    candidates = []
    for name in ("symbol_candidates.json", "interchange_candidates.json"):
        for candidate in read(root / "data" / name):
            candidates.append(dict(candidate, gtfs_match_status="candidate",
                suggested_stops=[{"label": label["text"], "stop_ids": exact.get(pipeline.norm(label["text"]), [])}
                                 for label in candidate.get("label_candidates", [])], routing_ready=False))
    pipeline.dump(root / "data/connection_candidates.json", candidates)
    pipeline.csvout(root / "data/connection_candidates.csv", candidates)


def run(args):
    output = args.output.resolve()
    # Never overwrite a previous run: stale proposals must not survive a failed refresh.
    if output.exists():
        raise ValueError("Output already exists; choose a new --output directory: " + str(output))
    output.mkdir(parents=True)
    os.environ["MEJORCERCANIAS_MAP_WORKDIR"] = str(output)
    import pipeline
    import acquire
    pipeline.ROOT = output
    acquire.ROOT = output
    report = {"status": "error", "productionModified": False, "reasons": []}
    try:
        shutil.copytree(BASE / "annotations", output / "annotations")
        shutil.copytree(BASE / "sources", output / "sources")
        shutil.copy2(BASE / "connections.schema.json", output / "connections.schema.json")
        shutil.copy2(REPO / "docs/map-pipeline.md", output / "README.md")
        if args.gtfs:
            shutil.copy2(args.gtfs, output / "sources/gtfs.zip")
            pipeline.dump(output / "sources/gtfs-source.json", {
                "url": acquire.GTFS, "sha256": digest(args.gtfs), "retrieved_at": None})
        acquire.acquire(refresh=args.refresh)
        reviews_file = BASE / "gtfs-reviews.json"
        reviews = read(reviews_file) if reviews_file.exists() else []
        applied_review = apply_feed_review(output, reviews)
        if applied_review:
            pipeline.dump(output / "data/applied-gtfs-review.json", applied_review)
            report["appliedGtfsReview"] = applied_review["sha256"]
        reasons = review_reasons(output)
        report["reasons"] = reasons
        pipeline.extract()
        propose_matches(output)
        previous = read(REPO / "data/routing-corrections.json")
        pipeline.dump(output / "data/last-approved-routing-corrections.json", previous)
        report["maps"] = [{"core": m["core"], "sha256": m["sha256"], "url": m["url"]} for m in read(output / "sources/manifest.json")]
        report["gtfsSha256"] = digest(output / "sources/gtfs.zip")
        if reasons:
            report["status"] = "needs-review"
            return 2
        policy = read(BASE / "routing-policy.json")
        records = pipeline.build(policy["estimatedWalkSeconds"])
        candidate = corrections(output, policy, previous)
        pipeline.dump(output / "data/routing-corrections.proposed.json", candidate)
        diff = difflib.unified_diff(json.dumps(previous, ensure_ascii=False, indent=2).splitlines(True),
                                    json.dumps(candidate, ensure_ascii=False, indent=2).splitlines(True),
                                    fromfile="approved", tofile="proposed")
        (output / "data/routing-corrections.diff").write_text("".join(diff), encoding="utf-8")
        report.update(status="reviewed", observations=len(records), walkingLinks=len(candidate["reviewedLinks"]),
                      boardingPointGroups=len(candidate["boardingPoints"]), routingChanges=candidate != previous)
        import review
        review.ROOT = output
        review.main()
        if args.promote:
            target = REPO / "data/routing-corrections.json"
            # No rewriting when semantically identical; config bytes affect snapshot_version.
            if candidate != previous:
                temporary = target.with_suffix(".next.json")
                pipeline.dump(temporary, candidate)
                temporary.replace(target)
                report["productionModified"] = True
        return 0
    except Exception as error:
        report.update(status="error", error=str(error))
        return 1
    finally:
        pipeline.dump(output / "report.json", report)
        summary = ["# Map evidence pipeline", "", "Status: " + report["status"],
                   "", "Production configuration modified: " + str(report["productionModified"]),
                   "", "Review reasons: " + str(len(report["reasons"])), "",
                   "See report.json, sources/, extracted/ and data/. "
                   "A candidate is not an approved routing connection."]
        if report.get("error"):
            summary += ["", "Error: " + report["error"]]
        (output / "SUMMARY.md").write_text("\n".join(summary) + "\n", encoding="utf-8")
        print(json.dumps(report, ensure_ascii=True))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=REPO / "work/maps")
    parser.add_argument("--gtfs", type=Path, help="Use a local official ZIP (unless --refresh downloads again)")
    parser.add_argument("--refresh", action="store_true", help="Discover and download current official maps and GTFS")
    parser.add_argument("--promote", action="store_true", help="Write a verified proposal to routing-corrections.json; does not publish")
    sys.exit(run(parser.parse_args()))
