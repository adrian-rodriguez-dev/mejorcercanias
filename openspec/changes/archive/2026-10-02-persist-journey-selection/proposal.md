# Proposal
## Why
Reabrir la app obliga a elegir destino y líneas otra vez aunque el origen ya se recuerda.
## What Changes
- Persistir origen, destino opcional y multiselección de líneas en este navegador.
- Restaurar solo valores válidos del catálogo y limpiar líneas incompatibles.
- Recordar también destino vacío, ninguna línea marcada e intercambio de estaciones.
## Capabilities
### New Capabilities
Ninguna.
### Modified Capabilities
- `route-filters`: preferencias de trayecto entre visitas.
## Impact
Preferencias locales, App y pruebas. Sin backend ni persistencia de fecha/hora de consultas puntuales.
