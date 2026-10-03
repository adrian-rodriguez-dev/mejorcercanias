# mejorcercanías

**Abrir → mirar → saber cuándo pasa el tren.** SPA estática para Cercanías Bilbao, React + TypeScript + Vite.

**Web pública:** https://adrian-rodriguez-dev.github.io/mejorcercanias/

## Qué puedes consultar

- **Próximos trenes** es la pantalla inicial: estación favorita, línea, destino, hora y cuenta atrás. Al elegir destino muestra salida y llegada a esa parada (aunque no sea la terminal); sin destino la llegada desaparece. La cuenta atrás siempre indica cuánto falta para salir y las llegadas al día siguiente muestran +1 día.
- **Horario completo** muestra toda la tabla de un día, sin ocultar las salidas anteriores a la hora actual.
- **Hoy / Mañana / fecha / anterior / siguiente** para cambiar de día fácilmente.
- **Origen y destino opcional** en la cabecera del panel oscuro. El propio nombre es el selector; el botón ⇅ invierte el trayecto al instante, conservando vista, fecha, hora y línea. La línea se elige en la barra visible **C1 · C2 · C3** (selección múltiple; ninguna marcada muestra todas), con [colores oficiales](docs/line-colors.md); solo los filtros horarios permanecen plegados. La selección se conserva al cambiar de vista durante la visita y se reinicia al cambiar de estación. Incluye paradas intermedias del mismo tren.
- **Destino directo**, **Salir a partir de** o **Llegar antes de**, con hora de salida y llegada del mismo tren.
- Atajo **Mañana a Bilbao antes de las 09:00**: configura fecha, destino y hora; destaca la última salida compatible y conserva todas las alternativas anteriores.
- **Ver todo el día** elimina los filtros. Volver a Próximos trenes recupera el panel inmediato.

Se utilizan **horarios programados oficiales de Renfe**, no tiempo real. Fines de semana y excepciones se resuelven con los calendarios publicados por el operador; no se asume que festivo equivale a domingo. No se buscan transbordos ni se incluyen Euskotren o metro. Deja margen si tienes una cita: las llegadas programadas no garantizan puntualidad.

El snapshot inicial cubre **1–30 de octubre de 2026**, 44 estaciones de Bilbao C1/C2/C3. Fuera del horizonte la app indica que no hay datos publicados, sin repetir un horario de otro día. **El refresco aún es manual**; consulta [regeneración de datos](docs/gtfs-import.md) antes de que caduque. Los fixtures demo permanecen solo como soporte de desarrollo.

## Desarrollo

Node **24 LTS** (ver `.nvmrc`):

```sh
npm ci
npm run dev
```

Abre la URL de Vite (normalmente `http://127.0.0.1:5173`). No requiere base de datos, backend, cuentas, API keys ni .NET. La estación se guarda solo en este navegador. Las cinco favoritas de la demo se migran a IDs oficiales.

```sh
npm test
npm run build
npm run preview
npm run check
npx playwright install chromium
npm run test:e2e
python -m unittest discover -s scripts -p 'test_*.py'
npm run format
```

Python 3.12+ solo se necesita para regenerar/probar el importador, no para ejecutar la aplicación. `dist/` contiene archivos estáticos y admite hosting en subcarpeta. GitHub Actions comprueba pruebas, build y OpenSpec y publica `dist/` en GitHub Pages tras cada push válido a `main`. Los pull requests solo validan. Pages utiliza GitHub Actions como origen y el entorno `github-pages`. El dominio propio mejorcercanias.es y la renovación automática de datos siguen pendientes.

## Arquitectura

```text
GTFS Renfe ZIP -> preprocesador Python -> manifiesto + JSON versionado por estación
                                                      |
preferencia local -> estación -> proveedor -> próximas salidas / horario por fecha
```

- `scripts/import_gtfs.py`: calendarios semanales y excepciones, selección explícita de Bilbao, tiempos y paradas. CSV en streaming; no se envía el GTFS bruto al navegador.
- `src/data/renfe-manifest.json`: fuente, hash del ZIP, vigencia, catálogo y fechas efectivas.
- `public/data/renfe/<versión>/`: JSON compacto por estación, aproximadamente 1,3 MB en total para este snapshot.
- `src/data/renfe.ts`: materializa horarios del día civil en Europe/Madrid, también desde servicios anteriores con horas >24.
- `src/data/timetable.ts`: filtros de salida y llegada para viajes directos.
- `src/App.tsx`: panel inmediato, preferencia y cambio de vista.
- `src/Timetable.tsx`: tabla por fecha y consulta de llegada.

Los tiempos GTFS se calculan desde mediodía local menos doce horas, respetando DST. Cargas antiguas no pueden reemplazar una nueva fecha/estación. Ver [contrato](docs/data-contract.md), [importador](docs/gtfs-import.md) y [comprobaciones](docs/verification.md).

## OpenSpec antes de desarrollar

