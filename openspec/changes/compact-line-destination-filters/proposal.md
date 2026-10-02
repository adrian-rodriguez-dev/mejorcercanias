# Proposal
## Why
Elegir línea y destino debe ser igual de rápido en próximas salidas y en el horario completo, sin convertir la pantalla móvil en un formulario largo.
## What Changes
- Añadir una barra plegable de filtros compartida entre ambas vistas con línea y destino directo.
- Mantener visible un resumen de la selección y permitir quitar filtros en una acción.
- Filtrar antes de limitar las próximas ocho salidas. Combinar línea, destino y hora en la tabla.
- Usar controles táctiles de al menos 44 px, sin desbordamiento a 360 px y con el primer tren visible con filtros cerrados.
## Capabilities
### New Capabilities
- `route-filters`: filtrado consistente por línea y parada de destino con presentación compacta móvil.
### Modified Capabilities
Ninguna. La capacidad nueva compone los filtros con las vistas existentes sin cambiar sus contratos de horario y calendario.
## Impact
Componente reutilizable, estado compartido durante la visita, filtrado y pruebas de móvil. No se guardan filtros entre visitas: la estación favorita sigue siendo la única preferencia persistente. No añade consultas de red ni modifica datos GTFS.
