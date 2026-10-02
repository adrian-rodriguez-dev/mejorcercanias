# Datos oficiales y regeneración

La app usa un snapshot oficial de Renfe para Bilbao C1/C2/C3. Se transforma fuera del navegador mediante Python 3.12+ estándar, sin librerías adicionales:

```sh
python scripts/import_gtfs.py
# O utilizar un ZIP oficial ya descargado:
python scripts/import_gtfs.py --zip work/gtfs/renfe.zip
python -m unittest discover -s scripts -p 'test_*.py'
npm run check
npm run test:e2e
```

Después, revisar el diff del manifiesto y los datos antes de hacer commit/build. No hay refresco periódico todavía: es necesario regenerar el snapshot para ampliar la vigencia. El build es reproducible y usa el snapshot versionado; no necesita conectarse a Renfe.

`src/data/renfe-manifest.json` guarda hash SHA256 del ZIP, versión, fecha de procesamiento, fuente, licencia, catálogo y calendarios efectivos. `public/data/renfe/<versión>/<estación>.json` contiene horarios compactos inmutables. El manifiesto se publica al final después de validar toda la entrada; una compilación no mezcla dos versiones. Mantener la versión anterior mientras pueda estar en uso por clientes del despliegue anterior.

Selección del núcleo: lista explícita de ocho route_id verificados por terminales Abando/Santurtzi/Muskiz/Orduña/Arrigorriaga. Si falta una ruta, el importador falla para exigir revisar esa selección. No se incluyen metro, Euskotren ni líneas de ancho métrico. IDs como cadenas y nombres originales, salvo abreviatura visible Bilbao-Abando para 13200.

`calendar.txt` aporta los días semanales y rangos. `calendar_dates.txt`, si existe, añade o elimina servicios concretos con prioridad. El snapshot de octubre contiene servicios por fecha en calendar.txt y no tiene calendar_dates.txt. **No se aplica una lista externa de festivos ni se asume festivo = domingo**: prevalece la programación del operador. El 12 de octubre se consulta exactamente como cualquier otra fecha publicada, con sus servicios específicos.

El preprocesado agrupa patrones idénticos y une fechas, conserva las paradas posteriores con bajada ordinaria y solo permite subir donde pickup_type=0 (o ausente). Servicios a demanda no se presentan como trenes de subida libre. Excluye terminales sin recorrido posterior y valida secuencias/horas. Se admite tiempo GTFS de 00:00 a 47:59:59; formatos superiores fallan explícitamente.

La UI convierte segundos GTFS desde mediodía local menos doce horas y agrupa por día civil de salida. Examina servicios anteriores para incorporar horas >24. No parsea CSV ni descarga el ZIP. Datos fuera de coverageDates se señalan como no publicados, nunca se clonan de otro día. Un cambio futuro debe ampliar el contrato si se necesitan horizontes más largos, servicios a demanda o patrones no soportados.

Fuente: [GTFS Cercanías de Renfe](https://data.renfe.com/dataset/horarios-cercanias), CC BY 4.0. Referencia de [calendarios y tiempos GTFS](https://gtfs.org/documentation/schedule/reference/). Horarios programados; sin retrasos ni cancelaciones en tiempo real.
