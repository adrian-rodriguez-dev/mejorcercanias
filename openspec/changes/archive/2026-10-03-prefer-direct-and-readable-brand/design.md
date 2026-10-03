# Design
## Decisions
Comparar cada alternativa con directos que salen a la misma hora o después. Conservar transbordos solo si llegan al menos 900 segundos antes; mostrar el ahorro cuando exista directo comparable. Conservar los directos al generar candidatos incluso si el motor elige una conexión más rápida en esa salida. Impedir regresar a cualquier nodo del grupo de origen y abordar un tren que ya admitía embarque allí después de iniciar la consulta. Aplicar filtros y restricciones GTFS también a directos.
El nombre de marca determina el ancho; lema en una línea con palabras distribuidas a ese ancho y tamaño proporcional legible. Estado de líneas mediante color y aria-pressed.
Normalizar nombres de nodos y destino en presentación; reparar secuencias UTF-8 leídas como Latin-1 o Windows-1252 sin alterar texto válido.
## Risks
Un filtro de línea puede excluir un directo; no se cambia implícitamente. La preferencia compara salidas alcanzables, nunca directos ya perdidos. Mantener transbordos útiles sin directo y excepciones de calendario/embarque. No regenerar snapshots ni tocar el pipeline de mapas paralelo.
