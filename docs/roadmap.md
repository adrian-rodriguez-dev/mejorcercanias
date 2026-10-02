# Propuestas futuras

Esto es un backlog, no ocho especificaciones aprobadas. Crear cada propuesta con OpenSpec cuando llegue su turno.

| Área / propuesta sugerida           | Resultado y límite                                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `refine-station-shell`              | Evolucionar el shell inicial, accesibilidad y legibilidad con uso real; evitar convertirlo en buscador de rutas.                                              |
| `expand-favorite-station-selection` | Sustituir las cinco estaciones demo por catálogo real, búsqueda y gestión de favorita; persistencia simple ya existe.                                         |
| `ingest-renfe-static-gtfs`          | Descargar GTFS oficial, validar calendario y excepciones, generar catálogo y JSON compacto por estación/núcleo con vigencia y atribución. Primera prioridad.  |
| `scheduled-departure-board`         | Conectar horarios oficiales al panel, identificar dirección, gestionar agotamiento/vigencia y eliminar semántica demo. No afirmar puntualidad.                |
| `full-day-timetable`                | Consultar todo el día conservando la estación favorita, con agrupación por dirección y días de servicio correctos.                                            |
| `pwa-basic-offline`                 | Instalación y último horario válido en caché; indicar offline y antigüedad, sin prometer tiempo real.                                                         |
| `refresh-gtfs-in-actions`           | Automatizar la ingestión validada, publicar de forma atómica y conservar el último dataset correcto ante fallos. La CI actual solo verifica código.           |
| `renfe-realtime-adapter`            | Verificar correspondencia de trip_id/stop_id, CORS desde el origen final, cancelaciones, caducidad y fallback al horario. Worker mínimo solo si es necesario. |

Dependencias principales: ingestión → panel real → horario completo; datos vigentes → offline; ingestión validada → refresco automático; panel real e IDs comprobados → tiempo real. No se crea backend tradicional por anticipado.

## Actualización: horario por fecha (2026-10-02)

La ingestión inicial de GTFS y el horario completo se han implementado en `date-aware-timetable`: 44 estaciones, fechas efectivas, filtros de salida/llegada y JSON compacto por estación. Las filas anteriores describen el backlog original; `ingest-renfe-static-gtfs`, `scheduled-departure-board` y `full-day-timetable` ya tienen una primera implementación. Próxima prioridad: refresco automático antes de que caduque el snapshot, luego PWA y tiempo real en propuestas independientes.

## Instalación solicitada (2026-10-02)

Propuesta [pwa-install-prompt](../openspec/changes/pwa-install-prompt/proposal.md) preparada: instalación opcional, aviso discreto y ayuda iOS. Pendiente de implementar. Offline de horarios se mantiene separado.

## Renovación solicitada (2026-10-02)

[automatic-gtfs-refresh](../openspec/changes/automatic-gtfs-refresh/proposal.md) concreta refresh-gtfs-in-actions: comprobación central horaria, renovación al finalizar la vigencia oficial del snapshot y JSON ligeros para el móvil. Spec preparada, implementación pendiente.

## Barra de líneas (2026-10-02)

Spec [line-button-bar](../openspec/changes/archive/2026-10-02-line-button-bar/proposal.md): Todas, C1, C2 y C3 como botones visibles, identidad cromática oficial y selección accesible. Implementada y publicada.

## Incidencias compactas (2026-10-02)

[compact-service-alerts](../openspec/changes/compact-service-alerts/proposal.md): indicador en la barra del título solo con avisos relevantes, detalle a un toque y cero espacio reservado sin incidencias. Prioridades: espacio útil y facilidad de uso. Spec preparada, implementación pendiente.

La barra evoluciona a [multiselección](../openspec/changes/archive/2026-10-02-multi-line-toggle-bar/proposal.md): sin Todas, ninguna selección muestra todas; recuadros de color completo oscuros/inactivos y luminosos/activos.

