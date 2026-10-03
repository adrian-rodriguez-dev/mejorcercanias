"""Compile routing separately from station boards; no GTFS parsing in browsers."""
import json
from pathlib import Path
from collections import defaultdict

CONFIG = Path(__file__).resolve().parents[1]/'data/routing-corrections.json'

def compile_routing(archive, manifest):
    from import_gtfs import rows, seconds, service_dates, NETWORKS
    config = json.loads(CONFIG.read_text(encoding='utf-8'))
    routes = {r['route_id']:r for r in rows(archive,'routes.txt')}
    trips = {t['trip_id']:t for t in rows(archive,'trips.txt')}
    dates = service_dates(rows(archive,'calendar.txt'),rows(archive,'calendar_dates.txt'))
    calls = defaultdict(list)
    for s in rows(archive,'stop_times.txt'):
        calls[s['trip_id']].append(s)
    result = {}
    for network in manifest['networks']:
        nid = network['id']; prefix = next(k for k,v in NETWORKS.items() if v[0]==nid)
        catalog = {s['id']:s for s in manifest['stations'] if s['network']==nid}
        sid = lambda s: s if nid=='bilbao' else nid+'-'+s
        nodes = {s:{'stationId':s,'name':v['name']} for s,v in catalog.items()}
        groups = {s:[s] for s in catalog}
        splits = [s for s in config['boardingPoints'] if s['network']==nid]
        for split in splits:
            parent = sid(split['stop'])
            if parent not in catalog: raise ValueError('Split station missing: '+parent)
            groups[parent]=[p['id'] for p in split['points']]
            del nodes[parent]
            for p in split['points']: nodes[p['id']]={'stationId':parent,'name':p['name']}
        excluded_ids = {t['tripId'] for t in network.get('excludedTrips',[])}
        out=[]; calendars=[]; calendar_ids={}
        for tid,t in trips.items():
            if tid in excluded_ids: continue
            route=routes[t['route_id']]
            if not t['route_id'].startswith(prefix+'T') or route['route_short_name'] not in network['lines']: continue
            seq=sorted(calls[tid],key=lambda s:int(s['stop_sequence']))
            if not seq or any(sid(s['stop_id']) not in catalog for s in seq): continue
            days=tuple(sorted(dates[t['service_id']]))
            if not days: continue
            if days not in calendar_ids: calendar_ids[days]=len(calendars);calendars.append(days)
            cs=[]
            for s in seq:
                node=sid(s['stop_id'])
                for split in splits:
                    if s['stop_id']==split['stop']:
                        matches=[p for p in split['points'] if route['route_short_name'] in p['lines']]
                        if len(matches)!=1: raise ValueError('Unreviewed boarding point: '+tid)
                        node=matches[0]['id']
                cs.append([node,seconds(s['arrival_time']),seconds(s['departure_time']),int(s.get('pickup_type') or 0),int(s.get('drop_off_type') or 0)])
            if any(a[2]>b[1] for a,b in zip(cs,cs[1:])) or any(c[1]>c[2] for c in cs): raise ValueError('Non-monotonic routing trip')
            out.append({'id':tid,'route':t['route_id'],'line':route['route_short_name'],'calendar':calendar_ids[days],'calls':cs,**({'mode':'bus'} if route.get('route_type')=='3' else {})})
        transfers=[]
        for row in rows(archive,'transfers.txt'):
            a,b=sid(row['from_stop_id']),sid(row['to_stop_id'])
            if a not in groups or b not in groups: continue
            if len(groups[a])!=1 or len(groups[b])!=1: raise ValueError('Transfer conflicts with split station; review required')
            typ=int(row.get('transfer_type') or 0)
            if typ not in (0,1,2,3): raise ValueError('Unsupported transfer type')
            transfers.append({'from':a,'to':b,'seconds':None if typ==3 else int(row.get('min_transfer_time') or (0 if typ==1 else 300)),
                **{k:row[k] for k in ['from_route_id','to_route_id','from_trip_id','to_trip_id'] if row.get(k)}})
        applied=[]
        for link in config['reviewedLinks']:
            if link['network']!=nid: continue
            a,b=map(sid,link['stops'])
            if a not in groups or b not in groups: continue
            if any(t['from'] in [a,b] and t['to'] in [a,b] for t in transfers): raise ValueError('Review overlap between GTFS and map transfer')
            for x,y in [(a,b),(b,a)]: transfers.append({'from':x,'to':y,'seconds':config['estimatedWalkSeconds'],'estimated':True})
            applied.append(link)
        for split in splits:
            a,b=[p['id'] for p in split['points']]
            for x,y in [(a,b),(b,a)]: transfers.append({'from':x,'to':y,'seconds':config['estimatedWalkSeconds'],'estimated':True})
            applied.append(split)
        result[nid]={'schemaVersion':1,'network':nid,'nodes':nodes,'groups':groups,'trips':out,'calendars':calendars,'transfers':transfers,'evidence':applied}
    return result
