# Proposal
## Why
La app está limitada a Bilbao. Queremos incorporar núcleos pequeños sin perder la consulta inmediata ni obligar a configurar el trayecto en cada visita.
## What Changes
- Añadir núcleos oficiales de Cercanías con un máximo de seis líneas comerciales, contando cada denominación distinta una vez y ambos sentidos juntos.
- Mostrar siempre el asistente si falta un núcleo válido guardado, incluso con una estación antigua de Bilbao. No inferir ni guardar Bilbao automáticamente.
- Asistente móvil: núcleo, estación de origen y destino opcional. Explicar que se configura una vez y se podrá cambiar después.
- Al completar, guardar núcleo, origen, destino y líneas; abrir directamente próximas salidas en visitas posteriores.
- Conservar colores por núcleo, filtros y tabla diaria; nombre del núcleo más grande y pulsable en la barra de título para cambiarlo, sin añadir otra fila.
## Capabilities
### New Capabilities
- network-catalog: catálogo de núcleos, líneas y horarios oficiales aislados por núcleo.
- journey-onboarding: configuración inicial persistente y recuperación si falta una selección válida.
### Modified Capabilities
- station-board: sustituir la primera visita exclusiva de Bilbao por selección guiada de núcleo y estación.
## Impact
Preprocesado GTFS, snapshot/versionado, validadores, preferencias, cabecera, filtros, tabla diaria, colores y pruebas. Arquitectura estática y JSON compacto; sin backend nuevo. Incidencias en vivo continúan pendientes por separado.
