"""Compile reviewed physical boarding points without modifying the original GTFS."""
import csv
import io
import json
import hashlib
import zipfile


def read_rows(z, name):
    return [{k.strip(): (v or '').strip() for k, v in r.items()}
            for r in csv.DictReader(io.TextIOWrapper(z.open(name), encoding='utf-8-sig'))]


def assign_node(rule, route_id):
    matches = [n['node_id'] for n in rule['nodes'] if route_id in n['route_ids']]
    if len(matches) != 1:
        raise ValueError('Unreviewed or ambiguous boarding point: ' + route_id)
    return matches[0]


def transfer_seconds(edge, estimated_seconds=None):
    official = edge.get('official_min_transfer_seconds')
    if official is not None:
        return official
    if estimated_seconds is not None:
        if type(estimated_seconds) is not int or estimated_seconds <= 0:
            raise ValueError('Estimated transfer time must be a positive integer')
        return estimated_seconds
    return None


def can_transfer(from_node, to_node, available_seconds, edges, estimated_seconds=None):
    """Check this overlay's cross-node constraint; not a full journey planner."""
    for edge in edges:
        if (edge['from_node'], edge['to_node']) == (from_node, to_node):
            required = transfer_seconds(edge, estimated_seconds)
            return required is not None and available_seconds >= required
    return False


def compile_overlay(root, observations, estimated_seconds=None):
    rules = json.loads((root / 'annotations/boarding_points.json').read_text(encoding='utf-8'))
    feed = root / 'sources/gtfs.zip'
    feed_hash = hashlib.sha256(feed.read_bytes()).hexdigest()
    by_id = {r['id']: r for r in observations}
    nodes, edges, events, constraints = [], [], [], []
    with zipfile.ZipFile(feed) as z:
        trips = {r['trip_id']: r for r in read_rows(z, 'trips.txt')}
        stop_times = read_rows(z, 'stop_times.txt')
    for rule in rules:
        evidence = by_id[rule['observation_id']]
        if rule['gtfs_sha256'] != feed_hash or rule['map_sha256'] != evidence['source_sha256']:
            raise ValueError('Boarding-point rule requires review after source change')
        for source in evidence.get('supporting_sources', []):
            if source.get('local_file') and hashlib.sha256((root / source['local_file']).read_bytes()).hexdigest() != source['sha256']:
                raise ValueError('Supporting source changed')
        ids = [n['node_id'] for n in rule['nodes']]
        if len(ids) != len(set(ids)) or len(ids) != 2:
            raise ValueError('Expected two unique physical nodes')
        nodes.extend(dict(n, gtfs_stop_id=rule['gtfs_stop_id'], observation_id=rule['observation_id']) for n in rule['nodes'])
        for a, b in [ids, ids[::-1]]:
            edge = {'from_node': a, 'to_node': b, 'observation_id': rule['observation_id'],
                    'official_min_transfer_seconds': None,
                    'map_walk_upper_bound_seconds': evidence['walk_time_upper_bound_seconds'],
                    'map_walk_upper_bound_exclusive': True}
            edge['effective_transfer_seconds'] = transfer_seconds(edge, estimated_seconds)
            edge['duration_basis'] = 'user_estimate' if estimated_seconds is not None else 'unknown'
            edge['enabled_by_duration_policy'] = estimated_seconds is not None
            edges.append(edge)
        constraints.append({'gtfs_stop_id': rule['gtfs_stop_id'], 'disable_implicit_same_stop_transfer_between_nodes': True,
                            'parent_is_boardable': False, 'unknown_route_action': 'reject_build'})
        for st in stop_times:
            if st['stop_id'] != rule['gtfs_stop_id']:
                continue
            route_id = trips[st['trip_id']]['route_id']
            events.append({'trip_id': st['trip_id'], 'stop_sequence': st['stop_sequence'],
                           'gtfs_stop_id': st['stop_id'], 'route_id': route_id,
                           'boarding_node_id': assign_node(rule, route_id)})
    result = {'version': 1, 'gtfs_sha256': feed_hash, 'scope': 'reviewed boarding-point overrides only',
              'policy': 'estimated' if estimated_seconds is not None else 'strict',
              'operating_scope': 'normal rail layout; verify service date and temporary disruptions before routing',
              'integration_contract': 'Remap events before routing. Never connect the parent as a boarding node. Preserve GTFS route/trip transfer restrictions, calendars and pickup/dropoff rules. Same-trip continuation is not a transfer.',
              'nodes': nodes, 'walking_edges': edges, 'constraints': constraints,
              'stop_time_overrides': events}
    (root / 'data/routing_overlay.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    with (root / 'data/boarding_point_overrides.csv').open('w', encoding='utf-8-sig', newline='') as f:
        w = csv.DictWriter(f, fieldnames=['trip_id', 'stop_sequence', 'gtfs_stop_id', 'route_id', 'boarding_node_id'])
        w.writeheader(); w.writerows(events)
    return result
