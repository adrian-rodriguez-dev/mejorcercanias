"""Small regression fixtures; the full corpus is checked separately."""
import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import zipfile

import pipeline
import run
from routing_overlay import compile_overlay


class MapPipelineTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.old_root = pipeline.ROOT
        pipeline.ROOT = self.root
        self.addCleanup(setattr, pipeline, "ROOT", self.old_root)
        (self.root / "sources").mkdir()
        (self.root / "annotations").mkdir()
        (self.root / "data").mkdir()
        (self.root / "sources/sevilla.pdf").write_bytes(b"map fixture")
        map_hash = run.digest(self.root / "sources/sevilla.pdf")
        self.feed = self.root / "sources/gtfs.zip"
        with zipfile.ZipFile(self.feed, "w") as z:
            z.writestr("routes.txt", "route_id,route_short_name\na,C1\nb,C3\n")
            z.writestr("trips.txt", "trip_id,route_id\nt1,a\nt3,b\n")
            z.writestr("stop_times.txt", "trip_id,stop_id,stop_sequence\nt1,50700,1\nt3,50700,1\n")
        feed_hash = run.digest(self.feed)
        self.maps = [{"core": "sevilla", "file": "sources/sevilla.pdf", "sha256": map_hash, "url": "https://www.renfe.com/map.pdf"}]
        self.observation = {"id": "sevilla-139", "core": "sevilla", "kind": "internal_interchange",
                            "stop_ids": ["50700"], "source_sha256": map_hash, "gtfs_source_sha256": feed_hash,
                            "review_status": "visual_reviewed", "gtfs_match_status": "reviewed", "pedestrian_link": True,
                            "walk_time_upper_bound_seconds": 600, "map_endpoints": [{"printed_label": None, "resolved_name": "Los Rosales Apeadero"}]}
        self.rule = {"observation_id": "sevilla-139", "gtfs_stop_id": "50700", "gtfs_sha256": feed_hash, "map_sha256": map_hash,
                     "nodes": [{"node_id": "mc:50700:c1", "name": "C1", "route_ids": ["a"]},
                               {"node_id": "mc:50700:c3", "name": "C3", "route_ids": ["b"]}]}
        self.previous = {"estimatedWalkSeconds": 600, "reviewedLinks": [],
                         "boardingPoints": [{"network": "sevilla", "stop": "50700", "points": [{"id": "mc:50700:c1"}, {"id": "mc:50700:c3"}]}]}
        self.write("sources/manifest.json", self.maps)
        self.write("annotations/legends.json", {"sevilla": {"source_sha256": map_hash, "map_bottom": 1000, "icons": {}}})
        self.write("annotations/connections.json", [self.observation])
        self.write("annotations/boarding_points.json", [self.rule])
        self.write("data/connections.json", [self.observation])

    def write(self, path, value):
        pipeline.dump(self.root / path, value)

    def test_los_rosales_round_trip_keeps_two_points_and_estimate(self):
        self.assertEqual(run.review_reasons(self.root), [])
        result = run.corrections(self.root, {"estimatedWalkSeconds": 600}, self.previous)
        self.assertEqual(result["estimatedWalkSeconds"], 600)
        points = result["boardingPoints"][0]["points"]
        self.assertEqual([p["lines"] for p in points], [["C1"], ["C3"]])
        overlay = compile_overlay(self.root, [self.observation], 600)
        self.assertEqual(len(overlay["walking_edges"]), 2)
        self.assertTrue(all(e["effective_transfer_seconds"] == 600 for e in overlay["walking_edges"]))
        self.assertTrue(overlay["constraints"][0]["disable_implicit_same_stop_transfer_between_nodes"])
        self.assertIsNone(run.read(self.root / "annotations/connections.json")[0]["map_endpoints"][0]["printed_label"])

    def test_changed_map_invalidates_legend_and_observations(self):
        (self.root / "sources/sevilla.pdf").write_bytes(b"new map")
        self.maps[0]["sha256"] = run.digest(self.root / "sources/sevilla.pdf")
        self.write("sources/manifest.json", self.maps)
        kinds = {r["kind"] for r in run.review_reasons(self.root)}
        self.assertTrue({"map_changed", "legend_changed", "boarding_points_changed"} <= kinds)
        with self.assertRaisesRegex(ValueError, "Review required"):
            run.corrections(self.root, {"estimatedWalkSeconds": 600}, self.previous)

    def test_gtfs_change_requires_crosswalk_review(self):
        with zipfile.ZipFile(self.feed, "a") as z:
            z.writestr("new.txt", "changed")
        self.assertIn("gtfs_changed", {r["kind"] for r in run.review_reasons(self.root)})

    def test_corrupt_source_rejected(self):
        (self.root / "sources/sevilla.pdf").write_bytes(b"corrupt")
        with self.assertRaisesRegex(ValueError, "integrity"):
            run.review_reasons(self.root)

    def test_disappearing_boarding_point_is_not_silently_removed(self):
        self.write("annotations/boarding_points.json", [])
        with self.assertRaisesRegex(ValueError, "would be lost"):
            run.corrections(self.root, {"estimatedWalkSeconds": 600}, self.previous)

    def test_unknown_route_cannot_use_parent_shortcut(self):
        with zipfile.ZipFile(self.feed, "a") as z:
            z.writestr("other.txt", "new route fixture")
        rule = copy.deepcopy(self.rule)
        rule["gtfs_sha256"] = run.digest(self.feed)
        rule["nodes"][1]["route_ids"] = ["unknown"]
        self.write("annotations/boarding_points.json", [rule])
        with self.assertRaises(ValueError):
            compile_overlay(self.root, [self.observation], 600)

    def test_parking_never_becomes_a_routing_edge(self):
        parking = dict(self.observation, id="parking", kind="mode_connection", mode="parking", stop_ids=["50700"])
        self.write("annotations/connections.json", [self.observation, parking])
        self.write("data/connections.json", [self.observation, parking])
        result = run.corrections(self.root, {"estimatedWalkSeconds": 600}, self.previous)
        self.assertEqual(result["reviewedLinks"], [])

    def test_supporting_evidence_hash_is_checked(self):
        (self.root / "sources/older.pdf").write_bytes(b"changed supporting map")
        self.observation["supporting_sources"] = [{"local_file": "sources/older.pdf", "sha256": "0" * 64}]
        self.write("annotations/connections.json", [self.observation])
        self.assertIn("support_changed", {r["kind"] for r in run.review_reasons(self.root)})

    def test_svg_extracts_geometry_without_trusting_old_legend(self):
        source = self.root / "sources/sevilla.svg"
        source.write_text('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><circle cx="40" cy="60" r="10" fill="white" stroke="red"/><text x="60" y="60">Station</text></svg>')
        self.maps[0].update(file="sources/sevilla.svg", sha256=run.digest(source))
        self.write("sources/manifest.json", self.maps)
        pipeline.extract()
        self.assertTrue((self.root / "extracted/sevilla-1.svg").exists())
        self.assertTrue((self.root / "extracted/sevilla-1-vectors.json").exists())
        self.assertEqual(run.read(self.root / "data/symbol_candidates.json"), [])

    def test_changed_evidence_run_reports_review_without_proposal(self):
        from argparse import Namespace
        import acquire
        self.observation["gtfs_source_sha256"] = "0" * 64
        self.write("annotations/connections.json", [self.observation])
        self.write("connections.schema.json", {})
        destination = self.root / "new-run"
        production = (run.REPO / "data/routing-corrections.json").read_bytes()
        with patch.object(run, "BASE", self.root), patch.object(acquire, "acquire"), patch.object(pipeline, "extract"), patch.object(run, "propose_matches"):
            code = run.run(Namespace(output=destination, gtfs=None, refresh=False, promote=True))
        self.assertEqual(code, 2)
        self.assertEqual(run.read(destination / "report.json")["status"], "needs-review")
        self.assertFalse((destination / "data/routing-corrections.proposed.json").exists())
        self.assertEqual((run.REPO / "data/routing-corrections.json").read_bytes(), production)

    def test_download_rejects_html_disguised_as_pdf(self):
        import acquire
        from unittest.mock import MagicMock
        response = MagicMock()
        response.__enter__.return_value = response
        response.read.return_value = b"<html>Temporarily unavailable</html>"
        response.geturl.return_value = "https://www.renfe.com/map.pdf"
        response.headers = {"Content-Type": "text/html"}
        with patch.object(acquire.urllib.request, "urlopen", return_value=response) as fetch, patch.object(acquire.time, "sleep"):
            with self.assertRaisesRegex(ValueError, "Expected PDF, got text/html"):
                acquire.fetch(response.geturl(), expected=".pdf")
            self.assertEqual(fetch.call_count, 3)

    def test_existing_output_is_never_reused(self):
        from argparse import Namespace
        with self.assertRaisesRegex(ValueError, "already exists"):
            run.run(Namespace(output=self.root, gtfs=None, refresh=False, promote=False))


if __name__ == "__main__":
    unittest.main()
