# Design
## Decisions
Conservar terminalId explícito desde cada patrón GTFS y buscar su llamada en arrivals. No usar la última llamada disponible si no corresponde a esa terminal. Mostrar nombre de la estación de llegada como destino principal; conservar terminal del tren en título y nombre accesible cuando la selección es intermedia. Reutilizar el cálculo de llegada y +1 día en ambas vistas. Ausencia de llegada terminal se muestra como —, sin eliminar un tren válido.
