# Design
## Context
Las fechas de servicio ya se validan por núcleo. La app usa JSON inmutables identificados por versión.
## Decisions
Precache atómico del shell con service worker: navegación network-first con fallback al index precacheado, assets por hash, metadatos de versión siempre red. Las actualizaciones esperan al gesto Actualizar; no recargar otras pestañas. Guardar solo JSON validados en Cache Storage desde el proveedor, con límite de 12 estaciones y dos versiones. Persistir manifiesto adoptado; restaurarlo al arranque si es más reciente que el incluido en el build. Ante almacenamiento bloqueado seguir funcionando online. No guardar alertas como actuales. Aviso solo al estar offline o usar fallback de red; incluir vigencia. Fechas fuera de cobertura nunca se extrapolan.
## Risks / Trade-offs
El navegador puede eliminar cachés: describirlo en documentación. Primera visita necesita conexión. Pruebas deben ejercitar build real y service worker, no solo mocks de fetch.
