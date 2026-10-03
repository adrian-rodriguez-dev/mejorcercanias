"""MejorCercanias: versioned Renfe PDF/SVG evidence extraction. Python 3.11+."""
from pathlib import Path
import os
import argparse, csv, hashlib, io, json, math, re, unicodedata, zipfile, difflib
import pymupdf as fitz

ROOT = Path(os.environ.get("MEJORCERCANIAS_MAP_WORKDIR", Path(__file__).resolve().parents[2] / "work/maps"))
def dump(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2, default=list), encoding='utf-8')
def norm(s):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', s.lower()).encode('ascii','ignore').decode())
def rows(z, name):
    return [{k.strip(): (v or '').strip() for k,v in r.items()} for r in csv.DictReader(io.TextIOWrapper(z.open(name), encoding='utf-8-sig'))]
def dist(point, rect):
    x,y=point; a,b,c,d=rect
    return math.hypot(max(a-x,0,x-c),max(b-y,0,y-d))
def label_distance(point, label):
    poly=label.get('polygon')
    if not poly:return dist(point,label['bbox'])
    x,y=point; distances=[]; signs=[]
    for (a,b),(c,d) in zip(poly,poly[1:]+poly[:1]):
        dx,dy=c-a,d-b; den=dx*dx+dy*dy
        t=max(0,min(1,((x-a)*dx+(y-b)*dy)/den)) if den else 0
        distances.append(math.hypot(x-a-t*dx,y-b-t*dy));signs.append(dx*(y-b)-dy*(x-a))
    if all(s>=0 for s in signs) or all(s<=0 for s in signs):return 0
    return min(distances)
