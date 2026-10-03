## Context
El proveedor actual entrega salidas por estación. No preserva todos los identificadores de viaje para buscar transbordos.
## Goals / Non-Goals
Integración en origen/destino actuales, sin backend ni selector adicional. Solo núcleos ya publicados; no incorporar metro ni tiempo real.
## Decisions
Portar el algoritmo por rondas de renfe-cli (938db153), máximo cuatro trenes, 300 s de cambio por defecto, penalización de 900 s por transbordo y horizonte de viaje de 24 h. Conservar etiquetas por viaje entrante para respetar reglas GTFS cualificadas. Calendarios y >24 h se materializan en Europe/Madrid. Procesar por núcleo en Web Worker cancelable.
Generar routing JSON versionado junto al snapshot. Normalizar estaciones/puntos y transfers en preprocesado; el motor no conoce Los Rosales. Selección visible mantiene estación original; internamente representa sus puntos de embarque. Enlaces de mapas con política estimada 600 s, fuente identificada y estado separado.
La línea seleccionada filtra el primer tren, no exige que todos los tramos usen la misma línea. Snapshots antiguos sin grafo conservan servicios directos.
## Risks / Trade-offs
Horarios teóricos e incidencias no aplicadas → mantener aviso de programados y panel de avisos. Estimación peatonal → identificarla en detalle. Datos ausentes → error explícito, nunca inventar rutas.
## Migration Plan
Publicar grafo y manifiesto de misma versión. Mantener catálogo de preferencias. Revertir commit para volver al proveedor directo.
