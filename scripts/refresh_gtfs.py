"""Renew only after GTFS coverage expires; validate in staging before adoption."""
import argparse, hashlib, io, json, shutil, tempfile, urllib.request, zipfile
from datetime import datetime, timedelta, timezone, date
from pathlib import Path
from zoneinfo import ZoneInfo
from import_gtfs import compile_feed, write_json, SOURCE, snapshot_version, TRANSFORM_VERSION
ROOT = Path(__file__).resolve().parents[1]
def expired(manifest, now):
    try:
        start, end = date.fromisoformat(manifest['validFrom']), date.fromisoformat(manifest['validTo'])
        if manifest.get('networks'):
            return any(expired(n, now) for n in manifest['networks'])
        today = now.astimezone(ZoneInfo('Europe/Madrid')).date()
        return start > end or today < start or today > end
    except (KeyError, ValueError, TypeError):
        return True

def validate_snapshot(manifest, data):
    ids = {s['id'] for s in manifest['stations']}
    if len(ids) != len(manifest['stations']) or not ids or not manifest['coverageDates']:
        raise ValueError('Invalid catalog')
    by_id={s['id']:s for s in manifest['stations']}
    for station, patterns in data.items():
        if station not in ids: raise ValueError('Unknown origin')
        for pattern in patterns:
            if len(pattern) not in (6,7) or (len(pattern)==7 and pattern[6] not in ('train','bus')): raise ValueError('Invalid pattern mode')
            _, line, terminal, departure, calendar, calls = pattern[:6]
            if terminal not in ids or line not in next(s['lines'] for s in manifest['stations'] if s['id']==station) or not 0 <= calendar < len(manifest['calendars']):
                raise ValueError('Invalid pattern reference')
            if terminal in ids and by_id[terminal]['network']!=by_id[station]['network']: raise ValueError('Cross-network terminal')
            if any(stop not in ids or arrival < departure or by_id[stop]['network']!=by_id[station]['network'] for stop, arrival in calls): raise ValueError('Invalid arrival')

def publish_metadata(root, manifest, now):
    # This timestamp is the candidate publication time; it is only exposed if deployment succeeds.
    manifest = dict(manifest)
    manifest['publishedAt'] = now.isoformat()
    base = root/'public/data/renfe'
    write_json(base/manifest['version']/'manifest.json', manifest)
    write_json(root/'src/data/renfe-manifest.json',manifest)
    write_json(base/'current.json',{'schemaVersion':1,'version':manifest['version'],'checkedAt':manifest.get('checkedAt'),'publishedAt':manifest['publishedAt'],'manifest':f'{manifest["version"]}/manifest.json'})

def renew(root=ROOT, force=False, now=None, downloader=None):
    now = now or datetime.now(timezone.utc)
    manifest_path=root/'src/data/renfe-manifest.json'
    old=json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
    if old and not force and not expired(old,now):
        print('Coverage still valid; no download');return False
    if downloader is None:
        def downloader():
            with urllib.request.urlopen(SOURCE,timeout=90) as response: return response.read()
    raw=downloader()
    digest=hashlib.sha256(raw).hexdigest()
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        manifest,data=compile_feed(archive)
        if 'feed_info.txt' in archive.namelist():
            from import_gtfs import rows, parse_date
            for info in rows(archive,'feed_info.txt'):
                start,end=info.get('feed_start_date'),info.get('feed_end_date')
                if start and end and parse_date(start)>parse_date(end): raise ValueError('Invalid feed_info dates')
    if {n['id'] for n in old.get('networks',[])} - {n['id'] for n in manifest.get('networks',[])}: raise ValueError('Previously published network failed validation; keeping snapshot')
    routing = manifest.pop('_routing', {})
    validate_snapshot(manifest,data)
    if expired(manifest,now): raise ValueError('Downloaded feed does not cover today; keeping previous snapshot')
    if digest == old.get('sha256') and old.get('version') == snapshot_version(raw) and old.get('transformVersion') == manifest.get('transformVersion'):
        old['checkedAt']=now.isoformat()
        publish_metadata(root,old,now)
        return True
    version=snapshot_version(raw)
    manifest.update(version=version,sha256=digest,sourceUrl=SOURCE,downloadedAt=now.isoformat(),checkedAt=now.isoformat(),license='CC BY 4.0',attribution='Renfe Operadora')
    with tempfile.TemporaryDirectory() as staging:
        stage=Path(staging)
        for network, graph in routing.items():
            write_json(stage/f'routing-{network}.json', dict(graph, version=version))
        for station in manifest['stations']:
            write_json(stage/f'{station["id"]}.json',{'version':version,'stationId':station['id'],'patterns':data.get(station['id'],[])})
        target=root/'public/data/renfe'/version
        shutil.copytree(stage,target,dirs_exist_ok=True)
    publish_metadata(root,manifest,now)
    # Keep the immediate predecessor and every version published in the last seven days.
    for folder in (root/'public/data/renfe').iterdir():
        if not folder.is_dir() or folder.name in (version,old.get('version')): continue
        meta=folder/'manifest.json'
        if not meta.exists(): continue
        try: published=datetime.fromisoformat(json.loads(meta.read_text(encoding="utf-8"))['publishedAt'])
        except (ValueError,KeyError,TypeError): continue
        if now-published > timedelta(days=7): shutil.rmtree(folder)
    return True
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--force',action='store_true');parser.add_argument('--bootstrap',action='store_true');args=parser.parse_args()
    if args.bootstrap:
        m=json.loads((ROOT/'src/data/renfe-manifest.json').read_text(encoding="utf-8"));m['checkedAt']=m.get('checkedAt');publish_metadata(ROOT,m,datetime.now(timezone.utc))
    else: renew(force=args.force)
