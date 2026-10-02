# Renovación de horarios

La vigencia procede de los días de servicio efectivos de Bilbao (`calendar.txt` y `calendar_dates.txt`). `validTo` incluye todo ese día en Europe/Madrid. Una descarga de hace más de 24 horas sigue siendo válida mientras cubra hoy. Sin `feed_info.txt`, no se inventa fecha oficial de publicación. Los metadatos separan `downloadedAt`, `checkedAt` y `publishedAt`; reprocesar `--zip` deja desconocida la descarga. La marca de publicación se prepara para el despliegue y solo llega a la web si este tiene éxito.

`Refresh GTFS` comprueba cada hora (minuto 17) y permite ejecución manual con `force`. Si caducó, descarga Renfe, valida en staging y conserva el snapshot anterior ante fallo o cobertura solo futura. Mismo hash vigente actualiza comprobación sin reescribir estaciones. Mantiene siempre la versión anterior y al menos siete días de versiones conocidas; no elimina automáticamente versiones sin metadatos fiables.

Los JSON aceptados y el manifiesto quedan en main. El bot comprueba que main no avanzó y usa push normal; si hay conflicto aborta. Validación/publicación es un workflow reutilizable invocado explícitamente (no depende de que el push del bot dispare CI). Cada despliegue espera el mismo grupo Pages y rechaza una revisión antigua. Un fallo deja el sitio previo; reejecutar `Refresh GTFS` publica otra vez la revisión actual. Para rollback, revertir el commit de datos y publicar, conservando las carpetas versionadas necesarias.

El cliente solicita `data/renfe/current.json` sin caché al abrir, al reanudar o mientras está visible, como máximo una comprobación correcta por hora; fallo: espera cinco minutos. Descarga manifiesto/estación nuevos antes de adoptar el catálogo, mantiene filtros/vista/fecha/hora y descarta cargas antiguas. No descarga ZIP. Si una versión retirada da 404 intenta comprobar metadatos respetando el límite y permite reintentar. Una estación eliminada requiere elegir otra explícitamente.

Los tests usan `tests/fixtures/` (snapshot fijo octubre 2026) mediante modo e2e/test; producción usa datos renovables. Fixtures no forman parte del build público. El aviso de cobertura agotada no impide consultas históricas cubiertas.

GitHub puede retrasar o deshabilitar cron por inactividad. Reactivar en Actions → Refresh GTFS → Enable workflow y ejecutar manualmente. Para forzar comprobación incluso vigente, marcar `force`.
