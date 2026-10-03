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

def compile_feed(archive, route_ids=None, allow_incomplete=False):
    if route_ids is None:
        return compile_networks(archive)
    routes = {r['route_id']: r for r in rows(archive, 'routes.txt') if r['route_id'] in route_ids}
    if not routes or set(route_ids) - routes.keys():
        raise ValueError('Expected Bilbao routes missing; review network selection')
    stops = {s['stop_id']: s for s in rows(archive, 'stops.txt')}
    if any(any(marker in s['stop_name'] for marker in ('Ãƒ', 'Ã‚', '\ufffd')) for s in stops.values()):
        raise ValueError('Invalid station name encoding')
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
    excluded_trips = []
    for trip_id, trip in trips.items():
        sequence = sorted(calls[trip_id])
        if len(sequence) < 2 and allow_incomplete:
            excluded_trips.append({'tripId':trip_id,'reason':'fewer-than-two-stops','stopCount':len(sequence)})
            continue
        if len(sequence) < 2 or len({s[0] for s in sequence}) != len(sequence):
            raise ValueError('Invalid stop sequence ' + trip_id)
        last = -1
        for _, _, arrival, departure, _, _ in sequence:
            if arrival < last or departure < arrival:
                raise ValueError('Non-monotonic times ' + trip_id)
            last = departure
        line = routes[trip['route_id']]['route_short_name']
        mode = 'bus' if routes[trip['route_id']].get('route_type') == '3' else 'train'
        key = (line, mode, tuple(s[1:] for s in sequence))
        patterns.setdefault(key, set()).update(dates[trip['service_id']])
    calendars, calendar_ids = [], {}
    by_station = defaultdict(list)
    lines = defaultdict(set)
    for (line, mode, sequence), active in sorted(patterns.items()):
        if not active:
            continue
        days = tuple(sorted(active))
        if days not in calendar_ids:
            calendar_ids[days] = len(calendars)
            calendars.append(days)
        calendar = calendar_ids[days]
        pattern_id = hashlib.sha256(repr((line, mode, sequence)).encode()).hexdigest()[:16]
        for index, (stop, arrival, departure, pickup, _) in enumerate(sequence):
            lines[stop].add(line)
            later = [[s[0], s[1]] for s in sequence[index + 1:] if s[4] == '0']
            if pickup != '0' or not later:
                continue
            by_station[stop].append([pattern_id, line, sequence[-1][0], departure, calendar, later] + ([mode] if mode == 'bus' else []))
    all_dates = sorted({day for calendar in calendars for day in calendar})
    if not all_dates:
        raise ValueError('No dated services')
    stations = [{'id': s, 'name': stops[s]['stop_name'], 'network': 'bilbao', 'lines': sorted(lines[s])} for s in sorted(lines, key=lambda s: stops[s]['stop_name'])]
    manifest = {'schemaVersion': 1, 'coverageDates': all_dates, 'validFrom': all_dates[0], 'validTo': all_dates[-1], 'calendars': calendars, 'stations': stations}
    manifest['excludedTrips'] = excluded_trips
    return manifest, dict(by_station)


TRANSFORM_VERSION = 'networks-routing-v3'
NETWORKS = {'10':('madrid','Madrid'), '51':('rodalies','Rodalies de Catalunya'), '30':('sevilla','Sevilla'), '31':('cadiz','Cádiz'), '32':('malaga','Málaga'), '40':('valencia','València'), '41':('murcia-alicante','Murcia/Alicante'), '45':('cartagena','Cartagena'), '46':('ferrol','Ferrol'), '47':('leon','León'), '60':('bilbao','Bilbao'), '61':('san-sebastian','San Sebastián'), '62':('cantabria','Cantabria'), '70':('zaragoza','Zaragoza')}
def snapshot_version(raw):
    return hashlib.sha256(raw + TRANSFORM_VERSION.encode() + (Path(__file__).resolve().parents[1]/'data/routing-corrections.json').read_bytes()).hexdigest()[:16]
def compile_networks(archive):
    all_routes=list(rows(archive,'routes.txt'))
    calendars=[]; stations=[]; data={}; networks=[]; excluded=[]
    for prefix,(nid,name) in NETWORKS.items():
        routes=[r for r in all_routes if r['route_id'].startswith(prefix+'T') and (r['route_short_name'].startswith('C') and not r['route_short_name'].startswith('CR') or nid=='rodalies' and r['route_short_name'].startswith('R') or nid=='cadiz' and r['route_short_name']=='T1')]
        if not routes: continue
        lines=sorted({r['route_short_name'] for r in routes})
        try: m,files=compile_feed(archive,{r['route_id'] for r in routes},allow_incomplete=nid in ('madrid','rodalies'))
        except ValueError as error:
            excluded.append({'id':nid,'reason':str(error)}); print('Excluded '+nid+': '+str(error)); continue
        offset=len(calendars);calendars.extend(m['calendars'])
        sid=lambda value: value if nid=='bilbao' else nid+'-'+value
        for station in m['stations']:
            station.update(id=sid(station['id']),network=nid)
            stations.append(station)
        for origin,patterns in files.items():
            data[sid(origin)]=[[p[0],p[1],sid(p[2]),p[3],p[4]+offset,[[sid(stop),at] for stop,at in p[5]],*p[6:]] for p in patterns]
        colors={line:next((r.get('route_color','') for r in routes if r['route_short_name']==line and len(r.get('route_color',''))==6),'789B88') for line in lines}
        networks.append({'excludedTrips':m['excludedTrips'], 'description': 'Incluye servicios regionales, RG, RT y RL del GTFS de Renfe.' if nid=='rodalies' else '', 'id':nid,'name':name,'lines':lines,'colors':colors,'coverageDates':m['coverageDates'],'validFrom':m['validFrom'],'validTo':m['validTo']})
    coverage=sorted({d for n in networks for d in n['coverageDates']})
    if not coverage: raise ValueError('No supported networks')
    manifest = {'schemaVersion':1,'transformVersion':TRANSFORM_VERSION,'networks':networks,'excludedNetworks':excluded,'stations':stations,'calendars':calendars,'coverageDates':coverage,'validFrom':coverage[0],'validTo':coverage[-1]}
    from routing_data import compile_routing
    manifest['_routing'] = compile_routing(archive, manifest)
    manifest['routingNetworks'] = list(manifest['_routing'])
    return manifest,data

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
    routing = manifest.pop('_routing', {})
    version = snapshot_version(raw)
    for network, graph in routing.items():
        write_json(root / f'public/data/renfe/{version}/routing-{network}.json', dict(graph, version=version))
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

