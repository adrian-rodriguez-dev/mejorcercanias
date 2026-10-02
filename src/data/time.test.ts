import { describe, expect, it } from 'vitest'
import { clockTime, dayLabel, upcoming } from './time'
import { materialize } from './demo'
import type { Departure } from './types'
const departure = (id: string, scheduledAt: string): Departure => ({ id, scheduledAt, line: 'C1', destination: 'Bilbao-Abando' })

describe('próximas salidas', () => {
  it('excluye pasadas, ordena, limita y redondea hacia arriba', () => {
    const now = Date.parse('2026-10-02T10:00:00+02:00')
    const result = upcoming([
      departure('late', '2026-10-02T10:02:00+02:00'),
      departure('past', '2026-10-02T09:59:59+02:00'),
      departure('next', '2026-10-02T10:01:01+02:00'),
    ], now, 1)
    expect(result.map(d => [d.id, d.minutes])).toEqual([['next', 2]])
  })
  it('mantiene la salida en su instante exacto', () => {
    const at = '2026-10-02T10:00:00+02:00'
    expect(upcoming([departure('now', at)], Date.parse(at))[0].minutes).toBe(0)
    expect(upcoming([departure('now', at)], Date.parse(at) + 1)).toEqual([])
  })
  it('cruza medianoche y formatea Bilbao independientemente del dispositivo', () => {
    const now = Date.parse('2026-10-02T23:59:00+02:00')
    const at = '2026-10-02T22:01:00Z'
    expect(upcoming([departure('tomorrow', at)], now)[0].minutes).toBe(2)
    expect(clockTime(Date.parse(at))).toBe('00:01')
    expect(dayLabel(Date.parse(at), now)).toBe('Mañana')
  })
  it.each(['2026-03-28T22:00:00Z', '2026-10-24T22:00:00Z'])('respeta las 06:00 tras cambio DST: %s', at => {
    const data = materialize('demo', [{ line: 'C1', destination: 'Destino', offset: 0, every: 60 }], Date.parse(at))
    const first = upcoming(data.departures, Date.parse(at))[0]
    expect(clockTime(Date.parse(first.scheduledAt))).toBe('06:00')
  })
})
