# Design
## Context
El horario completo repite información y controles que quitan espacio a la tabla.
## Goals / Non-Goals
Simplificar y mantener datos correctos; no cambiar calendarios ni filtros de trayecto.
## Decisions
Timetable usa siempre modo all; fecha accesible sin etiqueta visual, caption solo para lector de pantalla. Reutilizar filtros de líneas/destino de cabecera. Adaptar pruebas que dependían de controles retirados.
## Risks / Trade-offs
Conservar estados de carga, error y fecha no publicada; verificar móvil y caracteres españoles con pruebas.
