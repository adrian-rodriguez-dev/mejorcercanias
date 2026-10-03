import io,json,tempfile,unittest,zipfile
from pathlib import Path
from datetime import datetime,timezone
from unittest.mock import patch
from refresh_gtfs import expired,renew,publish_metadata,validate_snapshot
class RefreshTests(unittest.TestCase):
 def test_expiry_is_calendar_not_download_age(self):
  m={'validFrom':'2026-10-01','validTo':'2026-10-30','downloadedAt':'2020-01-01'}
  self.assertFalse(expired(m,datetime.fromisoformat('2026-10-30T22:59:59+00:00')))
  self.assertTrue(expired(m,datetime.fromisoformat('2026-10-30T23:00:00+00:00')))
  m['validTo']='2026-10-25'
  self.assertFalse(expired(m,datetime.fromisoformat('2026-10-25T22:59:59+00:00')))
  self.assertTrue(expired(m,datetime.fromisoformat('2026-10-25T23:00:00+00:00')))
  self.assertTrue(expired({'validFrom':'bad'},datetime.now(timezone.utc)))
  self.assertTrue(expired({'validFrom':'2099-01-01','validTo':'2099-02-01'},datetime.now(timezone.utc)))
 def test_skip_and_fail_preserve_snapshot(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);p=root/'src/data/renfe-manifest.json';p.parent.mkdir(parents=True)
   p.write_text(json.dumps({'validFrom':'2026-10-01','validTo':'2026-10-30'}));before=p.read_bytes()
   def fail():raise OSError('offline')
   now=datetime.fromisoformat('2026-10-03T10:00:00+00:00')
   self.assertFalse(renew(root,now=now,downloader=fail))
   with self.assertRaises(OSError):renew(root,force=True,now=now,downloader=fail)
   self.assertEqual(before,p.read_bytes())
 def test_staging_same_hash_and_expired_hash(self):
  import hashlib
  raw=io.BytesIO()
  with zipfile.ZipFile(raw,'w') as z:z.writestr('fixture','x')
  raw=raw.getvalue();version=__import__('import_gtfs').snapshot_version(raw)
  m={'schemaVersion':1,'validFrom':'2026-10-01','validTo':'2026-10-30','coverageDates':['2026-10-01','2026-10-30'],'calendars':[['2026-10-01']], 'stations':[{'id':'1','name':'A','lines':['C1'],'network':'bilbao'},{'id':'2','name':'B','lines':['C1'],'network':'bilbao'}]}
  data={'1':[['t','C1','2',100,0,[['2',200]]]]}
  with tempfile.TemporaryDirectory() as tmp,patch('refresh_gtfs.compile_feed',return_value=(m,data)):
   root=Path(tmp);now=datetime.fromisoformat('2026-10-03T10:00:00+00:00')
   renew(root,force=True,now=now,downloader=lambda:raw)
   p=root/'public/data/renfe'/version/'1.json';content=p.read_bytes();stamp=p.stat().st_mtime_ns
   renew(root,force=True,now=now,downloader=lambda:raw)
   self.assertEqual(p.stat().st_mtime_ns,stamp);self.assertEqual(content,p.read_bytes())
   # Unknown local provenance must not look like a fresh download.
   import import_gtfs,sys
   localzip=root/'local.zip';localzip.write_bytes(raw)
   with patch('import_gtfs.compile_feed',return_value=(m,data)),patch.object(sys,'argv',['import_gtfs','--zip',str(localzip),'--output',str(root/'local')]):
    import_gtfs.main()
   local=json.loads((root/'local/src/data/renfe-manifest.json').read_text(encoding="utf-8"))
   self.assertIsNone(local['downloadedAt']);self.assertIsNone(local['checkedAt'])
   stale=root/'public/data/renfe'/'cccccccccccccccc';stale.mkdir();(stale/'manifest.json').write_text(json.dumps({'publishedAt':'2026-09-01T00:00:00+00:00'}))
   recent=root/'public/data/renfe'/'dddddddddddddddd';recent.mkdir();(recent/'manifest.json').write_text(json.dumps({'publishedAt':'2026-10-02T00:00:00+00:00'}))
   newer=io.BytesIO()
   with zipfile.ZipFile(newer,'w') as z:z.writestr('fixture','new')
   renew(root,force=True,now=now,downloader=lambda:newer.getvalue())
   self.assertFalse(stale.exists());self.assertTrue(recent.exists());self.assertTrue(p.exists())
   before=(root/'public/data/renfe/current.json').read_bytes()
   with self.assertRaises(ValueError):renew(root,now=datetime.fromisoformat('2026-11-01T00:00:00+00:00'),downloader=lambda:raw)
   self.assertEqual(before,(root/'public/data/renfe/current.json').read_bytes())
 def test_invalid_reference(self):
  with self.assertRaises(ValueError):validate_snapshot({'stations':[{'id':'1'}],'coverageDates':['2026-10-03'],'calendars':[[]]}, {'1':[['t','C1','missing',0,0,[]]]})
if __name__=='__main__':unittest.main()
