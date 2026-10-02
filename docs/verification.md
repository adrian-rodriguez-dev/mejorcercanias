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
