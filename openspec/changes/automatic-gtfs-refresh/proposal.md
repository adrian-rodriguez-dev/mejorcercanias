# Proposal
## Why
El snapshot oficial se renueva manualmente y puede envejecer aunque la aplicación siga funcionando. La antigüedad debe controlarse centralmente, sin obligar a cada móvil a procesar GTFS.
## What Changes
- Comprobar periódicamente la antigüedad y descargar GTFS oficial al superar 24 horas desde la última comprobación correcta.
- Validar y publicar JSON por estación, conservando el último conjunto correcto si falla la renovación.
- Publicar metadatos de comprobación y versión para que una pestaña abierta detecte y adopte datos nuevos.
- Diferenciar antigüedad de comprobación, fecha de descarga y cobertura de servicios.
Fuera de alcance: tiempo real, backend tradicional, offline persistente e instalación PWA.
## Capabilities
### New Capabilities
- `data-freshness`: renovación central y adopción consistente de datos vigentes por el cliente.
### Modified Capabilities
Ninguna: siguen aplicando vigencia, procedencia y calendario de static-service-calendar.
## Impact
Importador Python, manifiesto público, proveedor y catálogo actualmente embebidos, CI/Pages y pruebas basadas en snapshot fijo. Evoluciona la propuesta de backlog refresh-gtfs-in-actions, sin duplicarla.
