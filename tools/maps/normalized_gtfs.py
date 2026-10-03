"""Export a standard derived GTFS; routing engines do not consume custom rules."""
import csv
import io
import json
import zipfile
from routing_overlay import read_rows


def encode_rows(fields, rows):
    out = io.StringIO(newline='')
    writer = csv.DictWriter(out, fieldnames=fields)
    writer.writeheader(); writer.writerows(rows)
    return out.getvalue().encode('utf-8')


def export_feed(root, overlay):
    if any(e['effective_transfer_seconds'] is None for e in overlay['walking_edges']):
        raise ValueError('Derived GTFS requires an explicit transfer duration policy')
    nodes_by_stop = {}
    for n in overlay['nodes']:
        nodes_by_stop.setdefault(n['gtfs_stop_id'], []).append(n)
    overrides = {(e['trip_id'], e['stop_sequence']): e['boarding_node_id']
                 for e in overlay['stop_time_overrides']}
    target = root / 'data/routing_gtfs.zip'
    temporary = target.with_suffix('.tmp')
    report = {'derived_feed': True, 'source_gtfs_sha256': overlay['gtfs_sha256'],
              'coordinate_policy': 'Original station coordinates reused as approximate search coordinates; not measured boarding-point locations.',
              'transfer_policy': 'Explicit estimated minimum; not an official Renfe duration.',
              'router_requirement': 'Standard GTFS transfers.txt support; honor minimum transfer times, do not replace them with zero-cost proximity links.',
              'operating_scope': overlay['operating_scope'], 'replaced_stops': nodes_by_stop,
              'transfers': overlay['walking_edges']}
    try:
        with zipfile.ZipFile(root/'sources/gtfs.zip') as source, zipfile.ZipFile(temporary, 'w', zipfile.ZIP_DEFLATED) as dest:
            # Additional stop-reference tables need deliberate remapping before export.
            supported = {'agency.txt','calendar.txt','calendar_dates.txt','routes.txt','shapes.txt',
                         'stops.txt','stop_times.txt','transfers.txt','trips.txt','feed_info.txt'}
            if set(source.namelist()) - supported:
                raise ValueError('New GTFS tables require normalization review')
            for name in source.namelist():
                if name not in {'stops.txt', 'stop_times.txt', 'transfers.txt'}:
                    dest.writestr(name, source.read(name)); continue
                rows = read_rows(source, name)
                fields = list(rows[0])
                if name == 'stops.txt':
                    existing = {r['stop_id'] for r in rows}
                    if any(n['node_id'] in existing for n in overlay['nodes']):
                        raise ValueError('Local stop identifier collision')
                    result = []
                    for row in rows:
                        if row.get('parent_station') in nodes_by_stop:
                            raise ValueError('Existing station hierarchy requires review')
                        if row['stop_id'] not in nodes_by_stop:
                            result.append(row); continue
                        for node in nodes_by_stop[row['stop_id']]:
                            new = dict(row, stop_id=node['node_id'], stop_name=node['name'])
                            # Station-level amenities are not evidence about either boarding point.
                            for key in ['wheelchair_boarding', 'platform_code', 'parent_station', 'stop_code']:
                                if key in new: new[key] = ''
                            if 'location_type' in new: new['location_type'] = '0'
                            result.append(new)
                    rows = result
                elif name == 'stop_times.txt':
                    for row in rows:
                        if row['stop_id'] in nodes_by_stop:
                            row['stop_id'] = overrides[(row['trip_id'], row['stop_sequence'])]
                else:
                    # Never silently discard route/trip qualifiers or a transfer prohibition.
                    if any(r['from_stop_id'] in nodes_by_stop or r['to_stop_id'] in nodes_by_stop for r in rows):
                        raise ValueError('Existing transfer at a split station requires conflict review')
                    for key in ['from_stop_id', 'to_stop_id', 'transfer_type', 'min_transfer_time']:
                        if key not in fields: fields.append(key)
                    for edge in overlay['walking_edges']:
                        row = {key: '' for key in fields}
                        row.update(from_stop_id=edge['from_node'], to_stop_id=edge['to_node'],
                                   transfer_type='2', min_transfer_time=str(edge['effective_transfer_seconds']))
                        rows.append(row)
                dest.writestr(name, encode_rows(fields, rows))
        temporary.replace(target)
        (root/'data/routing_gtfs_provenance.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    except Exception:
        if temporary.exists(): temporary.unlink()
        # Avoid allowing an old artifact to masquerade as a successfully rebuilt feed.
        if target.exists(): target.unlink()
        raise
    return target
