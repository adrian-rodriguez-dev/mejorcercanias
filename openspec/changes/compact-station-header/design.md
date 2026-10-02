# Design
## Context
App ya comparte el filtro entre vistas. Timetable se remonta al cambiar estación y perdería la fecha al invertir. El proveedor cancela respuestas anteriores.
## Goals / Non-Goals
Ahorrar altura y consultar la vuelta directamente. Sin rutas con transbordo ni nueva persistencia de destinos.
## Decisions
Selects nativos en una cabecera común de dos filas y botón central de 44 px: nombres largos legibles en móvil. Catálogo completo excepto origen para destino opcional, evitando depender de la fecha/hora actual; combinaciones sin servicio muestran vacío. Invertir conserva línea y pone antiguo origen como destino en una sola actualización React. Conservar instancia de Timetable al cambiar origen para mantener fecha/hora. Cuando destino se vacía, desactivar filtro de llegada. El desplegable muestra solo línea y filtros horarios.
## Risks / Trade-offs
Respuesta antigua tras invertir → abortar cargas y claves estación/fecha existentes. Ruta sin vuelta directa → estado vacío, sin inventar horarios. Las opciones de destino incluyen estaciones sin servicio directo: se indica ausencia de trenes.