Configurado con **OpenSpec 1.14.0**, `openspec init --tools=codex`, esquema oficial `spec-driven`. Skills generadas en `.agents/skills/`. Se siguió la [documentación oficial](https://openspec.dev/docs/cli).

La [primera vertical](openspec/changes/archive/2026-10-02-bootstrap-app-and-station-board/proposal.md) está archivada y consolidada en `openspec/specs/station-board/spec.md`. Su [exploración](openspec/changes/archive/2026-10-02-bootstrap-app-and-station-board/exploration.md) conserva las decisiones iniciales.

El cambio [date-aware-timetable](openspec/changes/archive/2026-10-02-date-aware-timetable/proposal.md) añade calendario oficial, horario diario y llegada antes de una hora. Tiene propuesta, diseño, deltas de especificación y tareas. Está archivado y sus requisitos consolidados en las specs. El cambio [compact-line-destination-filters](openspec/changes/archive/2026-10-02-compact-line-destination-filters/proposal.md) documenta los filtros móviles compartidos; su propuesta se creó antes de implementar.

Para una nueva feature en Codex:

1. `$openspec-explore` para investigar alcance y alternativas.
2. `$openspec-propose nombre-del-cambio` para preparar propuesta, specs, diseño y tareas.
3. Revisar los artefactos y pedir `$openspec-apply-change nombre-del-cambio`.
4. Probar, validar, sincronizar specs y cerrar con `$openspec-archive-change`.

Estos son nombres de skills, no comandos de terminal. La autorización expresa del usuario para implementar se conserva durante la sesión; no se vuelve a pedir por cada paso.

```sh
npm run spec -- list --json
npm run spec -- list --specs
npm run spec -- new change nombre-del-cambio
npm run spec -- status --change nombre-del-cambio --json
npm run spec -- instructions proposal --change nombre-del-cambio --json
npm run spec -- validate --all --strict
```

Seguir el orden de dependencias que devuelve OpenSpec y obtener `instructions` para cada artefacto; no crear carpetas de cambios manualmente. Explore no es un comando CLI. No especificar el backlog entero por adelantado.

## Fuente y siguientes pasos

[Datos oficiales de Renfe](https://data.renfe.com/dataset/horarios-cercanias), **Renfe Operadora · CC BY 4.0**. Se han filtrado y transformado para esta aplicación independiente, sin afiliación con Renfe.

Pendientes: refresco periódico de GTFS, PWA/offline y adaptador de tiempo real. Ver [roadmap](docs/roadmap.md) y [estudio de CORS](docs/renfe-data.md).

Cambio de UX: [cabecera compacta e intercambio](openspec/changes/archive/2026-10-02-compact-station-header/proposal.md).

Las líneas se marcan de forma independiente: el recuadro completo se ilumina al activarlas y queda oscuro al desmarcarlas.

El panel empieza directamente en origen y destino: no incluye rótulo de vista ni reloj redundantes. Se conservan las pestañas y las cuentas atrás de cada tren.

La barra de líneas muestra solo las que pasan por origen y destino; con cero o una opción se oculta por completo. Sin destino se usa el origen. Cambiar estaciones elimina selecciones incompatibles; la disponibilidad no depende de los próximos ocho trenes ni de una fecha sin servicio.

Se recuerdan origen, destino y líneas en localStorage (`mejorcercanias.journey.v1`), incluidas selecciones vacías. Al abrir se valida el catálogo y se migra la antigua preferencia de estación. Si no se puede guardar, la selección funciona durante la visita.

## Instalación
Manifiesto e iconos permiten instalación en navegadores compatibles. La invitación aparece bajo los trenes cuando hay mecanismo nativo o guía iOS. «Ahora no» y descartar el diálogo silencian 30 días; la ayuda del pie sigue accesible. Sin almacenamiento, el cierre dura la sesión. No se añade service worker ni se promete acceso offline. Referencia: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable

Validación: eventos nativos simulados, guía iOS, rechazo, teclado, modo instalado y recursos en HTTPS. No hay dispositivo Android/iOS físico conectado: instalación real y relanzamiento en esos sistemas no verificados.

Renovación automática por caducidad: [contrato, pruebas y recuperación](docs/data-freshness.md). El móvil consulta metadatos de versión y JSON compactos; no descarga el GTFS bruto.

Incidencias: indicador compacto y detalle accesible implementados. La fuente directa de Renfe bloquea CORS; la activación en vivo requiere desplegar [la pasarela de avisos](docs/service-alerts.md). Hasta entonces la campana queda neutra, sin aviso visible ni afirmación de ausencia de incidencias.

En próximas salidas, las horas de salida y llegada aparecen bajo el nombre del destino; solo se indica el día cuando es distinto de hoy o la llegada cruza medianoche.

La campana de incidencias está en la barra superior: neutra sin avisos verificables y marcada con contador al haberlos. Se oculta el texto de error de fuente mientras la integración está pendiente. El panel queda a 8 px de la cabecera.

## Núcleos y asistente
Ocho núcleos y 329 estaciones. Sin núcleo guardado se abre siempre el asistente (núcleo, origen y destino opcional). El núcleo se cambia tocando su nombre en la cabecera. [Catálogo, exclusiones, datos y cómo añadir núcleos](docs/networks.md).

Horario completo muestra siempre todos los trenes de la fecha elegida: selector y flechas de día junto a la tabla. Los filtros de origen, destino y líneas se comparten con próximas salidas. Se retiraron los límites de hora y los atajos de mañana.
