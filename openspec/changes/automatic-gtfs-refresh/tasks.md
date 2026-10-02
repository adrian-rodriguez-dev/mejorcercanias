# Tasks
## 1. Contrato e importador
- [ ] 1.1 Separar checkedAt/downloadedAt/publishedAt y antigüedad; probar límite exacto de 24 horas, fecha inválida/futura, --zip, hash igual y cobertura caducada; documentar contrato.
- [ ] 1.2 Preparar snapshot en staging y metadatos públicos; probar fallos, referencias/versiones coherentes y retención de datos anteriores; documentar recuperación.
## 2. Cliente
- [ ] 2.1 Introducir snapshot activo con comprobación ligera al abrir/reanudar/cada hora; probar adopción atómica, respuestas tardías, filtros preservados e IDs eliminados.
- [ ] 2.2 Mostrar última comprobación y aviso discreto de antigüedad; probar red fallida, esquema incompatible y móvil sin bloquear trenes; documentar que GTFS nunca se descarga en móvil.
## 3. Automatización y entrega
- [ ] 3.1 Separar fixtures de pruebas del snapshot vivo; pasar pruebas con datos renovados y datos fixture sin dependencia del mes actual.
- [ ] 3.2 Configurar schedule horario, ejecución manual, commit limitado y despliegue explícito serializado; probar carrera con push, fallo de descarga/despliegue y conservación del último sitio válido; documentar reactivación.
- [ ] 3.3 Validar OpenSpec/build/tests, ejecutar renovación manual y comprobar versión/metadatos/JSON en Pages y una pestaña abierta; registrar evidencia real.
