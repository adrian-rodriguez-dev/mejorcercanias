# Proposal
## Why
El selector externo y el título repiten la estación y desplazan los trenes fuera de la primera pantalla móvil.
## What Changes
- Un único panel oscuro con origen como selector titular y destino opcional visible.
- Intercambio inmediato de origen/destino, conservando vista, fecha y hora.
- Eliminar el selector de destino duplicado del desplegable; mantener línea y hora.
## Capabilities
### New Capabilities
Ninguna.
### Modified Capabilities
- `station-board`: cabecera editable y trayecto reversible.
- `route-filters`: destino visible en cabecera y excepción de intercambio al reinicio de selección.
## Impact
App, Timetable, RouteFilters, estilos, pruebas y README. Sin cambios al importador GTFS.
