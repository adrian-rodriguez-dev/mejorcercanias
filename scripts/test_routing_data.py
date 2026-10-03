import io, json, tempfile, unittest, zipfile
from pathlib import Path
from unittest.mock import patch
from routing_data import compile_routing

class RoutingDataTests(unittest.TestCase):
    def test_split_boarding_points_and_qualified_transfers(self):
        raw=io.BytesIO()
        with zipfile.ZipFile(raw,'w') as z:
            z.writestr('routes.txt','route_id,route_short_name\n30T1,C1\n30T3,C3\n')
            z.writestr('trips.txt','trip_id,route_id,service_id\nA,30T1,S\nB,30T3,S\n')
            z.writestr('calendar_dates.txt','service_id,date,exception_type\nS,20261003,1\n')
            z.writestr('stop_times.txt','trip_id,stop_id,stop_sequence,arrival_time,departure_time,pickup_type,drop_off_type\nA,50700,1,08:00:00,08:00:00,0,0\nA,1,2,08:10:00,08:10:00,0,0\nB,50700,1,08:20:00,08:20:00,0,0\nB,1,2,08:30:00,08:30:00,1,1\n')
            z.writestr('transfers.txt','from_stop_id,to_stop_id,transfer_type,min_transfer_time,from_route_id,to_trip_id\n1,1,2,480,30T1,B\n')
        m={'networks':[{'id':'sevilla','lines':['C1','C3']}],'stations':[{'id':'sevilla-'+s,'network':'sevilla','name':s} for s in ['50700','1']]}
        with zipfile.ZipFile(raw) as z: g=compile_routing(z,m)['sevilla']
        self.assertNotIn('sevilla-50700',g['nodes'])
        self.assertEqual(g['groups']['sevilla-50700'],['mc:50700:c1','mc:50700:c3'])
        self.assertEqual([t['calls'][0][0] for t in g['trips']],['mc:50700:c1','mc:50700:c3'])
        self.assertEqual(g['trips'][1]['calls'][1][3:],[1,1])
        self.assertEqual(g['transfers'][0]['to_trip_id'],'B')
        self.assertEqual(g['transfers'][0]['seconds'],480)
        self.assertEqual(len(g['transfers']),3)
        self.assertTrue(all(t['seconds']==600 for t in g['transfers'][1:]))

if __name__=='__main__':unittest.main()
