# Pipeline de mapas oficiales PDF/SVG

`Review official maps` integra la investigación cartográfica en el repositorio. Se ejecuta los lunes a las 05:23 UTC, manualmente desde Actions y al cambiar sus herramientas/fuentes en main. Genera un artefacto de evidencias; la configuración de rutas se promueve mediante revisión explícita.

## Piezas y responsabilidades

| Ubicación                       | Contenido                                                                                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data/maps/sources/`            | Quince mapas oficiales fijados, manifiesto de URLs/SHA256 y mapa de febrero que identifica Los Rosales Apeadero. La captura original queda en Git. |
| `data/maps/annotations/`        | Observaciones revisadas, posiciones y huellas de leyendas, correspondencias GTFS y división de puntos de embarque.                                 |
| `data/maps/routing-policy.json` | Margen peatonal estimado y nombres de presentación de los puntos. No son tiempos oficiales.                                                        |
| `tools/maps/pipeline.py`        | Extracción vectorial, texto, símbolos por semejanza de forma y cruces con stop_id.                                                                 |
| `tools/maps/acquire.py`         | Descubre el mapa enlazado por cada página oficial de Renfe, descarga y comprueba fuentes.                                                          |
| `tools/maps/run.py`             | Orquesta una ejecución aislada, comprueba evidencia, genera informe y propuesta compatible con el router.                                          |
| `tools/maps/review.py`          | Visor local de la captura revisada, con imágenes y registros.                                                                                      |
| `tools/maps/routing_overlay.py` | Auditoría de asignaciones de puntos físicos y caminatas.                                                                                           |
| `tools/maps/normalized_gtfs.py` | Exportador adicional de GTFS derivado, conservado del prototipo; el workflow de la web usa la propuesta JSON.                                      |
| `.github/workflows/maps.yml`    | Descarga, pruebas, ejecución y artefacto con permisos contents:read.                                                                               |

Los originales cartográficos se atribuyen a Renfe; conservar sus URLs y avisos. La licencia CC BY 4.0 indicada para el GTFS no se extrapola automáticamente a todos los documentos cartográficos.

## Ejecutar

Python 3.12, desde la raíz del repositorio:

```sh
python -m pip install -r tools/maps/requirements.txt
python -m unittest discover -s tools/maps -p 'test_*.py'
python tools/maps/run.py --refresh --output work/maps-current
```

PyMuPDF está fijado a 1.28.2: cambiarlo puede alterar IDs geométricos y exige comprobar/revisar la captura. Para reproducir los mapas fijados contra un ZIP oficial conservado:

```sh
python tools/maps/run.py --gtfs work/gtfs/renfe.zip --output work/maps-baseline
```

El ZIP original de la captura tiene SHA256 `b7464457aea1acfa052aeff7255040b1b377d582ea1675617cfe7841338ad043`. No se guarda otra copia grande del GTFS en Git. Conservar el ZIP junto al artefacto permite repetir la captura. Sin --gtfs se descarga la fuente actual; aunque se usen mapas fijados, un GTFS distinto puede requerir revisión.

El directorio de salida debe ser nuevo. Una ejecución fallida no reutiliza una propuesta vieja. --refresh vuelve a descargar mapas y GTFS aunque se suministre --gtfs. No requiere API keys ni servicios de IA.

## Qué extrae y qué publica como evidencia

PDF se convierte en SVG, texto, cajas y primitivas con coordenadas. También se acepta SVG nativo, probado con un fixture. El corpus real revisado son quince PDF. La similitud de glifos de leyenda propone símbolos; cápsulas con círculos de estación proponen intercambiadores. Las coincidencias de nombres proponen stop_id, conservando ceros iniciales. Cruces de trazos o proximidad no habilitan transbordos.

Se mantienen separados:

- Inventario revisado de intercambiadores, caminatas, otros modos y restricciones.
- Candidatos automáticos con asociaciones de estación todavía inciertas.
- Propuesta operativa de enlaces peatonales y puntos de embarque, con política de tiempos explícita.

Una P se conserva como aparcamiento y no crea una arista. Un icono de metro o bus tampoco establece por sí solo una conexión operativa con una parada concreta.

## Artefacto de Actions

`map-evidence-<run_id>`, retenido 30 días, contiene:

- `report.json` y `SUMMARY.md`: estado, fuentes, motivos de revisión y si cambió la propuesta operativa.
- `sources/`: mapas, páginas descargadas cuando se usa refresh y GTFS de esa ejecución, con huellas.
- `extracted/`: SVG, texto y geometría para revisar incluso cuando cambió un mapa.
- `data/connection_candidates.json/.csv`: candidatos y sugerencias de IDs, nunca aprobaciones automáticas.
- Si las huellas revisadas coinciden: inventario JSON/CSV, cobertura, símbolos, auditoría GTFS y `routing-corrections.proposed.json`.
- `data/last-approved-routing-corrections.json`: configuración vigente antes de ejecutar.
- Si se completó la captura revisada: `index.html` y `previews/`, visor que funciona sin servidor.

Los mapas/artefactos no se copian a public ni aumentan la descarga del usuario de la app. El workflow no modifica main ni despliega transbordos nuevos. Los horarios siguen renovándose con la última configuración aprobada.

## Estados y revisión

Código de salida 0: `reviewed`, las fuentes coinciden y hay propuesta verificable. Código 2: `needs-review`, ha cambiado evidencia o GTFS; el job queda fallido para hacerlo visible y sube los archivos disponibles. Código 1: `error`, adquisición, formato o integridad fallidos. Consultar report.json; si falla antes de crear el directorio, consultar el log de Actions.

Si cambia un mapa, no se aplican las coordenadas antiguas de leyenda. Se exportan geometría, texto y candidatos genéricos, y se exige volver a localizar la leyenda y revisar asociaciones. No se promete extracción completa: algunos nombres son contornos y algunas conexiones necesitan revisión visual.

Un cambio de SHA del GTFS obliga a revisar el cruce de IDs, aunque el mapa sea igual. Las fuentes de apoyo y reglas de puntos físicos también están vinculadas a huellas. No basta con sustituir hashes para eliminar un error: comprobar nombres, IDs, rutas y evidencia.

## Promover una revisión

1. Descargar el artefacto y revisar diferencias gráficas, candidatos y correspondencias GTFS. Resolver identidades dudosas y conservar los registros sin resolver como tales.
2. Actualizar mapas/manifiesto fijados y anotaciones en `data/maps`, con la evidencia y huellas de las fuentes realmente revisadas. Conservar IDs estables de observación cuando siga siendo la misma relación.
3. Ejecutar las pruebas y una nueva captura con el ZIP revisado. Comprobar que `routing-corrections.proposed.json` conserva todos los enlaces y puntos físicos necesarios.
4. Promover desde una ejecución nueva:

```sh
python tools/maps/run.py --gtfs work/gtfs/reviewed.zip --output work/maps-approved --promote
python scripts/refresh_gtfs.py --force
python -m unittest discover -s scripts -p 'test_*.py'
npm run check
npm run test:e2e
npm run test:offline
```

--promote modifica `data/routing-corrections.json` solo si la propuesta validada es distinta; no hace commit ni publica. El contrato JSON es el que ya consume routing_data.py. La versión de datos incorpora sus bytes, por lo que cambiar la configuración requiere regeneración. Si cambia la lógica de generación, incrementar TRANSFORM_VERSION según la guía de datos.

Revisar y commitear fuentes, anotaciones, configuración y snapshot coherentes antes de integrar a main. Si una red no puede regenerarse, conservar el snapshot anterior. La eliminación de un enlace/punto ya aprobado se rechaza: requiere una migración deliberada con evidencia y actualización explícita de la configuración anterior, no una desaparición accidental del extractor.

## Los Rosales

La observación `sevilla-139` conserva que el mapa de abril no imprime el nombre del extremo C3 (`printed_label=null`), y que el mapa oficial de febrero lo identifica como Los Rosales Apeadero. El GTFS agrupa ambos bajo 50700.

La regla produce `mc:50700:c1` y `mc:50700:c3`, asignados a servicios C1 y C3. Se conserva el recorrido a pie y el margen estimado de 600 segundos. La indicación del mapa «menos de diez minutos» es evidencia independiente, no un mínimo oficial calculado.

Las pruebas impiden borrar silenciosamente esta división o asignar una ruta desconocida al padre como atajo. El motor de la web recibe nodos y aristas normales; no necesita condiciones especiales de Sevilla. La regla seguirá preparada hasta que Sevilla disponga de un snapshot de horarios válido.

## Comprobaciones del corpus completo

Además de las pruebas pequeñas de CI, tras generar la captura revisada se pueden ejecutar nueve comprobaciones del inventario original y su determinismo. Seleccionar la salida con la variable `MEJORCERCANIAS_MAP_WORKDIR` y ejecutar `python tools/maps/integration_checks.py`. En PowerShell: `$env:MEJORCERCANIAS_MAP_WORKDIR=(Resolve-Path work/maps-baseline).Path`.

Estas comprobaciones contienen cantidades y casos de la captura original; actualizar sus expectativas solo después de revisar los cambios del corpus. Los tests pequeños no dependen de la fuente en vivo.

## Fallos de descarga desde GitHub

El workflow primero reproduce los mapas conservados (`maps-reviewed/`) y después comprueba las fuentes actuales (`maps/`). El artefacto contiene ambas carpetas. Así se conserva una extracción útil aunque falle la red. Ambas fases usan el GTFS descargado durante su ejecución; una correspondencia con un ZIP cambiado seguirá necesitando revisión.

Se han observado respuestas de Renfe con HTTP 200 y Content-Type PDF cuyo cuerpo solo contiene seis bytes de espacios. Se comprueba la firma real del PDF; los reintentos solicitan revalidación de caché y usan una clave de consulta nueva. Si persiste, se informa como error de fuente y se conserva el último conjunto aprobado. Nunca se interpreta un archivo vacío como desaparición de las conexiones.
