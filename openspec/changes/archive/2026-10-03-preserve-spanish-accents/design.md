# Design
## Context
Un catálogo anterior contiene nombres como San MamÃ©s, que pueden seguir en clientes abiertos.
## Goals / Non-Goals
Simplificar y mantener datos correctos; no cambiar calendarios ni filtros de trayecto.
## Decisions
Reparación conservadora Latin-1→UTF-8 solo si aparece marcador de mojibake y la decodificación estricta es válida. No tocar archivos históricos inmutables. Validar etiquetas al ingerir GTFS; lecturas/escrituras Python explícitamente UTF-8.
## Risks / Trade-offs
Conservar estados de carga, error y fecha no publicada; verificar móvil y caracteres españoles con pruebas.
