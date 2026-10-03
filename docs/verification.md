# Verificación de la primera vertical

Entorno local: Windows, Node 24.19.0. Comprobaciones del 2026-10-02.

- `npm test`: 11 pruebas de lógica y componentes, todas correctas.
- `npm run build`: TypeScript estricto y compilación Vite correctos.
- `npm run spec -- validate --all --strict`: propuesta válida.
- `npm run test:e2e`: cuatro pruebas de navegador, dos en escritorio y dos a 360 px, todas correctas.
- Inspección visual de capturas completas en ambos tamaños: sin recortes ni desbordamiento horizontal. El móvil oculta la introducción después de elegir estación para mostrar el primer tren sin desplazarse.

Cobertura: selección, recarga y persistencia, preferencia antigua, almacenamiento bloqueado, descarte de respuestas antiguas, error y reintento, vacío, redondeo de minutos, eliminación de salidas pasadas, medianoche, cambio DST y hora de Bilbao con navegador en America/New_York.

Las capturas se regeneran en `work/preview-desktop.png` y `work/preview-mobile.png` (no versionadas). No se han validado horarios reales, cobertura completa de Bilbao, PWA, uso offline ni GTFS-RT: no están implementados. La validación local no sustituye comprobar GitHub Actions después del push.

## Verificación del horario por fecha · 2026-10-02

20 pruebas TypeScript/componentes, 4 pruebas Python y 6 pruebas de navegador (escritorio y móvil). Build y validación OpenSpec estricta correctos.

Casos nuevos: calendario de sábado/domingo; eliminación de servicio laborable y alta excepcional en fixture festivo; calendar_dates sin calendar; subida/bajada prohibidas; horas >24; DST; límites de llegada inclusivos; ningún destino anterior al origen; fechas no publicadas; migración de favoritas; respuestas tardías; atajo mañana, limpiar filtros y volver a próximas salidas.

Verificación independiente leyendo el GTFS original: el sábado 2026-10-03 desde Desertu-Barakaldo (13400) a Abando (13200), la última opción antes o a las 09:00 sale 08:45 y llega 08:59 (trip_id 6074S29512C2). Las anteriores salen 08:30/08:15 y llegan 08:44/08:29. La aplicación coincide. Es programación, no garantía de puntualidad.

Capturas inspeccionadas a 360 px y escritorio: tabla completa, filtros y recomendación legibles, sin desbordamiento horizontal. Datos reales de 1–30 de octubre; refresco programado, PWA y tiempo real aún pendientes. Las pruebas de navegador fijan su reloj dentro de este snapshot para ser reproducibles.

## Verificación de filtros compactos · 2026-10-02

23 pruebas TypeScript y 8 pruebas de navegador correctas. El importador conserva sus 4 pruebas. Filtro de línea y parada intermedia aplicado antes del límite de ocho salidas; combinación con hora de llegada; conservación entre vistas; limpieza de destino incompatible y cambio de origen. En escritorio y 360 px se comprueba apertura con teclado, devolución del foco al cerrar, controles de al menos 44 px, primer tren visible y ausencia de desbordamiento horizontal. Capturas inspeccionadas: filtros abiertos y cerrados. Los filtros no se guardan en almacenamiento persistente.