def center(r): return [(r[0]+r[2])/2,(r[1]+r[3])/2]
def signature(d):
    pts=[]; ops=[]
    for item in d['items']:
        ops.append(item[0])
        for p in item[1:]:
            if isinstance(p,fitz.Point): pts.append((p.x,p.y))
            elif isinstance(p,fitz.Rect): pts.extend([(p.x0,p.y0),(p.x1,p.y1)])
            elif isinstance(p,fitz.Quad): pts.extend([(v.x,v.y) for v in p])
    if not pts: return None
    ox=sum(p[0] for p in pts)/len(pts); oy=sum(p[1] for p in pts)/len(pts)
    scale=math.sqrt(sum((x-ox)**2+(y-oy)**2 for x,y in pts)/len(pts))
    if scale<1e-5: return None
    # Ordered distances to two anchors: translation, uniform scale and rotation invariant.
    values=[math.hypot(x-a,y-b)/scale for a,b in (pts[0],pts[len(pts)//2]) for x,y in pts]
    return ''.join(ops), values
def similar(a,b):
    return a and b and a[0]==b[0] and len(a[1])==len(b[1]) and max(abs(x-y) for x,y in zip(a[1],b[1]))<0.025
def labels(page):
    result=[]
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines',[]):
            text=''.join(s['text'] for s in l['spans']).strip()
            if len(norm(text))>2 and not re.fullmatch(r'[CRTL][- ]?\d+[ab]?',text):
                q=fitz.recover_line_quad(l)
                result.append({'text':text,'bbox':list(l['bbox']),'polygon':[list(q.ul),list(q.ur),list(q.lr),list(q.ll)]})
    return result
def nearby(point, ls, n=3):
    return [dict(l,distance_pt=round(label_distance(point,l),2)) for l in sorted(ls,key=lambda l:label_distance(point,l))[:n]]
def icon_labels(point, ls, n=3):
    def score(l):
        q=l.get('polygon')
        if not q:return label_distance(point,l)
        ax,ay=q[0];bx,by=q[1];w=math.hypot(bx-ax,by-ay)
        if not w:return 1e9
        ux,uy=(bx-ax)/w,(by-ay)/w
        h=math.hypot(q[3][0]-ax,q[3][1]-ay)
        dx,dy=point[0]-ax,point[1]-ay
        along=dx*ux+dy*uy;across=-dx*uy+dy*ux
        return max(-along,0,along-w)+8*abs(across-h/2)
    ls=[l for l in ls if not re.search(r'zone|zona|gunea|civis|verde|tarifa',l['text'],re.I) and not re.fullmatch(r'[0-9 ]+[ABab]?',l['text'])]
    return [dict(l,association_score=round(score(l),2)) for l in sorted(ls,key=score)[:n]]
def csvout(path, data):
    if not data: path.write_text('',encoding='utf-8');return
    fields=list(dict.fromkeys(k for r in data for k in r))
    with path.open('w',newline='',encoding='utf-8-sig') as f:
        w=csv.DictWriter(f,fieldnames=fields);w.writeheader()
        for r in data:w.writerow({k:json.dumps(v,ensure_ascii=False) if isinstance(v,(dict,list)) else v for k,v in r.items()})

def extract():
    manifest=json.loads((ROOT/'sources/manifest.json').read_text(encoding="utf-8"))
    config=json.loads((ROOT/'annotations/legends.json').read_text(encoding='utf-8'))
    all_symbols=[]; all_interchanges=[]
    (ROOT/'data').mkdir(parents=True,exist_ok=True)
    for m in manifest:
        core=m['core']; source=ROOT/m['file']
        if hashlib.sha256(source.read_bytes()).hexdigest()!=m['sha256']:raise ValueError('Source hash mismatch: '+core)
        doc=fitz.open(source)
        if source.suffix.lower()=='.svg': doc=fitz.open('pdf',doc.convert_to_pdf())
        for page in doc:
            pn=page.number+1; dr=page.get_drawings(); ls=labels(page); scale=1500/page.rect.width
            trusted = config[core].get('source_sha256') == m['sha256']
            cutoff=config[core]['map_bottom']/scale if trusted else page.rect.height
            station_ls=[l for l in ls if 100/scale<l['bbox'][1]<cutoff]
            stem=f'{core}-{pn}'
            dest=ROOT/'extracted';dest.mkdir(exist_ok=True)
            (dest/f'{stem}.svg').write_text(page.get_svg_image(text_as_path=False),encoding='utf-8')
            (dest/f'{stem}.txt').write_text(page.get_text(),encoding='utf-8')
            dump(dest/f'{stem}-text.json',ls)
            vectors=[{'id':i,'bbox':list(d['rect']),'type':d['type'],'fill':d['fill'],'stroke':d['color'],'commands':[[v if isinstance(v,(str,int,float)) else list(v) for v in item] for item in d['items']]} for i,d in enumerate(dr)]
            dump(dest/f'{stem}-vectors.json',vectors)
            sigs=[signature(d) for d in dr]
            def background(i):
                r=dr[i]['rect']
                for j in range(i-1,max(-1,i-9),-1):
                    d=dr[j];b=d['rect']
                    if len(d['items'])==4 and d['fill'] and b.contains(r) and b.width*b.height<12*max(1,r.width*r.height):
                        return tuple(round(v,2) for v in d['fill'])
                return None
            symbols=[]
            for kind,(x,y) in (config[core]['icons'] if trusted else {}).items():
                pt=(x/scale,y/scale)
                choices=[i for i,d in enumerate(dr) if dist(pt,d['rect'])<8/scale and max(d['rect'].width,d['rect'].height)<32/scale and len(d['items'])>5]
                if not choices:
                    images=page.get_image_info(hashes=True)
                    templates=[im for im in images if dist(pt,im['bbox'])<3/scale and max(fitz.Rect(im['bbox']).width,fitz.Rect(im['bbox']).height)<32/scale]
                    if templates:
                        template=templates[0]
                        for im in images:
                            if im['digest']!=template['digest'] or im['bbox'][3]>=cutoff:continue
                            symbols.append({'id':f'{core}-p{pn}-image{im["number"]}-{kind}','core':core,'kind':kind,'page':pn,'vector_id':None,'bbox':list(im['bbox']),'image_digest':im['digest'].hex(),'source_sha256':m['sha256'],'source_url':m['url'],'label_candidates':icon_labels(center(im['bbox']),station_ls),'status':'candidate'})
                    else:print('Unsupported legend glyph:',core,kind)
                    continue
                template=max(choices,key=lambda i:len(dr[i]['items']))
                for i,d in enumerate(dr):
                    if d['rect'].y1>=cutoff or not similar(sigs[template],sigs[i]):continue
                    if d['fill']!=dr[template]['fill']:continue
                    if kind in ('other_train','tram') and background(template)!=background(i):continue
                    box=list(d['rect']); p=center(box)
                    symbols.append({'id':f'{core}-p{pn}-v{i}-{kind}','core':core,'kind':kind,'page':pn,'vector_id':i,'bbox':box,'legend_vector_id':template,'source_sha256':m['sha256'],'source_url':m['url'],'label_candidates':icon_labels(p,station_ls),'status':'candidate'})
            # Rounded capsule enclosing at least two colored station circles.
            circles=[(i,d) for i,d in enumerate(dr) if len(d['items'])==4 and d['type']=='fs' and d['fill'] and min(d['fill'])>.90 and d['color'] and max(d['color'])-min(d['color'])>.15 and max(d['rect'].width,d['rect'].height)<22/scale]
            caps=[]
            for i,d in enumerate(dr):
                r=d['rect']
                if len(d['items']) not in (6,8) or d['color'] is None or r.y1>=cutoff or max(r.width,r.height)>180/scale:continue
                # A capsule is meaningful only with complete station circles enclosed.
                contained=[(ci,cd) for ci,cd in circles if r.contains(cd['rect'])]
                if len(contained)<2:continue
                if any(sum(abs(a-b) for a,b in zip(r,c['bbox']))<1 for c in caps):continue
                caps.append({'id':f'{core}-p{pn}-v{i}-interchange','core':core,'kind':'graphical_interchange','page':pn,'vector_id':i,'bbox':list(r),'station_circle_ids':[ci for ci,cd in contained],'source_sha256':m['sha256'],'source_url':m['url'],'label_candidates':nearby(center(r),station_ls),'status':'candidate'})
            all_symbols+=symbols;all_interchanges+=caps
            print(core,'symbols',len(symbols),'capsules',len(caps))
    dump(ROOT/'data/symbol_candidates.json',all_symbols)
    dump(ROOT/'data/interchange_candidates.json',all_interchanges)
    csvout(ROOT/'data/symbol_candidates.csv',all_symbols)
    csvout(ROOT/'data/interchange_candidates.csv',all_interchanges)

def gtfs():
    source=ROOT/'sources/gtfs.zip'; meta=json.loads((ROOT/'sources/gtfs-source.json').read_text(encoding="utf-8"))
    if hashlib.sha256(source.read_bytes()).hexdigest()!=meta['sha256']:raise ValueError('GTFS hash mismatch')
    z=zipfile.ZipFile(source); stops=rows(z,'stops.txt'); transfers=rows(z,'transfers.txt'); index={r['stop_id']:r for r in stops}
    for r in transfers:
        r['from_stop_name']=index.get(r['from_stop_id'],{}).get('stop_name')
        r['to_stop_name']=index.get(r['to_stop_id'],{}).get('stop_name')
        r['min_transfer_time']=int(r['min_transfer_time']) if r.get('min_transfer_time') else None
    distinct=[r for r in transfers if r['from_stop_id']!=r['to_stop_id']]
    pairs={tuple(sorted([r['from_stop_id'],r['to_stop_id']])) for r in distinct}
    audit={'rows':len(transfers),'same_stop_rows':len(transfers)-len(distinct),'distinct_stop_rows':len(distinct),'distinct_unordered_pairs':len(pairs),'all_distinct_pairs_bidirectional':all(any(r['from_stop_id']==a and r['to_stop_id']==b for r in distinct) and any(r['from_stop_id']==b and r['to_stop_id']==a for r in distinct) for a,b in pairs),'gtfs_source':meta}
    dump(ROOT/'data/gtfs_stops.json',stops);dump(ROOT/'data/gtfs_transfers.json',transfers);dump(ROOT/'data/gtfs_audit.json',audit);csvout(ROOT/'data/gtfs_transfers.csv',transfers)
    return stops,transfers

def route_index(feed_hash):
    cache=ROOT/'data/gtfs_station_routes.json'
    if cache.exists():
        saved=json.loads(cache.read_text(encoding='utf-8'))
        if saved['gtfs_sha256']==feed_hash:return saved['stations']
    z=zipfile.ZipFile(ROOT/'sources/gtfs.zip')
    routes={r['route_id']:r for r in rows(z,'routes.txt')}
    trips={t['trip_id']:t['route_id'] for t in rows(z,'trips.txt')}
    stations={}
    for r in csv.DictReader(io.TextIOWrapper(z.open('stop_times.txt'),encoding='utf-8-sig')):
        sid=r['stop_id'].strip();rid=trips.get(r['trip_id'].strip())
        if rid:stations.setdefault(sid,set()).add(rid)
    result={sid:{'route_ids':sorted(ids),'route_short_names':sorted({routes[r].get('route_short_name','') for r in ids})} for sid,ids in sorted(stations.items())}
    dump(cache,{'gtfs_sha256':feed_hash,'scope':'All trips in this feed; not filtered by service date. These are GTFS observations, not graphical line assignments.','stations':result})
    return result

def build(estimated_walk_seconds=600, export_gtfs=False):
    stops,transfers=gtfs();idx={s['stop_id']:s for s in stops}
    feed_hash=json.loads((ROOT/'sources/gtfs-source.json').read_text(encoding="utf-8"))['sha256']
    station_routes=route_index(feed_hash)
    manifests={m['core']:m for m in json.loads((ROOT/'sources/manifest.json').read_text(encoding="utf-8"))}
    annotations=json.loads((ROOT/'annotations/connections.json').read_text(encoding='utf-8'))
    out=[]
    for a in annotations:
        m=manifests[a['core']]
        if a['source_sha256']!=m['sha256']:raise ValueError('Annotation requires re-review: '+a['core'])
        if a['gtfs_source_sha256']!=feed_hash:raise ValueError('GTFS crosswalk requires re-review: '+a['id'])
        ids=a.get('stop_ids',[])
        for sid in ids:
            if sid not in idx:raise ValueError('Unknown stop_id: '+sid)
        r=dict(a,source_url=m['url'],gtfs_sha256=json.loads((ROOT/'sources/gtfs-source.json').read_text(encoding="utf-8"))['sha256'],gtfs_stops=[idx[sid] for sid in ids])
        r['matching_gtfs_transfer_rows']=[t for t in transfers if t['from_stop_id'] in ids and t['to_stop_id'] in ids]
        r['gtfs_services_by_stop']={sid:station_routes.get(sid,{'route_ids':[],'route_short_names':[]}) for sid in ids}
        r['routing_ready']=False # Cartographic evidence alone does not supply a safe routing duration.
        out.append(r)
    dump(ROOT/'data/connections.json',out);csvout(ROOT/'data/connections.csv',out)
    dump(ROOT/'data/walking_connections.json',[r for r in out if r['kind']=='walking_connection'])
    csvout(ROOT/'data/walking_connections.csv',[r for r in out if r['kind']=='walking_connection'])
    dump(ROOT/'data/pedestrian_observations.json',[r for r in out if r.get('pedestrian_link')])
    csvout(ROOT/'data/pedestrian_observations.csv',[r for r in out if r.get('pedestrian_link')])
    # Symbols retain association uncertainty even when a station name matches exactly.
    symbols=json.loads((ROOT/'data/symbol_candidates.json').read_text(encoding='utf-8'))
    aliases={(r['core'],norm(r['map_label'])):r['stop_ids'] for r in out if len(r['stop_ids'])==1}
    exact={}
    for s in stops:exact.setdefault(norm(s['stop_name']),[]).append(s['stop_id'])
    primary={(r['core'],r.get('vector_id'),r.get('mode')):r for r in out if r.get('vector_id') is not None and r.get('mode')}
    spatial_primary={(r['core'],tuple(round(v,3) for v in r['bbox']),r.get('mode','walk_under_10_min' if r.get('pedestrian_link') else r['kind'])):r for r in out}
    primary.update({(r['core'],r['vector_id'],'walk_under_10_min'):r for r in out if r.get('pedestrian_link') and r.get('vector_id') is not None})
    for s in symbols:
        name=s['label_candidates'][0]['text'] if s['label_candidates'] else '';s['proposed_station_label']=name
        reviewed=primary.get((s['core'],s['vector_id'],s['kind'])) or spatial_primary.get((s['core'],tuple(round(v,3) for v in s['bbox']),s['kind']))
        ids=aliases.get((s['core'],norm(name)),exact.get(norm(name),[]))
        if reviewed:
            ids=reviewed['stop_ids'];s['proposed_station_label']=reviewed['map_label'];s['association_status']='reviewed'
        else:s['association_status']='candidate'
        s['stop_ids']=ids if reviewed or len(ids)==1 else []
        s['gtfs_match_status']='reviewed' if reviewed else 'exact_or_reviewed_alias' if len(ids)==1 else 'unresolved'
        if not ids:
            best=sorted(stops,key=lambda t:difflib.SequenceMatcher(None,norm(name),norm(t['stop_name'])).ratio(),reverse=True)[:3]
            s['gtfs_suggestions']=[{'stop_id':t['stop_id'],'stop_name':t['stop_name'],'score':round(difflib.SequenceMatcher(None,norm(name),norm(t['stop_name'])).ratio(),3)} for t in best]
    dump(ROOT/'data/station_symbols.json',symbols);csvout(ROOT/'data/station_symbols.csv',symbols)
    coverage=[]
    for core,m in manifests.items():
        records=[r for r in out if r['core']==core];ss=[s for s in symbols if s['core']==core]
        coverage.append({'core':core,'source_url':m['url'],'sha256':m['sha256'],'visual_map_review':True,
                         'reviewed_records':len(records),'walking_connections':sum(r['kind']=='walking_connection' for r in records),
                         'internal_or_unspecified_interchanges':sum(r['kind'] in ('internal_interchange','interchange_unspecified') for r in records),
                         'symbol_candidates':len(ss),'symbol_associations_pending':sum(s['association_status']=='candidate' for s in ss),
                         'reviewed_records_missing_gtfs':sum(not r['stop_ids'] for r in records),
                         'automatic_extraction_complete':False})
    dump(ROOT/'data/coverage.json',coverage);csvout(ROOT/'data/coverage.csv',coverage)
    from routing_overlay import compile_overlay
    overlay = compile_overlay(ROOT, out, estimated_walk_seconds)
    if export_gtfs:
        from normalized_gtfs import export_feed
        export_feed(ROOT, overlay)
    return out

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('command',choices=['extract','gtfs','build','all']);ap.add_argument('--estimated-walk-seconds',type=int,default=600);args=ap.parse_args()
    if args.command in ('extract','all'):extract()
    if args.command=='gtfs':gtfs()
    if args.command in ('build','all'):build(args.estimated_walk_seconds)


