# Manual de MejorCercanías

Punto de entrada para desarrollar, revisar, publicar y operar la aplicación. Describe el repositorio revisado el **3 de octubre de 2026**; la existencia de código local no demuestra que esa revisión esté publicada.

| Necesito…                                        | Documento                                                    |
| ------------------------------------------------ | ------------------------------------------------------------ |
| Entender las piezas y dónde tocar                | [Arquitectura y carpetas](architecture.md)                   |
| Arrancar, probar y aplicar convenciones          | [Desarrollo y calidad](development.md)                       |
| Saber qué ejecuta Actions y qué archivos produce | [Automatizaciones y artefactos](actions.md)                  |
| Publicar, actualizar datos o recuperar un fallo  | [Manual de operación](operations.md)                         |
| Decidir qué cambios aceptar y quién los revisa   | [Gobierno del proyecto](governance.md)                       |
| Conocer el resultado y límites de esta revisión  | [Revisión de calidad](quality-review.md)                     |
| Interpretar JSON, rutas y tiempos                | [Contrato de datos](data-contract.md)                        |
| Regenerar el GTFS y gestionar versiones          | [Importación](gtfs-import.md), [vigencia](data-freshness.md) |
| Añadir una red o revisar exclusiones             | [Núcleos](networks.md)                                       |
| Activar los avisos                               | [Incidencias](service-alerts.md)                             |
| Consultar pendientes                             | [Hoja de ruta](roadmap.md)                                   |

La extracción cartográfica tiene su propia [guía de pipeline PDF/SVG](map-pipeline.md), con ejecución, artefactos y conservación de Los Rosales.

## Fuentes de verdad

El comportamiento se contrasta con código, pruebas y `openspec/specs/`; las decisiones en curso están en `openspec/changes/`. El manifiesto `src/data/renfe-manifest.json` contiene cobertura, redes, versiones y exclusiones reales. `.github/workflows/` define la automatización. La ejecución exitosa en Actions y el entorno `github-pages` confirman una publicación; `publishedAt` por sí solo no la confirma.

[verification.md](verification.md) es un registro histórico de comprobaciones, no una lista de garantías vigentes. [renfe-data.md](renfe-data.md) conserva investigación de fuentes; [line-colors.md](line-colors.md), criterios de colores. No usar cifras históricas para decidir si hoy hay datos.
