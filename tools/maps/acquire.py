"""Fetch only sources linked by the 15 official Renfe map pages.

Cached by default. --refresh updates sources and intentionally invalidates annotations
when hashes change. Re-review annotations before rebuilding a changed map.
"""
import argparse, concurrent.futures, datetime, hashlib, html, json, re, time
import urllib.request, urllib.parse, zipfile, io
from pipeline import ROOT, dump

CORES=['madrid','barcelona','valencia','sevilla','bilbao','san-sebastian',
       'murcia-alicante','cadiz','zaragoza','malaga','cantabria','asturias',
       'cartagena','leon','ferrol']
GTFS='https://ssl.renfe.com/ftransit/Fichero_CER_FOMENTO/fomento_transit.zip'
def fetch(url, expected=None):
    headers = {
        'User-Agent': 'MejorCercanias/1.0 (+https://github.com/adrian-rodriguez-dev/mejorcercanias)',
        'Accept': 'application/pdf,image/svg+xml,text/html,application/zip,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9',
    }
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(request, timeout=90) as response:
                data, final = response.read(), response.geturl()
                if expected == '.pdf' and not data.startswith(b'%PDF'):
                    content_type = response.headers.get('Content-Type', 'unknown')
                    preview = data[:180].decode('utf-8', errors='replace').replace('\n', ' ')
                    raise ValueError(f'Expected PDF, got {content_type} ({len(data)} bytes) from {final}: {preview}')
                if expected == '.svg' and b'<svg' not in data[:4096]:
                    raise ValueError('Expected SVG from ' + final)
                return data, final
        except Exception:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)

def acquire(refresh=False):
    target=ROOT/'sources';target.mkdir(parents=True,exist_ok=True)
    old=json.loads((target/'manifest.json').read_text(encoding='utf-8')) if (target/'manifest.json').exists() else []
    old={m['core']:m for m in old}
    def one(core):
        if not refresh and core in old:
            m=old[core]
            if hashlib.sha256((ROOT/m['file']).read_bytes()).hexdigest()!=m['sha256']:raise ValueError('Corrupt cache '+core)
            return m
        page=f'https://www.renfe.com/es/es/cercanias/cercanias-{core}/mapas'
        raw,final_page=fetch(page); text=html.unescape(raw.decode('utf-8'))
        urls=sorted(set(re.findall(r'''(?:https://www.renfe.com)?/content/dam/[^"'<>\s]+\.(?:pdf|svg)''',text)))
        if len(urls)!=1:raise ValueError(f'{core}: expected exactly one map, found {urls}; review source selection')
        url=urllib.parse.urljoin('https://www.renfe.com',urls[0])
        suffix=PathSuffix(url)
        data,final_url=fetch(url,expected=suffix)
        file=target/(core+suffix);file.write_bytes(data);(target/(core+'-page.html')).write_bytes(raw)
        return {'core':core,'page_url':page,'resolved_page_url':final_page,'url':url,'resolved_url':final_url,
                'file':file.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(data).hexdigest(),
                'retrieved_at':datetime.datetime.now(datetime.timezone.utc).isoformat()}
    records=list(concurrent.futures.ThreadPoolExecutor(5).map(one,CORES));dump(target/'manifest.json',records)
    if refresh or not (target/'gtfs.zip').exists():
        data,final=fetch(GTFS)
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            for name in ['stops.txt','transfers.txt']:z.getinfo(name)
        (target/'gtfs.zip').write_bytes(data)
        dump(target/'gtfs-source.json',{'url':GTFS,'resolved_url':final,'sha256':hashlib.sha256(data).hexdigest(),'retrieved_at':datetime.datetime.now(datetime.timezone.utc).isoformat()})
    else:
        meta=json.loads((target/'gtfs-source.json').read_text(encoding='utf-8'))
        if hashlib.sha256((target/'gtfs.zip').read_bytes()).hexdigest()!=meta['sha256']:raise ValueError('Corrupt GTFS cache')
    print('Sources verified:',len(records))
def PathSuffix(url):return '.svg' if urllib.parse.urlparse(url).path.lower().endswith('.svg') else '.pdf'
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--refresh',action='store_true');acquire(p.parse_args().refresh)
