## Why
El extractor cartográfico existe fuera del repositorio. Su mantenimiento manual impide detectar cambios y conservar de forma verificable las decisiones de transbordo, incluido Los Rosales.

## What Changes
- Incorporar extracción PDF/SVG, fuentes revisadas, anotaciones y pruebas.
- Añadir pipeline manual/semanal que genera JSON/CSV, SVG, visor e informe de cambios como artefacto.
- Generar una propuesta del contrato routing-corrections y exigir evidencia vigente antes de promoverla.
- Conservar correcciones operativas ante fuentes cambiadas o extracción incompleta.

## Capabilities
### New Capabilities
- `map-evidence-pipeline`: adquisición, extracción reproducible, revisión y promoción de evidencia cartográfica para rutas.
### Modified Capabilities
Ninguna. El motor y los horarios mantienen su contrato.

## Impact
Nueva herramienta Python con PyMuPDF fijado, datos cartográficos versionados, workflow y documentación. No se incluye el corpus cartográfico en la descarga de la web.
