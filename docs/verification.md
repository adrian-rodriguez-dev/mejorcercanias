# Verificación de la primera vertical

Entorno local: Windows, Node 24.19.0. Comprobaciones del 2026-10-02.

- `npm test`: 11 pruebas de lógica y componentes, todas correctas.
- `npm run build`: TypeScript estricto y compilación Vite correctos.
- `npm run spec -- validate --all --strict`: propuesta válida.
- `npm run test:e2e`: cuatro pruebas de navegador, dos en escritorio y dos a 360 px, todas correctas.
- Inspección visual de capturas completas en ambos tamaños: sin recortes ni desbordamiento horizontal. El móvil oculta la introducción después de elegir estación para mostrar el primer tren sin desplazarse.

Cobertura: selección, recarga y persistencia, preferencia antigua, almacenamiento bloqueado, descarte de respuestas antiguas, error y reintento, vacío, redondeo de minutos, eliminación de salidas pasadas, medianoche, cambio DST y hora de Bilbao con navegador en America/New_York.

Las capturas se regeneran en `work/preview-desktop.png` y `work/preview-mobile.png` (no versionadas). No se han validado horarios reales, cobertura completa de Bilbao, PWA, uso offline ni GTFS-RT: no están implementados. La validación local no sustituye comprobar GitHub Actions después del push.
