# Incidencias: fuente y despliegue pendiente

Recurso oficial: https://data.renfe.com/dataset/f28e345f-e9a3-4d08-ab56-15c9418c2737/resource/3634402c-4972-4007-8bf0-42d33aeb1b68 → https://gtfsrt.renfe.com/alerts.json

Comprobación real 2026-10-03 (Europe/Madrid): GET 200, application/json, sin Access-Control-Allow-Origin. Desde la web publicada, fetch falla por CORS. Feed observado: GTFS-RT 2.0, timestamp original 1790979114 (2026-10-02T22:11:54Z), sin incrementality (FULL_DATASET por defecto). Hay routeId oficiales 60T0001C1, 60T0003C2, etc., y stopId. No se mezcla C1 de otros núcleos. Las retiradas se procesan al reemplazar un feed completo; un diferencial no soportado se declara no verificable, nunca se interpreta como vacío completo. Referencia: https://gtfs.org/documentation/realtime/reference/

Renfe asigna algunos avisos de accesibilidad a muchas rutas, aunque el texto cite una estación: se conserva el alcance oficial amplio, sin adivinar alcance por texto. Selectores con parada/ruta se combinan mediante AND; los selectores entre sí mediante OR. Paradas intermedias se obtienen de las salidas que cumplen la consulta. Para fechas distintas de hoy se exige un período delimitado que solape el día; no se convierte un aviso abierto sin fin en predicción. No se usan avisos para alterar horas de trenes.

Polling: 60 segundos mientras visible, límite al reanudar y timeout; datos de más de cinco minutos dejan de mostrarse. Fallos aparecen junto a la fuente existente. Sin avisos no se reserva sitio; detalle nativo dialog, Escape y devolución de foco. Pruebas de relevancia y UI usan fixtures, no acreditan integración en vivo.

## Pasarela mínima lista para desplegar

`worker/index.mjs` sirve solo GET /alerts. Upstream fijo Renfe, caché de 20 segundos, timeout 8 s, máximo 512 KiB y timestamp original sin modificar. CORS restringido a GitHub Pages y mejorcercanias.es. Sin almacenamiento, DB, credenciales en cliente ni proxy abierto.

Con una cuenta Cloudflare autorizada:

```sh
npx wrangler login
npx wrangler deploy --config worker/wrangler.toml
```

Guardar la URL HTTPS resultante con sufijo `/alerts` en la variable de repositorio GitHub **ALERTS_URL** (no es un secreto) y volver a ejecutar Validate/publicación. La build toma `VITE_ALERTS_URL` desde esa variable. En desarrollo, definirla en `.env.local`. Sin variable se prueba la fuente directa y se informa de su indisponibilidad.

Comprobar desde la web publicada: respuesta CORS legible, timestamp fresco, contenido de avisos y retirada de indicadores con feed completo vacío. Solo entonces cerrar 1.1 y 3.1 de la spec. Actualmente no hay cuenta/sesión Cloudflare disponible; la conexión en vivo permanece pendiente.
