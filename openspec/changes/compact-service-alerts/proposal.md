# Proposal
## Why
El usuario necesita detectar incidencias relevantes sin perder espacio de horarios. El panel actual no consume avisos oficiales y la prioridad del producto sigue siendo rapidez y facilidad de uso móvil.
## What Changes
- Indicador compacto en la barra del título del panel oscuro, solo cuando existan incidencias relevantes y vigentes.
- Una línea con icono, resumen breve y número si hay varias; detalle a un toque, cerrado inicialmente.
- Sin recuadro permanente, sin mensaje «Sin incidencias» y sin espacio reservado cuando no haya avisos.
- Incidencias oficiales independientes de los horarios GTFS estáticos; filtrado por núcleo, línea/estación y vigencia.
Fuera de alcance: notificaciones push, estimación de retrasos de cada tren y feed social no verificado.
## Capabilities
### New Capabilities
- `service-alerts`: presentación contextual, compacta y verificable de incidencias de servicio.
### Modified Capabilities
Ninguna: se mantiene la cabecera única y la procedencia honesta del panel.
## Impact
Proveedor específico de alertas, cabecera App, detalle accesible y tests. Posible adaptación mínima de CORS solo si se acredita necesaria. No usar la renovación por caducidad del GTFS estático para alertas en tiempo real.
