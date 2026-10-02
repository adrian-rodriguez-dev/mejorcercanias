# Proposal
## Why
Al elegir destino el usuario necesita conocer cuándo llegará, no solo cuándo sale el tren. La tabla diaria ya resuelve la llegada; falta presentarla en próximas salidas y asegurar coherencia entre vistas.
## What Changes
- Mostrar salida y llegada programada a la estación elegida, incluida parada intermedia, al seleccionar destino.
- Ocultar el espacio de llegada cuando no hay destino.
- Actualizar llegada inmediatamente al cambiar o invertir trayecto; indicar cambio de día si corresponde.
## Capabilities
### New Capabilities
Ninguna.
### Modified Capabilities
- `station-board`: llegada al destino seleccionado en cada próxima salida.
- `daily-timetable`: misma semántica y presentación condicional de llegada en horario completo.
## Impact
Presentación del panel, helper de llegada compartido si procede y pruebas. La tabla ya obtiene arrivalAt por stationId. Sin nuevas descargas ni cálculo de transbordos.
