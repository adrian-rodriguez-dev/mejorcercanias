# Proposal
## Why
El usuario quiere combinar líneas y reconocer su estado en el propio botón, sin una opción Todas que ocupa espacio.
## What Changes
- Tres botones C1/C2/C3 de color completo; tonos oscuros desmarcados y luminosos activos.
- Selección múltiple; cada pulsación alterna su línea. Ninguna seleccionada equivale a todas.
- Conservar filtros compartidos y controles de 44 px, sin chip interior ni botón Todas.
## Capabilities
### New Capabilities
Ninguna.
### Modified Capabilities
- `route-filters`: sustituir selección única por múltiples líneas y presentación de color completo.
## Impact
Estado RouteFilter, predicado, barra, estilos, pruebas y documentación. No cambia el GTFS.
