# Design
## Context
La fila actual tiene destino, columna de horas vertical y cuenta atrás. El destino contiene una línea de metadatos repetidos.
## Decisions
Dos columnas: destino con horas y cuenta atrás. Las horas usan flex con salto entre grupos completos cuando haga falta; no truncar horas. Mantener marca de día solo cuando difiere de hoy. La llegada sigue siendo la de la parada elegida, aunque se conserve la terminal del tren en el nombre.
## Risks / Trade-offs
Nombres largos y medianoche necesitan salto flexible. Verificar móvil y desktop con datos reales y fixture nocturno.
