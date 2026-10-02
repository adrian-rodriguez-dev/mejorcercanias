import unittest
import io
import zipfile
from import_gtfs import service_dates, seconds, compile_feed

class CalendarTests(unittest.TestCase):
    def test_weekend_and_holiday_override(self):
        def calendar(id, weekdays):
            return dict(service_id=id, start_date='20261002', end_date='20261012', **dict(zip(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'], weekdays)))
        result = service_dates([calendar('work','1111100'), calendar('sat','0000010'), calendar('sun','0000001')], [dict(service_id='work', date='20261012', exception_type='2'), dict(service_id='sun', date='20261012', exception_type='1')])
        self.assertIn('2026-10-03', result['sat'])
        self.assertNotIn('2026-10-03', result['work'])
        self.assertIn('2026-10-04', result['sun'])
        self.assertNotIn('2026-10-12', result['work'])
        self.assertIn('2026-10-12', result['sun'])

    def test_calendar_dates_only(self):
        self.assertEqual(service_dates([], [dict(service_id='special', date='20261012', exception_type='1')])['special'], {'2026-10-12'})

    def test_after_midnight(self):
        self.assertEqual(seconds('25:10:00'), 90600)
        with self.assertRaises(ValueError):
            seconds('10:61:00')

    def test_subida_bajada_y_destinos_posteriores(self):
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w') as z:
            z.writestr('routes.txt', 'route_id,route_short_name\nR,C1\n')
            z.writestr('stops.txt', 'stop_id,stop_name\nA,Origen\nB,Intermedia\nC,Final\n')
            z.writestr('trips.txt', 'trip_id,route_id,service_id\nT,R,S\n')
            z.writestr('calendar_dates.txt', 'service_id,date,exception_type\nS,20261003,1\n')
            z.writestr('stop_times.txt', 'trip_id,arrival_time,departure_time,stop_id,stop_sequence,pickup_type,drop_off_type\nT,08:00:00,08:00:00,A,1,0,0\nT,08:10:00,08:10:00,B,2,1,1\nT,08:20:00,08:20:00,C,3,1,0\n')
        with zipfile.ZipFile(buffer) as z:
            manifest, stations = compile_feed(z, {'R'})
        self.assertEqual(manifest['coverageDates'], ['2026-10-03'])
        self.assertEqual(stations['A'][0][-1], [['C', 30000]])
        self.assertNotIn('B', stations)
        self.assertNotIn('C', stations)

if __name__ == '__main__':
    unittest.main()
