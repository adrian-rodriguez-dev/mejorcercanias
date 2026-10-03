# GitHub Actions y artefactos

La definición ejecutable está en `.github/workflows/`. Este documento explica la configuración del repositorio; no acredita que los ajustes remotos de GitHub estén activados.

## Flujos

| Workflow                               | Disparador                                            | Resultado                                                                                                                            |
| -------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `Validate` (`ci.yml`)                  | Push, pull request o ejecución manual                 | Invoca `publish.yml` con una revisión fija. Publica solo para push/manual en main.                                                   |
| `Validate and publish` (`publish.yml`) | Reutilizable mediante workflow_call                   | Instala, prueba, construye, conserva informes y publica si recibe publish=true.                                                      |
| `Refresh GTFS` (`refresh-gtfs.yml`)    | Minuto 17 de cada hora UTC; manual con force opcional | Comprueba caducidad por red, genera candidato, valida, hace commit si main no avanzó y llama explícitamente al flujo de publicación. |

En un PR se valida la revisión de integración que GitHub proporciona en `github.sha`. En push/manual se usa el SHA del evento. Los checks corren en Ubuntu con Node 24 y Python 3.12.

`publish.yml` ejecuta Python, pruebas del worker, `npm run check`, navegador con fixtures y offline con producción. Solo después empaqueta `dist/`. La publicación comparte el grupo de concurrencia `github-pages` y compara la revisión con main justo antes del despliegue para rechazar una revisión ya obsoleta; la comprobación no es una transacción con futuros pushes.

## Refresco sin trabajo innecesario

El renovador devuelve sin descargar si todas las redes cubren hoy. Después se examinan únicamente `src/data/renfe-manifest.json` y `public/data/renfe`, incluyendo archivos nuevos. Sin cambios se omiten instalaciones, pruebas posteriores, commit y publicación; el resumen del job lo indica.

Con cambios, se valida antes de hacer commit. El push es normal, sin force: si main avanzó, el job aborta. Se invoca expresamente el workflow reutilizable porque un push hecho con GITHUB_TOKEN no debe ser el mecanismo del que dependa esta publicación. `force` vuelve a consultar la fuente aunque la cobertura siga vigente; el mismo ZIP puede actualizar metadatos de comprobación.

Si los datos se han commiteado y luego falla la publicación, main puede ir por delante de Pages. Recuperar ejecutando manualmente **Validate sobre main**; un refresco sin cambios no es un mecanismo de republicación.

## Artefactos y archivos

| Salida                           | Productor / consumidor                                     | Persistencia                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `dist/`                          | `npm run build`; hosting estático                          | Local, ignorado por Git. Contiene HTML, JS/CSS, SW, iconos, licencias y todos los datos públicos conservados.                |
| `site-preview`                   | Validación exitosa que no publica                          | Artefacto Actions, 7 días. Descargar/descomprimir y servir por HTTP, no abrir con file://.                                   |
| `github-pages`                   | `upload-pages-artifact` cuando publish=true                | Artefacto de transporte consumido por deploy-pages; retención predeterminada de la acción, no copia de seguridad permanente. |
| `browser-diagnostics`            | Flujo reutilizable, incluso tras fallo si existen archivos | Informes HTML y trazas/resultados de ambas suites; 7 días.                                                                   |
| `refresh-diagnostics`            | Refresco fallido si produjo archivos                       | Informe/trazas e2e; 7 días.                                                                                                  |
| `src/data/renfe-manifest.json`   | Importador/renovador; build y cliente                      | Versionado en Git; catálogo, calendarios, fuente, cobertura y exclusiones.                                                   |
| `public/data/renfe/<versión>/`   | Pipeline Python; cliente y build                           | Estaciones, grafos y manifiesto de esa versión; retenidos según política de datos.                                           |
| `public/data/renfe/current.json` | Renovador; comprobador del cliente                         | Puntero a snapshot publicado junto con el sitio.                                                                             |
| `app-version.json`, `sw.js`      | Plugin `build/app-version.ts`                              | Generados en dist; cada build tiene identificador nuevo.                                                                     |
| Resultados de benchmark          | Script local                                               | `work/`, no subidos automáticamente.                                                                                         |

Un informe puede no existir si falló npm ci, la compilación o la instalación de Chromium. En ese caso consultar el log del paso. Un artefacto de preview acredita que pasaron las pruebas de esa revisión, no que esté desplegada ni que su cobertura siga vigente al descargarlo días después.

## Ajustes de GitHub que debe revisar el responsable

- Pages configurado con **GitHub Actions** como origen y entorno `github-pages`.
- Actions habilitado, permiso de escritura para el bot de renovación y permisos de Pages/OIDC para desplegar.
- Protección de main: exigir revisión y el check real que aparece en el PR. Si la protección impide el push directo del bot, hay que diseñar un flujo de PR de datos o una excepción controlada; no desactivar la protección sin decidirlo.
- Variable de repositorio `ALERTS_URL`, si se despliega la pasarela; su valor es público.
- Notificaciones de ejecuciones fallidas y responsables de revisar cobertura.

El schedule de GitHub no garantiza ejecución exacta y puede suspenderse por inactividad. Las acciones están fijadas por versión mayor, no por SHA inmutable: endurecimiento pendiente, registrado en la revisión.
