## Context
Prefijos oficiales 10 (Madrid) y 51 (Rodalies). GTFS contiene viajes activos con cero o una parada. No permiten inferir un trayecto.
## Goals / Non-Goals
Incorporar datos utilizables con advertencia explícita; no reconstruir horarios ni añadir FGC/Metro.
## Decisions
Admisión parcial explícita solo en las nuevas redes: informe con trip_id y motivo, usado para excluir exactamente los mismos viajes en panel y router. Fallar ante secuencias duplicadas o tiempos no monótonos. El modo bus viaja como metadato opcional compatible con snapshots previos. Rodalies agrupa regionales y servicios territoriales para permitir enlaces dentro del mismo grafo.
## Risks / Trade-offs
Rutas incompletas por registros oficiales ausentes; aviso persistente en red afectada. Grafos mayores descargados bajo demanda.
