# Contrato de datos

El panel consume `ScheduleProvider.load(stationId, now, signal)`: id de estación, instante Unix y señal de cancelación. Devuelve `StationSchedule`, con procedencia, salidas y disponibilidad. El proveedor oficial reúne hoy y mañana; no afirma que un tren vaya puntual.

`loadDay(stationId, date, signal)` devuelve todo el día civil elegido. `availability=unpublished` significa sin cobertura; `available` con cero salidas significa que no hay servicios publicados para esa estación y día. La interfaz de horario descarta resultados anteriores al cambiar fecha o estación.

Cada `Departure` tiene id estable del patrón y día de servicio, línea, terminal, salida ISO con offset y `arrivals` con estaciones posteriores donde se permite bajar. No es un trip_id de GTFS-RT: para tiempo real hará falta preservar y enlazar IDs originales mediante otra propuesta. Los filtros no pueden inventar destinos o transbordos.

Los JSON de estación usan tuplas compactas: `[patternId, line, terminalStopId, departureSeconds, calendarIndex, [[downstreamStopId, arrivalSeconds], ...]]`. El índice de calendario referencia fechas efectivas ya resueltas por el importador. Se comprueban versión y estación contra el manifiesto compilado. Archivos versionados evitan mezclar snapshots.

Para días civiles se consideran también días de servicio anteriores, con horas GTFS entre 00:00 y 47:59:59. Europe/Madrid y la definición GTFS de mediodía menos doce horas determinan el instante, evitando sumas incorrectas de días en cambios DST.

El mock original sigue en `demo.ts` y `public/data/demo/`, sin ser proveedor de producción. Sus patrones son ficticios y no deben reutilizarse como horarios oficiales. La persistencia migra los cinco IDs `demo-*` conocidos a IDs Renfe.
