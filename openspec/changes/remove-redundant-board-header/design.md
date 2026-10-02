# Design
## Context
.board-top.compact-top contiene solo rótulo de vista y reloj. El cálculo now también alimenta salidas y no debe eliminarse.
## Goals / Non-Goals
Quitar altura redundante. No cambiar pestañas, fechas ni lógica temporal.
## Decisions
Eliminar el bloque completo, conservar journey-header como inicio. Adaptar prueba existente para ausencia de cabecera/reloj. La propuesta futura de incidencias utiliza la cabecera de origen y no reserva un espacio cuando no hay avisos.
## Risks / Trade-offs
Confundir reloj visual con cuenta atrás → conservar efectos temporales y ejecutar pruebas existentes.
