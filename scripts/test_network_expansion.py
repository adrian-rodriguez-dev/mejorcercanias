import io, unittest, zipfile
from import_gtfs import compile_feed
from routing_data import compile_routing
from refresh_gtfs import validate_snapshot

class ExpansionTests(unittest.TestCase):
    def archive(self, duplicate=False):
        raw=io.BytesIO()
        with zipfile.ZipFile(raw,'w') as z:
            z.writestr('routes.txt','route_id,route_short_name,route_type\n51T1,R3,3\n')
            z.writestr('trips.txt','trip_id,route_id,service_id\nvalid,51T1,S\nempty,51T1,S\nsingle,51T1,S\n')
            z.writestr('stops.txt','stop_id,stop_name\n1,A\n2,B\n')
            z.writestr('calendar_dates.txt','service_id,date,exception_type\nS,20261003,1\n')
            z.writestr('stop_times.txt','trip_id,stop_id,stop_sequence,arrival_time,departure_time\nvalid,1,1,08:00:00,08:00:00\nvalid,2,'+('1' if duplicate else '2')+',08:10:00,08:10:00\nsingle,1,1,09:00:00,09:00:00\n')
        return zipfile.ZipFile(raw)
    def test_incomplete_audited_and_bus_preserved_in_both_outputs(self):
        with self.archive() as z:
            m,data=compile_feed(z,{'51T1'},allow_incomplete=True)
            self.assertEqual({t['tripId'] for t in m['excludedTrips']},{'empty','single'})
            self.assertEqual(data['1'][0][6],'bus')
            validate_snapshot(m,data)
            manifest={'networks':[{'id':'rodalies','lines':['R3'],'excludedTrips':m['excludedTrips']}], 'stations':[{'id':'rodalies-'+s['id'],'network':'rodalies','name':s['name']} for s in m['stations']]}
            graph=compile_routing(z,manifest)['rodalies']
            self.assertEqual([t['id'] for t in graph['trips']],['valid'])
            self.assertEqual(graph['trips'][0]['mode'],'bus')
    def test_strict_mode_and_duplicates_still_fail(self):
        with self.archive() as z, self.assertRaises(ValueError): compile_feed(z,{'51T1'})
        with self.archive(True) as z, self.assertRaises(ValueError): compile_feed(z,{'51T1'},allow_incomplete=True)
