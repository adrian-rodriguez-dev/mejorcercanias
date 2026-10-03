# Gobierno del proyecto

## Responsabilidades

El responsable del repositorio decide alcance y publicación; quien mantiene datos revisa fuentes, cobertura, exclusiones y conexiones; quien revisa código exige pruebas y actualización documental. Una misma persona puede asumir esos papeles, pero conviene dejar autor/revisor y motivo en cada PR. No hay un equipo ni CODEOWNERS configurados por esta revisión.

## Reglas del producto

- Renfe es la fuente de verdad ferroviaria. Los mapas de terceros pueden ayudar a investigar, pero no justifican incorporar conexiones.
- Diferenciar misma estación/punto de embarque, estaciones distintas con enlace peatonal y simbología informativa. Parking o intercambio con metro no crean por sí solos un arco del router de Cercanías.
- Cada corrección debe tener IDs, dirección, evidencia, tipo y margen; si es estimado, indicarlo. Usar `data/routing-corrections.json` y pruebas. No añadir condiciones por nombre de ciudad al motor.
- El margen implícito actual es 60 segundos en el mismo punto; conexiones de mapas revisadas usan 600 segundos estimados. Revisar estas políticas mediante cambio de producto, no como limpieza de código.
- Vigencia por núcleo, sin repetir horarios fuera de calendario. No atribuir al operador tiempos inventados.
- Las exclusiones parciales de Madrid/Rodalies son explícitas y visibles. No extender silenciosamente esa tolerancia a otras redes.

## Proceso de cambio

Registrar problema, alcance, evidencia, pruebas y riesgo de recuperación. Para nuevas capacidades usar OpenSpec: `npm run spec -- new change nombre`, consultar `instructions` de cada artefacto, implementar, validar y archivar. Para mantenimiento sin cambio de requisitos declarar `skip_specs: true`. No cerrar cambios activos ajenos; la integración real de incidencias continúa pendiente.

Antes de integrar, revisar diff, datos afectados, accesibilidad y documentación. Main publica automáticamente: la integración es una decisión de publicación. Ninguna acción local de esta revisión ha configurado protecciones remotas ni desplegado la aplicación.

## Cambios de datos y compatibilidad

Incrementar TRANSFORM_VERSION cuando cambie la semántica del importador. La versión del snapshot deriva del ZIP, versión de transformación y correcciones; cambiar código Python sin actualizarla podría sobrescribir una ruta que los clientes tratan como inmutable. Si cambia el esquema de JSON, coordinar generador, validadores, fixtures, consumidor y política para clientes antiguos.

El pipeline de mapas investigado en otro espacio no forma parte del runtime ni se ejecuta por Actions en este repositorio. Aquí se consume la configuración revisada de enlaces; incorporar extracción automática de PDF/SVG requiere una propuesta propia, evidencia y revisión humana de resultados ambiguos.

## Privacidad, credenciales y licencia

No hay cuentas ni base de datos de usuarios. Origen/destino, núcleo y tema se almacenan en el navegador; los horarios en Cache Storage. Las peticiones al hosting y a la fuente/pasarela pueden dejar logs del proveedor; no afirmar anonimato absoluto. No añadir analítica ni enviar trayectos a terceros sin decidirlo explícitamente.

VITE_ALERTS_URL y la variable de repositorio ALERTS_URL son públicas. Credenciales de publicación deben permanecer en el proveedor/secretos de CI, nunca en código, capturas, datos ni artefactos. Revisar trazas antes de compartirlas fuera del proyecto.

Mantener atribución Renfe Operadora y CC BY 4.0 para datos, y aviso BSD-3-Clause de renfe-cli. El repositorio no contiene una licencia general de la app; su elección corresponde al titular. No presentar la aplicación como oficial.

## Decisiones pendientes

Responsable operativo y notificaciones; política de protección de main compatible con el bot; licencia del código; activación de avisos; incorporación de redes excluidas; límites de memoria para grafos; pruebas en Safari y móviles físicos. [Hoja de ruta](roadmap.md).
