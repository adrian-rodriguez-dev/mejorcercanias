# Datos oficiales y regeneración

La entrada es el ZIP nacional de Renfe definido en SOURCE de `scripts/import_gtfs.py`. El pipeline usa Python 3.12+ estándar; el navegador nunca descarga ni procesa el ZIP. La selección de redes está en NETWORKS y el estado efectivo en el manifiesto generado.

## Flujo normal

```sh
python scripts/refresh_gtfs.py --force
```

`refresh_gtfs.py` comprueba cobertura de todas las redes en Europe/Madrid; sin force y con cobertura válida no descarga. Con candidato nuevo compila calendarios, horarios y grafos, valida referencias y evita perder redes antes publicadas. Si falla o el candidato no cubre hoy, conserva el snapshot previo. Ver [operación](operations.md) para pruebas, revisión y publicación.

## Investigar un ZIP sin alterar producción

```sh
python scripts/import_gtfs.py --zip work/gtfs/renfe.zip --output work/candidate
```

El ZIP debe ser oficial y su origen verificable. `--output` coloca los archivos bajo esa carpeta, incluyendo `src/data/renfe-manifest.json` y `public/data/renfe/<versión>/`. Sin --zip el importador descarga la fuente configurada. Con ZIP local no inventa la fecha de descarga.

El importador aislado **no genera current.json ni el manifiesto público de publicación**. Para el flujo operativo usar el renovador. `--bootstrap` del renovador solo reconstruye metadatos del snapshot ya presente; no sustituye importación, validación ni comprobación de cobertura.

## Transformación y contratos

- `calendar.txt` y `calendar_dates.txt` producen fechas efectivas, con prioridad de excepciones. No se asume festivo = domingo.
- Patrones de estación agrupan servicios idénticos, mantienen terminal real y llegadas posteriores. Subida/bajada ordinaria exige tipo 0; no se presentan servicios a demanda como libre acceso.
- Tiempos admitidos: 00:00–47:59:59; secuencias y tiempos se validan. La UI usa mediodía local menos doce horas y segundos GTFS para respetar DST.
- `routing_data.py` compila grafos de trips, calls, grupos y transfers, combinando transfers.txt con `data/routing-corrections.json`.
- Correcciones incluyen evidencia y márgenes estimados. Los Rosales está preparado en configuración/pruebas; no implica que Sevilla esté publicado. El pipeline de extracción de mapas de la investigación no se ejecuta aquí.
- Madrid y Rodalies admiten explícitamente viajes excluidos por menos de dos paradas, auditados y visibles en la UI. Las otras redes mantienen validación estricta. Ver [núcleos](networks.md).

## Versionado y retención

snapshot_version combina bytes del ZIP, TRANSFORM_VERSION y configuración de correcciones. Incrementar TRANSFORM_VERSION al cambiar semántica del transformador. El SHA256 de la fuente se conserva por separado. Las rutas de estaciones y grafos de una versión son inmutables; los metadatos de comprobación pueden actualizarse para la misma versión.

El renovador prepara datos en staging, copia a la carpeta versionada y escribe metadatos al final. Main almacena el resultado validado; Pages solo cambia al desplegar el sitio completo. Conserva versión actual, predecesora inmediata y versiones con publicación conocida de los últimos siete días; no borra automáticamente carpetas sin metadatos fiables.

Una compilación local Vite no consulta Renfe. Es repetible con el mismo código/lock/datos, pero no idéntica byte a byte: la versión de aplicación cambia en cada build.
