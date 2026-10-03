# Contrato de datos

El panel consume `ScheduleProvider.load(stationId, now, signal)`: id de estación, instante Unix y señal de cancelación. Devuelve `StationSchedule`, con procedencia, salidas y disponibilidad. El proveedor oficial reúne hoy y mañana; no afirma que un tren vaya puntual.

`loadDay(stationId, date, signal)` devuelve todo el día civil elegido. `availability=unpublished` significa sin cobertura; `available` con cero salidas significa que no hay servicios publicados para esa estación y día. La interfaz de horario descarta resultados anteriores al cambiar fecha o estación.

Cada `Departure` tiene id estable del patrón y día de servicio, línea, terminal, salida ISO con offset y `arrivals` con estaciones posteriores donde se permite bajar. No es un trip_id de GTFS-RT: para tiempo real hará falta preservar y enlazar IDs originales mediante otra propuesta. Con destino, `loadJourneys` adapta los itinerarios del grafo al mismo contrato de presentación; el detalle `journey` conserva las etapas y reglas aplicadas. Los filtros no inventan conexiones.

Los JSON de estación usan tuplas compactas: `[patternId, line, terminalStopId, departureSeconds, calendarIndex, [[downstreamStopId, arrivalSeconds], ...], mode?]`. El índice de calendario referencia fechas efectivas ya resueltas por el importador. Se comprueban versión y estación contra el manifiesto compilado. Archivos versionados evitan mezclar snapshots.

Para días civiles se consideran también días de servicio anteriores, con horas GTFS entre 00:00 y 47:59:59. Europe/Madrid y la definición GTFS de mediodía menos doce horas determinan el instante, evitando sumas incorrectas de días en cambios DST.

El mock original sigue en `demo.ts` y `public/data/demo/`, sin ser proveedor de producción. Sus patrones son ficticios y no deben reutilizarse como horarios oficiales. La persistencia migra los cinco IDs `demo-*` conocidos a IDs Renfe.

## Grafo de rutas

`routing-<núcleo>.json` usa schemaVersion=1 y contiene version, network, nodes, groups, calendars, trips y transfers. Cada node identifica punto de embarque, estación y nombre; groups agrupa nodos de una estación. Cada trip conserva id, route, line, calendar, mode opcional y calls `[node, arrivalSeconds, departureSeconds, pickupType, dropOffType]`. El modo es train o bus; route_type=3 se conserva como bus.

Transfer contiene from, to y seconds; null prohíbe el cambio. Puede incluir estimated y calificadores from/to_route_id y from/to_trip_id. Las reglas explícitas aplicables prevalecen sobre el minuto implícito; reglas por viaje tienen más prioridad que por ruta. Sin regla y con distinto punto no se crea conexión. Los enlaces de mapas revisados son bidireccionales solo cuando existen ambas entradas.

El resultado contiene legs con tren, línea, origen, destino, salida/llegada y cambio previo. Las caminatas son entre trenes: no se calculan rutas exclusivamente a pie ni acceso/egreso peatonal. La búsqueda admite hasta tres transbordos dentro de una red y filtra líneas solo en la primera etapa.

Cada transbordo admite como máximo 60 minutos desde la llegada del tren anterior hasta la salida del siguiente, incluida cualquier caminata. El máximo es una política de la app, no un dato de Renfe; también se aplica de noche y no limita la duración a bordo ni cuánto falta para salir del origen. Los mínimos oficiales o estimados siguen siendo obligatorios. Las conexiones que exceden el máximo se descartan dentro del motor para poder encontrar alternativas válidas.

## Validación y compatibilidad

Los datos de red/caché se consideran desconocidos hasta validarse. Manifiesto, archivo de estación y grafo deben coincidir en versión. `graph-validation.ts` comprueba estructura, referencias a nodos, calendarios, tiempos y reglas de transferencia; el importador impone controles adicionales sobre el GTFS original. Las pruebas de JSON malformado protegen frente a entradas nulas sin convertir errores de datos en excepciones del validador.

El esquema actual no tiene una especificación JSON Schema compartida automáticamente entre Python y TypeScript: mantener ambos lados coordinados y añadir fixtures cuando cambie el contrato. El séptimo campo opcional de un patrón es mode; su ausencia representa el comportamiento ferroviario existente.
