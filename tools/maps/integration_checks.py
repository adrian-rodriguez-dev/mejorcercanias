import hashlib, io, json, math, unittest, zipfile
import pipeline as p

def read(name):return json.loads((p.ROOT/name).read_text(encoding='utf-8'))

class EvidenceTests(unittest.TestCase):
    def test_source_integrity_and_annotation_version(self):
        manifest=read('sources/manifest.json');self.assertEqual(len(manifest),15)
        hashes={m['core']:hashlib.sha256((p.ROOT/m['file']).read_bytes()).hexdigest() for m in manifest}
        self.assertTrue(all(hashes[m['core']]==m['sha256'] for m in manifest))
        feed=hashlib.sha256((p.ROOT/'sources/gtfs.zip').read_bytes()).hexdigest()
        for r in read('annotations/connections.json'):
            self.assertEqual(r['source_sha256'],hashes[r['core']]);self.assertEqual(r['gtfs_source_sha256'],feed)

    def test_gtfs_padded_headers_and_route_constraints(self):
        with zipfile.ZipFile(p.ROOT/'sources/gtfs.zip') as z:rows=p.rows(z,'transfers.txt')
        self.assertEqual(len(rows),21);self.assertTrue(all('min_transfer_time' in r for r in rows))
        same=[r for r in rows if r['from_stop_id']==r['to_stop_id']]
        self.assertEqual(len(same),15)
        self.assertTrue(all(r['from_route_id'] and r['to_route_id'] and r['min_transfer_time']=='480' for r in same))
        a=read('data/gtfs_audit.json');self.assertEqual(a['distinct_unordered_pairs'],3);self.assertTrue(a['all_distinct_pairs_bidirectional'])

    def test_pedestrian_evidence_is_not_a_routing_time(self):
        walks=read('data/walking_connections.json');self.assertEqual(len(walks),5)
        pairs={tuple(sorted(r['stop_ids'])) for r in walks};self.assertEqual(len(pairs),5)
        for r in walks:
            self.assertEqual(len(r['stop_ids']),2);self.assertFalse(r['routing_ready'])
            self.assertIsNone(r['min_transfer_time_seconds']);self.assertTrue(r['walk_time_upper_bound_exclusive'])
            self.assertEqual(r['walk_time_upper_bound_seconds'],600);self.assertEqual(r['matching_gtfs_transfer_rows'],[])
        self.assertIn(('05451','13200'),pairs)

    def test_ids_and_known_ambiguous_names(self):
        data=read('data/connections.json');self.assertEqual(len({r['id'] for r in data}),len(data))
        stops={s['stop_id']:s for s in read('data/gtfs_stops.json')}
        for r in data:
            for sid in r['stop_ids']:self.assertIn(sid,stops);self.assertIsInstance(sid,str)
        self.assertEqual([(r['core'],r['map_label']) for r in data if not r['stop_ids']],[('murcia-alicante','Alcantarilla Los Romanos')])
        def ids(core,label):return [r['stop_ids'] for r in data if r['core']==core and r['map_label']==label]
        self.assertTrue(all(x==['05951'] for x in ids('cartagena','Cartagena')))
        self.assertEqual(ids('leon','León'),[['05778']])
        self.assertEqual(ids('barcelona','Ribes de Freser'),[['77303']])
        self.assertEqual(ids('barcelona','Riudellots de la Selva'),[['79204']])
        self.assertTrue(all(x==['98305'] for x in ids('madrid','Aeropuerto-T4')))

    def test_icon_shape_requires_background_style(self):
        data=read('data/symbol_candidates.json')
        trams=[r for r in data if r['core']=='sevilla' and r['kind']=='tram']
        self.assertEqual(len(trams),1)
        self.assertFalse(any(r['core']=='sevilla' and r['kind']=='other_train' and r['vector_id']==trams[0]['vector_id'] for r in data))

    def test_distinct_ids_do_not_imply_pedestrian(self):
        r=next(r for r in read('data/connections.json') if r['core']=='cantabria' and r['kind']=='interchange_unspecified')
        self.assertEqual(set(r['stop_ids']),{'14220','05655'});self.assertNotIn('min_transfer_time_seconds',r)

    def test_los_rosales_is_not_tocina_walking_edge(self):
        records=read('data/connections.json')
        r=next(r for r in records if r['id']=='sevilla-139')
        self.assertEqual(r['kind'],'internal_interchange');self.assertEqual(r['stop_ids'],['50700'])
        self.assertTrue(r['pedestrian_link']);self.assertEqual(r['walk_time_upper_bound_seconds'],600)
        self.assertEqual(set(r['gtfs_services_by_stop']['50700']['route_short_names']),{'C1','C3'})
        self.assertFalse(any(set(x['stop_ids'])=={'40122','50700'} for x in records))

    def test_geometry_invariant_to_scale_rotation_translation(self):
        pts=[(0,0),(2,0),(3,1),(0,4)]
        def shape(points):return {'items':[('c',*[p.fitz.Point(*v) for v in points])]}
        transformed=[(10-3*y,20+3*x) for x,y in pts]
        self.assertTrue(p.similar(p.signature(shape(pts)),p.signature(shape(transformed))))
        self.assertFalse(p.similar(p.signature(shape(pts)),p.signature(shape([(0,0),(3,0),(3,1),(0,4)]))))

    def test_deterministic_rebuild(self):
        paths=['data/connections.json','data/connections.csv','data/walking_connections.json','data/station_symbols.json','data/coverage.json']
        before={f:hashlib.sha256((p.ROOT/f).read_bytes()).hexdigest() for f in paths}
        p.build()
        after={f:hashlib.sha256((p.ROOT/f).read_bytes()).hexdigest() for f in paths}
        self.assertEqual(before,after)

if __name__=='__main__':unittest.main()
