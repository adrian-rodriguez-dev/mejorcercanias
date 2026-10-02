# Verificación de la primera vertical

Entorno local: Windows, Node 24.19.0. Comprobaciones del 2026-10-02.

- `npm test`: 11 pruebas de lógica y componentes, todas correctas.
- `npm run build`: TypeScript estricto y compilación Vite correctos.
- `npm run spec -- validate --all --strict`: propuesta válida.
- `npm run test:e2e`: cuatro pruebas de navegador, dos en escritorio y dos a 360 px, todas correctas.
- Inspección visual de capturas completas en ambos tamaños: sin recortes ni desbordamiento horizontal. El móvil oculta la introducción después de elegir estación para mostrar el primer tren sin desplazarse.

Cobertura: selección, recarga y persistencia, preferencia antigua, almacenamiento bloqueado, descarte de respuestas antiguas, error y reintento, vacío, redondeo de minutos, eliminación de salidas pasadas, medianoche, cambio DST y hora de Bilbao con navegador en America/New_York.

Las capturas se regeneran en `work/preview-desktop.png` y `work/preview-mobile.png` (no versionadas). No se han validado horarios reales, cobertura completa de Bilbao, PWA, uso offline ni GTFS-RT: no están implementados. La validación local no sustituye comprobar GitHub Actions después del push.

## Verificación del horario por fecha · 2026-10-02

20 pruebas TypeScript/componentes, 4 pruebas Python y 6 pruebas de navegador (escritorio y móvil). Build y validación OpenSpec estricta correctos.

Casos nuevos: calendario de sábado/domingo; eliminación de servicio laborable y alta excepcional en fixture festivo; calendar_dates sin calendar; subida/bajada prohibidas; horas >24; DST; límites de llegada inclusivos; ningún destino anterior al origen; fechas no publicadas; migración de favoritas; respuestas tardías; atajo mañana, limpiar filtros y volver a próximas salidas.

Verificación independiente leyendo el GTFS original: el sábado 2026-10-03 desde Desertu-Barakaldo (13400) a Abando (13200), la última opción antes o a las 09:00 sale 08:45 y llega 08:59 (trip_id 6074S29512C2). Las anteriores salen 08:30/08:15 y llegan 08:44/08:29. La aplicación coincide. Es programación, no garantía de puntualidad.

Capturas inspeccionadas a 360 px y escritorio: tabla completa, filtros y recomendación legibles, sin desbordamiento horizontal. Datos reales de 1–30 de octubre; refresco programado, PWA y tiempo real aún pendientes. Las pruebas de navegador fijan su reloj dentro de este snapshot para ser reproducibles.

## Verificación de filtros compactos · 2026-10-02

23 pruebas TypeScript y 8 pruebas de navegador correctas. El importador conserva sus 4 pruebas. Filtro de línea y parada intermedia aplicado antes del límite de ocho salidas; combinación con hora de llegada; conservación entre vistas; limpieza de destino incompatible y cambio de origen. En escritorio y 360 px se comprueba apertura con teclado, devolución del foco al cerrar, controles de al menos 44 px, primer tren visible y ausencia de desbordamiento horizontal. Capturas inspeccionadas: filtros abiertos y cerrados. Los filtros no se guardan en almacenamiento persistente.
