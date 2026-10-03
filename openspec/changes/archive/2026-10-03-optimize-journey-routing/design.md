## Context
La línea base necesita entre 1,2 y 2,9 segundos por día en tres consultas de Bilbao.
## Decisions
Mantener orden de exploración y desempates. Descartar trenes anteriores a la salida y ramas cuyo tiempo más penalización ya excede el mejor resultado completo. Comprobar llegada de la etiqueta antes de resolver reglas de transbordo.
Caché LRU acotada por día y consulta, vinculada a versión del grafo; solo almacenar respuestas completadas y nunca resultados abortados.
## Risks / Trade-offs
Poda incorrecta → comparación de resultados completos con versión previa, pruebas sintéticas y reglas cualificadas. Caché obsoleta → versión, núcleo, fecha, filtros y dirección en clave.
## Migration Plan
Sin migración de datos. Build local y pruebas de interfaz/offline.

## Ajuste solicitado durante la implementación
El margen implícito del mismo punto se reduce a 60 segundos, etiquetado como estimación. Las reglas explícitas, sus restricciones y los enlaces a pie no cambian. La comparación de rendimiento aplica la misma política a ambas versiones para aislar la optimización.
