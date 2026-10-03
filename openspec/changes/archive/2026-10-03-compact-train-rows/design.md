# Design
## Context
Las filas usan padding vertical de 14 px y nombre móvil de 13 px. La cuenta atrás redondea hacia arriba.
## Goals / Non-Goals
Mejorar densidad sin truncar estaciones ni cambiar filtros o datos.
## Decisions
Reducir padding a 7 px y mínimos de altura; nombre 16 px y horas 16 px. Conservar ajuste de líneas para nombres largos. Comparar el instante real con 60 minutos para la hora grande; reutilizar clockTime Europe/Madrid y conservar el indicador de día.
## Risks / Trade-offs
Mayor letra puede envolver nombres largos: permitir crecimiento natural sin alturas fijas; verificar a 360 px.
