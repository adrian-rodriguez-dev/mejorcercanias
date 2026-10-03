## Why
Elegir dos estaciones solo muestra trenes directos. El usuario necesita llegada y transbordos en el panel actual.
## What Changes
- Cálculo interno por rondas basado en renfe-cli, hasta tres transbordos.
- Datos por núcleo, calendarios, restricciones y enlaces peatonales revisados.
- Llegada final, indicador de transbordos y detalle en próximas salidas y horario completo.
- Sin pestañas ni formularios nuevos.
## Capabilities
### New Capabilities
- `journey-routing`: cálculo de itinerarios y presentación integrada.
### Modified Capabilities
- `route-filters`: destino admite transbordos y línea filtra el primer tren.
## Impact
Importador, refresco, proveedor de horarios, panel y tabla. Se preserva arquitectura estática y se atribuye BSD-3-Clause a renfe-cli.