GitHub Actions del cambio de filtros: [ejecución 37058431421](https://github.com/adrian-rodriguez-dev/mejorcercanias/actions/runs/37058431421), commit 23f7590, completada correctamente (35 pruebas, build y OpenSpec).

Publicación GitHub Pages: ejecución 37059728144 correcta (724ece3). URL HTTPS responde 200. Navegador Chromium a 360 px contra la web pública: Barakaldo muestra 8 próximas salidas y 181 filas del horario diario, con reloj fijado al snapshot para una comprobación reproducible.

Cabecera compacta: 23 pruebas TypeScript y 10 pruebas de navegador correctas; build y OpenSpec estrictos válidos. Verificados panel único, intercambio Santurtzi/Bilbao con teclado, conservación de fecha y hora, persistencia del origen invertido, destino vacío y ruta sin servicio directo. Móvil 360 px sin desbordamiento y primer tren visible. Capturas inspeccionadas.

GitHub Pages: despliegue 37061542140 correcto, commit 68e0e69. Comprobación pública en móvil: sin tarjeta externa, intercambio a origen Bilbao (13200) y destino Santurtzi (13405), ocho trenes cargados.

Barra de líneas: 23 pruebas unitarias y 10 de navegador correctas, build y OpenSpec válidos. Comprobados teclado, aria-pressed, una fila a 360 px, botones de 44 px, primer tren visible, colores compartidos con etiquetas, Todas conserva destino/hora y disponibilidad basada en catálogo incluso en fechas sin datos.

Barra publicada y verificada en HTTPS a 360 px: cuatro botones y ocho próximas salidas C2 tras seleccionarla. GitHub Actions 37063313340 correcto (81278ec).

Multiselección: 24 pruebas unitarias y 10 de navegador correctas; build y OpenSpec válidos. Unión C1/C2, vacío equivale a todas, destino/hora conservados, estados de fondo distintos, intercambio con línea no disponible desmarcable, primer tren visible y controles de 44 px a 360 px.

Publicación multiselección: Actions 37066108985 correcto (9f9d988). Web pública verificada a 360 px: tres botones y dos líneas activas simultáneas.

Cabecera redundante eliminada: 24 pruebas unitarias, 10 de navegador, build y OpenSpec correctos. Actions 37066807286 correcto; web pública a 360 px comprobada sin .board-top ni .clock, manteniendo selector de origen.

Llegadas al destino: 27 pruebas unitarias y 12 de navegador correctas; build y OpenSpec estrictos válidos. Verificados destino intermedio, cambio e inversión, eliminación, llegadas inválidas, medianoche (+1 día), cambio horario y cuenta atrás asociada a salida. Captura inspeccionada a 360 px: sin nueva columna ni desbordamiento, primer tren visible. La llegada diaria comparte la misma validación de datos.

Llegadas publicadas: Actions 37067822308 con comprobación y despliegue correctos (804e951). Verificación HTTPS a 360 px con datos oficiales Barakaldo–Abando: ocho trenes, llegada visible y sin desbordamiento.

Barra por estaciones: 27 pruebas unitarias y 14 de navegador correctas; build y OpenSpec válidos. Cero/una línea oculta contenedor sin hueco; dos/tres muestran solo compatibles, limpieza de selección incompatible y recuperación al quitar destino. Fecha sin servicios mantiene opciones; ambas vistas e intercambio verificados. Actions 37068553698 correcto (7f711a3). Web pública a 360 px: Barakaldo dos botones; destino Santurtzi cero barra y ocho trenes.

Persistencia del trayecto: 30 pruebas unitarias y 16 de navegador correctas; build y OpenSpec válidos. Restauración de origen/destino/multiselección, cambios desde tabla, intercambio, selecciones vacías, migración de origen, datos corruptos y almacenamiento bloqueado. Actions 37069123186 correcto (1d8734d). Web pública a 360 px: tras recarga se mantienen Barakaldo, Abando y C2 marcada.

PWA instalable: Actions 37069732271 correcto (c92986d), 30 pruebas unitarias y 22 de navegador. Manifiesto público, iconos y start_url /mejorcercanias/ comprobados en HTTPS. Guía móvil y eventos de instalación simulados; no se dispone de Android/iOS físicos para verificar instalación y relanzamiento reales. No se declara offline.

Renovación GTFS: 33 pruebas TypeScript, 8 Python y 24 de navegador. Fixtures separados de datos vivos; probado cambio atómico de versión conservando filtros y consulta, backoff, esquema inválido, estación retirada, caducidad inclusiva/DST, hash idéntico, fallo de descarga, --zip sin rejuvenecer procedencia y retención (siete días + predecesora). La guarda compara revisión con main antes de publicar y rechaza revisiones anteriores; no se ha provocado un fallo del servicio externo Pages. Un error de validación no ejecuta deploy y mantiene el sitio anterior. Recuperación: reejecutar Refresh GTFS o revertir datos conservando directorios versionados.

Ejecución manual real Refresh GTFS 37070795815: descarga/validación/commit e6639a0 y publicación correctas. Renfe devuelve b7464457aea1acfa, misma cobertura 2026-10-01–30; checkedAt 2026-10-02T22:07:57Z. Web HTTPS a 360 px muestra última comprobación y metadatos coherentes. Adopción de versión distinta comprobada con fixture en pestaña abierta; no se inventó otra versión oficial.

Incidencias: UI/adaptador y pasarela preparados, 37 pruebas unitarias locales, 26 de navegador, 8 Python y prueba del Worker correctos. Actions 37071982551 correcto (0d77c44; 36 unitarias en ese commit). Web pública a 360 px muestra «Avisos no disponibles» sin indicador ficticio y conserva ocho trenes. CORS real de Renfe bloquea acceso; ninguna instalación Cloudflare está disponible. No se declara conexión de alertas en vivo: compact-service-alerts conserva abiertas 1.1 y 3.1. Captura con aviso simulado inspeccionada, indicador de 44 px sin fila añadida y primer tren visible.

Horas bajo destino: 37 pruebas unitarias y 26 de navegador correctas, build/OpenSpec válidos. Inspección visual a 360 px con llegada +1 día; cuenta atrás a la derecha, sin columna central ni texto repetido. Web HTTPS verificada: Barakaldo–Abando muestra Salida 10:15 y Llegada 10:29 dentro del destino, sin desbordamiento. Publicación del commit 8701598 (Actions 37072543640).

Campana superior: 37 pruebas unitarias y 26 de navegador correctas; build/OpenSpec válidos. Actions 37073053130 correcto (2a7694c). Web pública 360 px: campana en masthead, sin aviso visible de indisponibilidad, separación exacta de 8 px y sin desbordamiento. Avisos activos probados con fixtures; conexión real sigue pendiente.

Franja Renfe retirada completamente del panel: Actions 37073555578 correcto (22ec923), web pública verificada a 360 px sin demo-notice y con procedencia en el pie exterior.

Encabezados compactos: build, OpenSpec estricto y cuatro pruebas de navegador correctos. Actions 37074137055 comprobación y despliegue correctos (b194209). Web pública verificada a 360 px: encabezados 10 px, separación superior 8 px, margen bajo líneas 4 px y sin desbordamiento.

Filas compactas y hora grande: 37 pruebas unitarias, build y validación estricta correctos; cuatro pruebas específicas de navegador cubren 59/60/61 minutos, transición automática y medianoche en ambos husos. Capturas de panel y tabla móvil inspeccionadas. Actions 37107065088 correcto (8c2a844), incluida batería completa. Web pública a 360 px: margen vertical 7 px, nombre y horas 16 px, ocho horas grandes a las 04:00 Europe/Madrid y sin desbordamiento.

Multinúcleo: Actions 37108462220 correcto (dedcac9); 39 pruebas de aplicación, 30 de navegador y 11 Python. Capturas móviles de asistente y cabecera inspeccionadas. Ocho núcleos/329 estaciones; cuatro candidatos excluidos por secuencias inválidas. Web pública verificada a 360 px en los ocho núcleos, ocho salidas por consulta, sin desbordamiento y restauración tras recarga. Verificado además favorito antiguo sin núcleo obliga al asistente, cancelar conserva trayecto, cambiar Bilbao a Zaragoza y recargar conserva Zaragoza. Núcleos/limitaciones documentados en networks.md.

Horario simplificado y acentos: Actions 37109037592 correcto (0289cdb), 40 pruebas de aplicación y 30 de navegador; 11 Python. Vista móvil inspeccionada. Web pública y vista local 5173 verificadas: solo selector de fecha/flechas y tabla, 70 trenes para la consulta del sábado, sin controles redundantes ni desbordamiento. UTF-8 y nombres Autonomía, Orduña y San Mamés correctos; pruebas específicas de reparación/adopción de catálogo antiguo sin alterar datos históricos.

Selectores editables: Actions 37111377386 correcto (f61d74a); 40 pruebas de aplicación y 32 de navegador en CI. Núcleo/origen/destino con texto, lista, teclado y ×. Web pública a 360 px: elegir Bilbao-Abando desde desplegable, borrar destino, recargar sin recuperarlo, buscar san ma y confirmar San Mamés con Enter; sin desbordamiento. Borrar origen conserva edición en la visita sin asistente. Pruebas cubren ambas vistas y texto inválido.

Flechas de selectores retiradas: build, OpenSpec estricto y dos pruebas específicas correctos. Actions 37111729020 correcto (c85f142). Web pública a 360 px verificada sin flecha: lista al tocar, selección, borrado persistente, búsqueda con acentos y teclado; sin desbordamiento.

Instalar en cabecera: 40 pruebas unitarias y seis específicas de navegador correctas; Actions 37113371640 completo (04da806), incluida batería completa. Web pública a 360 px: botón de 44 px, ayuda modal, Escape y retorno de foco, ocultación tras appinstalled y sin desbordamiento. Captura móvil inspeccionada. Instalación nativa simulada e instrucciones iOS comprobadas; no se afirma instalación real en el dispositivo.
