# mejorcercanías

**Abrir → mirar → saber cuándo pasa el tren.** Primera vertical de `mejorcercanias.es`, centrada en Cercanías Bilbao.

> **Demo funcional con horarios ficticios. No sirve para planificar un viaje.** La ingestión oficial de Renfe es la siguiente propuesta; esta entrega no contiene horarios GTFS reales ni información en tiempo real.

## Qué funciona

- React 19 + TypeScript estricto + Vite, SPA estática sin backend, base de datos ni .NET.
- Elegir entre cinco estaciones de muestra: Barakaldo, Bilbao-Abando, Portugalete, Santurtzi y Amurrio.
- Recordar la estación en este navegador y abrir directamente su panel al volver.
- Ver hasta ocho salidas con línea, destino, hora de Bilbao y cuenta atrás automática cada 15 segundos.
- Estados de carga, ausencia de salidas, error y reintento; persistencia degradada a memoria si el navegador bloquea almacenamiento.
- Diseño móvil, selector nativo accesible, foco visible y horarios independientes del huso del dispositivo.

No incluye todavía horario completo, PWA, GTFS real, refresco de GTFS ni tiempo real. La demo genera hoy y mañana entre 06:00 y 23:00; los trenes de mañana se identifican como tales.

## Desarrollo local

Usa **Node 24 LTS** (ver `.nvmrc`). El Node 22.12 incluido en algunos equipos es anterior al mínimo de ciertas dependencias de OpenSpec. No es necesario instalar OpenSpec globalmente.

```sh
npm ci
npm run dev
```

Abre la dirección que imprime Vite, normalmente `http://127.0.0.1:5173`. Elige una estación y recarga para comprobar que la recuerda. Para cambiarla, usa el mismo selector. No se guardan viajes, identidad ni ubicación.

```sh
npm test                 # lógica temporal y componentes
npm run build            # TypeScript y salida estática dist/
npm run preview          # servir dist localmente
npm run check            # pruebas + build + validación OpenSpec
npx playwright install chromium
npm run test:e2e          # escritorio y móvil a 360 px
```

`dist/` se puede alojar como archivos estáticos. La base relativa permite servir la aplicación en una subcarpeta. No hay rutas que requieran un servidor de aplicación. El dominio y el despliegue público no están configurados. CI verifica las pruebas y la compilación; no publica automáticamente.

## Arquitectura

```text
JSON demo por estación -> ScheduleProvider -> salidas con instante absoluto
                                                 |
localStorage -> estación seleccionada -> panel React + reloj

Futuro: GTFS Renfe -> preprocesado build/CI -> JSON por núcleo/estación
```

- `src/data/`: contrato, catálogo, proveedor y cálculo temporal; ver [contrato](docs/data-contract.md).
- `public/data/demo/`: patrones ficticios pequeños. El navegador solo solicita el de la estación elegida.
- `src/App.tsx`: estados del panel, descarte de cargas anteriores y refresco de reloj.
- `src/preference.ts`: preferencia versionada y manejo de almacenamiento bloqueado.
- `src/style.css`: diseño responsive sin fuentes, imágenes ni frameworks externos.
- `tests/`: pruebas de navegador y captura de escritorio/móvil.

Luxon realiza la aritmética de días en Europe/Madrid para respetar el cambio de hora. Los tiempos del contrato son ISO con offset; ordenar y descontar se hace por instante absoluto. No se calcula GTFS en el navegador.

## OpenSpec: antes de las features

Se verificó la [documentación oficial](https://openspec.dev/docs/cli) y se inicializó **OpenSpec 1.14.0** mediante `openspec init --tools=codex`, con el esquema oficial `spec-driven`. La integración generada está en `.agents/skills/`. El flujo sigue las [instrucciones oficiales](https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md).

La primera propuesta es [bootstrap-app-and-station-board](openspec/changes/bootstrap-app-and-station-board/proposal.md). Contiene [exploración](openspec/changes/bootstrap-app-and-station-board/exploration.md), `proposal.md`, `design.md`, `specs/station-board/spec.md` y `tasks.md`. La exploración es un registro adicional pedido para este proyecto: **no existe un comando CLI `openspec explore`**.

En Codex, selecciona la skill correspondiente o usa:

1. `$openspec-explore`: explorar objetivos, restricciones y alternativas.
2. `$openspec-propose nombre-del-cambio`: crear propuesta, specs, diseño cuando proceda y tareas, siguiendo las dependencias oficiales.
3. Revisar los artefactos y pedir `$openspec-apply-change nombre-del-cambio` para implementar.
4. Ejecutar las pruebas y validación; usar `$openspec-sync-specs` y `$openspec-archive-change` al cerrar el cambio.

Las skills instaladas separan planificación de implementación. En esta entrega el usuario pidió expresamente ambas fases en una misma sesión; se mantuvo el orden y se hizo un commit de las specs antes del código. Para nuevas propuestas conviene revisar los artefactos antes de aplicar.

Comandos **de terminal** para inspeccionar o crear el esqueleto oficial:

```sh
npm run spec -- list --json
npm run spec -- list --specs
npm run spec -- new change nombre-del-cambio
npm run spec -- status --change nombre-del-cambio --json
npm run spec -- instructions proposal --change nombre-del-cambio --json
npm run spec -- validate --all --strict
```

Después de `new change`, seguir `status` y `instructions` para cada artefacto en el orden que devuelve la herramienta. No crear carpetas de cambios manualmente ni escribir una spec gigantesca. Los nombres de invocación de skills y comandos CLI son distintos.

El cambio inicial se mantiene abierto para revisión; `openspec/specs/` todavía no contiene la especificación consolidada. Al archivarlo, OpenSpec sincroniza sus deltas. No confundir tareas terminadas con un cambio ya archivado.

## Datos oficiales y siguientes pasos

La fuente objetivo es el [GTFS estático oficial de Renfe](https://data.renfe.com/dataset/horarios-cercanias), publicado con CC BY 4.0. El [estudio de datos y CORS](docs/renfe-data.md) registra fuentes, comprobaciones y límites. Los fixtures de esta demo son propios y no derivan de horarios oficiales.

El [roadmap](docs/roadmap.md) identifica ocho áreas independientes sin especificarlas por adelantado. Prioridad siguiente: `ingest-renfe-static-gtfs`, incluyendo calendarios, vigencia, excepciones y pruebas de días de servicio. Solo después se podrá presentar el producto como consulta de horarios reales.
