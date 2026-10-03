# Proposal
## Why
Con mala cobertura debe poder abrirse el panel y consultarse el horario ya descargado.
## What Changes
- Guardar recursos de la aplicación y JSON validados de estaciones consultadas.
- Restaurar un catálogo coherente con sus datos guardados, indicar falta de conexión y vigencia.
- Explicar estaciones no guardadas y bloquear consultas fuera de cobertura.
## Capabilities
### New Capabilities
- `offline-timetables`: consulta local de horarios oficiales vigentes.
## Impact
Service worker generado en build, caché local validada, proveedor de horarios, estado visual y pruebas de producción.
