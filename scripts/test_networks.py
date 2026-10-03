import io,zipfile,unittest
from import_gtfs import compile_feed,snapshot_version
from refresh_gtfs import expired,validate_snapshot
from datetime import datetime
class NetworkTests(unittest.TestCase):
 def test_namespaces_colours_and_independent_dates(self):
  b=io.BytesIO()
  with zipfile.ZipFile(b,'w') as z:
   z.writestr('routes.txt','route_id,route_short_name,route_color\n60T1,C1,FF0000\n70T1,C1,0000FF\n')
   z.writestr('stops.txt','stop_id,stop_name\n1,Shared\n2,End\n')
   z.writestr('trips.txt','trip_id,route_id,service_id\nA,60T1,A\nB,70T1,B\n')
   z.writestr('calendar_dates.txt','service_id,date,exception_type\nA,20261003,1\nB,20261004,1\n')
   z.writestr('stop_times.txt','trip_id,arrival_time,departure_time,stop_id,stop_sequence\nA,10:00:00,10:00:00,1,1\nA,10:10:00,10:10:00,2,2\nB,10:00:00,10:00:00,1,1\nB,10:10:00,10:10:00,2,2\n')
  with zipfile.ZipFile(b) as z:m,d=compile_feed(z)
  validate_snapshot(m,d)
  self.assertIn('1',d);self.assertIn('zaragoza-1',d)
  self.assertEqual(d['zaragoza-1'][0][-1][0][0],'zaragoza-2')
  self.assertNotEqual(m['networks'][0]['coverageDates'],m['networks'][1]['coverageDates'])
  self.assertNotEqual(m['networks'][0]['colors']['C1'],m['networks'][1]['colors']['C1'])
  self.assertTrue(expired(m,datetime.fromisoformat('2026-10-04T12:00:00+02:00')))
  d['1'][0][2]='zaragoza-2'
  with self.assertRaises(ValueError):validate_snapshot(m,d)
 def test_transform_changes_identity(self):
  from unittest.mock import patch
  old=snapshot_version(b'feed')
  with patch('import_gtfs.TRANSFORM_VERSION','next'):self.assertNotEqual(old,snapshot_version(b'feed'))

class RetentionTests(unittest.TestCase):
 def test_failed_published_network_keeps_previous(self):
  import tempfile,json
  from pathlib import Path
  from unittest.mock import patch
  from refresh_gtfs import renew
  raw=io.BytesIO()
  with zipfile.ZipFile(raw,'w') as z:z.writestr('fixture','x')
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);p=root/'src/data/renfe-manifest.json';p.parent.mkdir(parents=True)
   p.write_text(json.dumps({'networks':[{'id':'bilbao'}]}))
   before=p.read_bytes()
   with patch('refresh_gtfs.compile_feed',return_value=({'networks':[]},{})):
    with self.assertRaises(ValueError):renew(root,force=True,downloader=lambda:raw.getvalue())
   self.assertEqual(before,p.read_bytes())
