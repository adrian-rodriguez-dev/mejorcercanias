# Renfe: datos estáticos y tiempo real

Comprobado el 2026-10-02. El GTFS estático ya está integrado mediante el preprocesador descrito en [gtfs-import.md](gtfs-import.md). El tiempo real sigue pendiente.

## Fuentes oficiales

- [Horarios Cercanías](https://data.renfe.com/dataset/horarios-cercanias): [ZIP GTFS](https://ssl.renfe.com/ftransit/Fichero_CER_FOMENTO/fomento_transit.zip), licencia CC BY 4.0 indicada por Renfe.
- [Horarios de viaje Cercanías](https://data.renfe.com/es/dataset/horarios-viaje-cercanias): [trip_updates.pb](https://gtfsrt.renfe.com/trip_updates.pb) y [trip_updates.json](https://gtfsrt.renfe.com/trip_updates.json). El catálogo indica actualización cada 20 segundos.

El siguiente importador debe ejecutarse en build/CI, filtrar Bilbao por relaciones verificadas entre rutas, viajes y paradas, y generar archivos pequeños por estación. No inferir núcleos solo por un nombre de línea (C1 existe en varias ciudades).

Aceptar un dataset requiere comprobar `calendar.txt`/`calendar_dates.txt`, excepciones y rangos de vigencia, horas GTFS mayores de 24:00, Europe/Madrid y DST, secuencia de paradas, pickup/drop-off, destinos, terminales, IDs como cadenas y duplicados. Conservar fuente, fecha de descarga, huella y atribución Renfe; publicar catálogo y datos atómicamente. No servir archivos caducados como horarios válidos. La primera vertical no pretende resolver estos puntos.

## CORS: observación reproducible

Se realizó un GET de `https://gtfsrt.renfe.com/trip_updates.pb` con `Origin: https://mejorcercanias.es`.

| Observación                 | Resultado                |
| --------------------------- | ------------------------ |
| HTTP                        | 200                      |
| Content-Type                | application/octet-stream |
| Tamaño de esa respuesta     | 15 678 bytes             |
| Access-Control-Allow-Origin | Ausente                  |

La respuesta observada no permite su lectura directa mediante `fetch` desde ese origen en un navegador. Una descarga exitosa por terminal no acredita CORS. No se ha verificado un despliegue en el dominio final; repetir la prueba antes de diseñar la integración y ante cambios del proveedor. El JSON se pudo consultar públicamente, pero eso por sí solo tampoco acredita CORS.

```sh
curl -sS -D - -o /dev/null -H "Origin: https://mejorcercanias.es" https://gtfsrt.renfe.com/trip_updates.pb
```

En Windows, usar `curl.exe` y `-o NUL`. Una verificación final debe incluir un `fetch` en el navegador desde el origen del producto, con credenciales omitidas.

## Posible adaptación mínima futura

Si persiste el bloqueo, un Cloudflare Worker con upstream fijo puede descargar, cachear unos segundos y devolver el feed o un subconjunto validado con CORS restringido al sitio. No debe aceptar URLs arbitrarias ni ser un proxy abierto. Añadir límites de tamaño/tiempo, timestamp y fallback explícito a horario programado cuando falle o caduque.

El frontend debe distinguir horario programado, estimación y cancelación, unir IDs oficiales comprobados, y no mostrar retraso cero si no hay observación reciente. No se implementa ni despliega ningún Worker en esta entrega.
