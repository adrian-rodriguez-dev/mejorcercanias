# Contrato del panel

`ScheduleProvider.load(stationId, now, signal)` devuelve una promesa de `StationSchedule`: id de estación, procedencia y salidas con id, línea, destino e instante ISO con offset. `now` es milisegundos Unix; `signal` permite cancelar una selección anterior. La UI también descarta resultados cancelados. No se mezclan estaciones mientras carga.

El proveedor demo lee un JSON pequeño para la estación seleccionada. Cada patrón ficticio tiene `line`, `destination`, `offset` en minutos desde las 06:00 y `every` en minutos. Genera hoy y mañana hasta las 23:00 en Europe/Madrid usando Luxon; son horarios inventados, no frecuencias verificadas de Renfe. Los ids `demo-*` nunca deben cruzarse con GTFS-RT.

La siguiente propuesta de datos implementará otro proveedor. Debe conservar ids oficiales como cadenas, incluir versión del esquema, fuente, fecha de generación y vigencia, y preprocesar los calendarios antes de entregar instantes al panel. No descargar el ZIP GTFS desde cada navegador.

Tiempo real añadirá por separado estimación, cancelación y timestamp de observación; no debe sobrescribir silenciosamente `scheduledAt`. La variante `renfe-gtfs` reserva la procedencia; esta UI aún es una demo y requiere una propuesta para presentar datos reales y sus estados de vigencia.
