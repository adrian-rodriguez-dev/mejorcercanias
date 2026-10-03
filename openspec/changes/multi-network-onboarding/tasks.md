# Tasks
## 1. Catálogo y datos
- [x] 1.1 Contrastar núcleos candidatos y líneas con Renfe; documentar mapa de rutas/colores y exclusiones, comprobando el límite de seis sin duplicar sentidos ni admitir regionales.
- [x] 1.2 Generalizar importador y validación por núcleo, con pruebas de referencias cruzadas, calendarios/festivos y vigencia independiente; generar JSON solo para núcleos validados.
- [x] 1.3 Incorporar identidad del transformador al versionado y adaptar actualización/retención; probar mismo ZIP con transformación nueva, fallo de un núcleo y cliente con snapshot antiguo, documentando recuperación.
## 2. Configuración y panel
- [x] 2.1 Implementar preferencias con núcleo explícito y asistente de tres pasos; probar favorito v1 sin núcleo, primera visita, abandono/recarga, destino opcional, núcleo inválido y almacenamiento bloqueado.
- [x] 2.2 Convertir el nombre del núcleo en control mayor dentro de la cabecera; verificar cambio, cancelación, teclado, foco y ausencia de solapamiento con campana a 360 px.
- [x] 2.3 Limitar estaciones, colores, filtros y atajos al núcleo; verificar en ambas vistas dos redes con C1, multiselección, hasta seis botones y ocultación cuando solo haya una línea posible.
- [x] 2.4 Restaurar configuración completa al volver, invalidando únicamente selecciones incompatibles; probar cambio de núcleo e intercambio sin mezcla de trayectos.
## 3. Entrega
- [x] 3.1 Documentar núcleos publicados y procedimiento de alta en README; ejecutar pruebas de datos, build, navegador móvil/escritorio y validación OpenSpec estricta.
- [ ] 3.2 Publicar y comprobar primera entrada, regreso y cambio de núcleo en web pública; archivar solo después de guardar evidencia verificable.

