# Design
## Context
App mantiene el panel y Timetable mantiene sus filtros de destino/hora. Hay paradas posteriores en arrivals. Las próximas salidas se limitan a ocho antes de cualquier filtrado. El origen y la fecha ya tienen protección contra respuestas antiguas.
## Goals / Non-Goals
**Goals:** mismo significado de línea y destino en ambas vistas; reutilizar datos cargados; priorizar 360 px.
**Non-Goals:** persistencia de filtros entre visitas, cambios de horarios GTFS y transbordos.
## Decisions
- Estado de línea/destino en App, compartido con Timetable; reinicio al cambiar origen. Hora y fecha siguen siendo locales al horario completo.
- Componente RouteFilters con details/summary nativo, cerrado inicialmente. Resumen corto en una fila; etiquetas completas dentro y título para texto truncado. Selectores nativos y botón Ver trenes para plegar y devolver foco.
- Destinos derivados de arrivals de la línea seleccionada. Al cambiar explícitamente de línea, limpiar destino si no es compatible; cambiar fecha conserva filtros incluso si no hay servicio. No eliminar filtros durante carga.
- Aplicar predicado compartido antes de upcoming; sumar filtro de línea a filterTimetable. El atajo mañana a Bilbao limpia la línea para no conservar una restricción inesperada.
- En horario completo, integrar Consultar/Hora en el mismo desplegable y reflejar hora activa en resumen. CSS base para móvil; ampliar distribución a partir de 641 px.
## Risks / Trade-offs
- [Filtros escondidos] → resumen siempre visible, indicador activo y quitar filtros.
- [Controles abiertos ocupan espacio] → cierre explícito tras seleccionar y medidas táctiles de 44 px.
- [Destino largo] → resumen truncado con nombre completo en selector/atributo accesible, sin ensanchar viewport.
