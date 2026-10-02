# Design
## Context
LineBar muestra tres botones fijos y App obtiene disponibilidad del origen. El catálogo GTFS incluye las líneas de cada estación.
## Goals / Non-Goals
Mostrar controles solo cuando ofrecen una elección. Sin cambios de ingestión ni filtrado por fecha.
## Decisions
Intersección de líneas del catálogo entre origen y destino; sin destino usar origen. No depender de los ocho próximos trenes ni de una fecha sin servicio. En la red Bilbao actual las líneas compartidas describen los corredores directos; los trenes siguen comprobando parada posterior y llegada válida.
Normalizar selecciones en cada cambio de filtros/estaciones: quitar incompatibles; con cero o una opción usar selección vacía (todas las compatibles). Ocultar el contenedor completo con menos de dos opciones. Cambiar el origen manualmente sigue reiniciando filtros.
## Risks / Trade-offs
Una futura red con ramales dentro de la misma línea podría requerir un índice de conexiones dirigido; el filtro de servicios sigue evitando trenes que no paran en destino. Evitar limpiar destino al marcar líneas por ausencia temporal de servicios.
