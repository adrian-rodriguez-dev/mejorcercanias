"""Preprocess official Bilbao GTFS into immutable, compact station schedules."""
import argparse
import csv
import hashlib
import io
import json
import urllib.request
import zipfile
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

SOURCE = 'https://ssl.renfe.com/ftransit/Fichero_CER_FOMENTO/fomento_transit.zip'
ROUTES = {'60T0001C1', '60T0002C1', '60T0003C2', '60T0004C2', '60T0005C3', '60T0006C3', '60T0023C3', '60T0024C3'}
WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

def rows(archive, name):
    if name not in archive.namelist():
        return
    with io.TextIOWrapper(archive.open(name), encoding='utf-8-sig') as stream:
        for row in csv.DictReader(stream):
            yield {k.strip(): (v or '').strip() for k, v in row.items()}

def parse_date(value):
    return datetime.strptime(value, '%Y%m%d').date()

def service_dates(calendars, exceptions):
    result = defaultdict(set)
    for c in calendars:
        day, end = parse_date(c['start_date']), parse_date(c['end_date'])
        if (end - day).days not in range(0, 731):
            raise ValueError('Calendar range unsupported')
        while day <= end:
            if c[WEEK[day.weekday()]] == '1':
                result[c['service_id']].add(day.isoformat())
            day += timedelta(days=1)
    for e in exceptions:
        day = parse_date(e['date']).isoformat()
        if e['exception_type'] == '1':
            result[e['service_id']].add(day)
        elif e['exception_type'] == '2':
            result[e['service_id']].discard(day)
        else:
            raise ValueError('Unknown calendar exception')
    return result

def seconds(value):
    h, m, s = map(int, value.split(':'))
    if not (0 <= h < 48 and 0 <= m < 60 and 0 <= s < 60):
        raise ValueError('Unsupported GTFS time: ' + value)
    return h * 3600 + m * 60 + s

def compile_feed(archive, route_ids=ROUTES):
    routes = {r['route_id']: r for r in rows(archive, 'routes.txt') if r['route_id'] in route_ids}
    if not routes or set(route_ids) - routes.keys():
        raise ValueError('Expected Bilbao routes missing; review network selection')
    stops = {s['stop_id']: s for s in rows(archive, 'stops.txt')}
    dates = service_dates(rows(archive, 'calendar.txt'), rows(archive, 'calendar_dates.txt'))
    trips = {t['trip_id']: t for t in rows(archive, 'trips.txt') if t['route_id'] in routes}
    if not trips:
        raise ValueError('No Bilbao trips')
    if any(t['service_id'] not in dates for t in trips.values()):
        raise ValueError('Trip references unknown service')
    calls = defaultdict(list)
    for r in rows(archive, 'stop_times.txt'):
        if r['trip_id'] not in trips:
            continue
        if r['stop_id'] not in stops:
            raise ValueError('Unknown stop')
        pickup, dropoff = r.get('pickup_type', '0') or '0', r.get('drop_off_type', '0') or '0'
        calls[r['trip_id']].append((int(r['stop_sequence']), r['stop_id'], seconds(r['arrival_time']), seconds(r['departure_time']), pickup, dropoff))
    patterns = {}
    for trip_id, trip in trips.items():
        sequence = sorted(calls[trip_id])
        if len(sequence) < 2 or len({s[0] for s in sequence}) != len(sequence):
            raise ValueError('Invalid stop sequence ' + trip_id)
        last = -1
        for _, _, arrival, departure, _, _ in sequence:
            if arrival < last or departure < arrival:
                raise ValueError('Non-monotonic times ' + trip_id)
            last = departure
        line = routes[trip['route_id']]['route_short_name']
        key = (line, tuple(s[1:] for s in sequence))
        patterns.setdefault(key, set()).update(dates[trip['service_id']])
    calendars, calendar_ids = [], {}
    by_station = defaultdict(list)
    lines = defaultdict(set)
    for (line, sequence), active in sorted(patterns.items()):
        if not active:
            continue
        days = tuple(sorted(active))
        if days not in calendar_ids:
            calendar_ids[days] = len(calendars)
            calendars.append(days)
        calendar = calendar_ids[days]
        pattern_id = hashlib.sha256(repr((line, sequence)).encode()).hexdigest()[:16]
        for index, (stop, arrival, departure, pickup, _) in enumerate(sequence):
            lines[stop].add(line)
            later = [[s[0], s[1]] for s in sequence[index + 1:] if s[4] == '0']
            if pickup != '0' or not later:
                continue
            by_station[stop].append([pattern_id, line, sequence[-1][0], departure, calendar, later])
    all_dates = sorted({day for calendar in calendars for day in calendar})
    if not all_dates:
        raise ValueError('No dated services')
    stations = [{'id': s, 'name': stops[s]['stop_name'], 'network': 'bilbao', 'lines': sorted(lines[s])} for s in sorted(lines, key=lambda s: stops[s]['stop_name'])]
    manifest = {'schemaVersion': 1, 'coverageDates': all_dates, 'validFrom': all_dates[0], 'validTo': all_dates[-1], 'calendars': calendars, 'stations': stations}
    return manifest, dict(by_station)

def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--zip', type=Path, help='Use an already downloaded official ZIP')
    parser.add_argument('--output', type=Path, help='Stage generated output in this directory')
    args = parser.parse_args()
    root = args.output or Path(__file__).resolve().parents[1]
    archive_path = args.zip or root / 'work/gtfs/renfe.zip'
    if not args.zip:
        archive_path.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(SOURCE, timeout=90) as response:
            archive_path.write_bytes(response.read())
    raw = archive_path.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        manifest, station_data = compile_feed(archive)
    version = digest[:16]
    manifest.update({'version': version, 'sha256': digest, 'sourceUrl': SOURCE, 'downloadedAt': datetime.now(timezone.utc).isoformat() if not args.zip else None, 'checkedAt': datetime.now(timezone.utc).isoformat() if not args.zip else None, 'publishedAt': None, 'license': 'CC BY 4.0', 'attribution': 'Renfe Operadora'})
    # Validate all input before publishing files. Publish manifest last; builds
    # reference immutable version paths and cannot mix successive snapshots.
    for station in manifest['stations']:
        write_json(root / f'public/data/renfe/{version}/{station["id"]}.json', {'version': version, 'stationId': station['id'], 'patterns': station_data.get(station['id'], [])})
    temporary = root / 'src/data/renfe-manifest.next.json'
    write_json(temporary, manifest)
    temporary.replace(root / 'src/data/renfe-manifest.json')
    print(json.dumps({'stations': len(manifest['stations']), 'patterns': sum(map(len, station_data.values())), 'from': manifest['validFrom'], 'to': manifest['validTo'], 'version': version}))

if __name__ == '__main__':
    main()
