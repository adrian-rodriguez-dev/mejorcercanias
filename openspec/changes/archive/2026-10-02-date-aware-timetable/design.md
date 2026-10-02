# Design
## Context
La vertical inicial usa cinco estaciones y patrones diarios ficticios. El GTFS descargado el 2026-10-02 contiene calendar.txt con servicios diarios explícitos y carece de calendar_dates.txt; el importador debe soportar ambos. Las rutas de Bilbao observadas son 60T0001C1, 60T0002C1, 60T0003C2, 60T0004C2, 60T0005C3, 60T0006C3, 60T0023C3 y 60T0024C3. Abando es 13200 y Barakaldo 13400. No se filtra por C1 a nivel nacional.
## Goals / Non-Goals
**Goals:** una vista secundaria rápida con servicios reales por fecha, sin desplazar el panel principal. Transformación fuera del navegador con trazabilidad.
**Non-Goals:** transbordos, rutas de Euskotren/metro, calendario de festivos nominal, margen de caminar a una cita, tiempo real, refresco programado.
## Decisions
- Python estándar procesa ZIP y CSV en streaming, sin nuevas dependencias. Lista explícita de rutas verificadas. Valida referencias, horas, secuencia y condiciones de subida/bajada; falla antes de publicar ante datos incompatibles.
- Agrupar viajes con mismas paradas/horas/línea y unir fechas efectivas. JSON por estación con patrones de salida y llegadas posteriores; calendarios deduplicados en manifiesto. No descargar los 224 MB de stop_times al navegador.
- Incluir versión de dataset basada en SHA256 y archivos bajo directorio versionado. Manifiesto importado por build; no mezclar archivos de versiones. Generar en staging y publicar solo tras validación.
- Interpretar el día GTFS desde mediodía local menos 12 horas y sumar segundos, conforme a GTFS; no interpretar 25:10 como un reloj civil. La tabla agrupa por día civil de salida y consulta también el servicio anterior cuando alcanza el día siguiente.
- Hora de llegada límite significa estar en la estación de destino antes o a esa hora. Se listan solo trenes directos que permiten bajarse allí. La tabla comienza sin filtros; el acceso Mañana a Bilbao antes de las 09:00 configura fecha, destino y hora en una sola acción. Ver todo el día elimina filtros.
- Mantener proveedor demo para pruebas, pero cambiar el proveedor por defecto y migrar IDs favoritos. El panel no conserva filtros de la tabla al regresar a próximas salidas.
- No llamar festivo a una fecha solo por su frecuencia. Mostrar día de semana y explicar que las excepciones del operador ya se aplican. Fechas fuera de cobertura muestran datos no publicados, nunca un día similar.
## Risks / Trade-offs
- [Snapshot caduca] → límites visibles y comando manual de refresco; automatización en propuesta posterior.
- [Servicio especial ausente en fuente] → atribución, fecha de descarga y enlace oficial; no afirmar exhaustividad fuera del feed.
- [Muchos trenes] → tabla compacta filtrable sin paginar ni ocultar el horario completo.
## Migration Plan
Archivar la vertical aceptada, registrar esta propuesta antes del código. Migrar favoritas conocidas, generar datos versionados y verificar una consulta real Barakaldo→Abando mañana antes de las 09:00. Revertir el commit restaura proveedor demo sin eliminar la preferencia.
