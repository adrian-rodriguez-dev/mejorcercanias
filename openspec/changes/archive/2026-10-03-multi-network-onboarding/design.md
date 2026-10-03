# Design
## Context
Ver propuesta. El importador filtra ocho route_id de Bilbao; snapshot valida network=bilbao y C1/C2/C3. Preferencias no guardan núcleo; colores, cabecera y atajo a Bilbao son fijos. El versionado solo depende del ZIP: cambiar la transformación requiere una nueva identidad para evitar mezclar salidas.

Inspección del ZIP oficial almacenado (2026-10-02): aparecen grupos de Sevilla (30), Cádiz (31), Málaga (32), Valencia (40), Murcia/Alicante (41), Cartagena (45), Ferrol (46), León (47), Bilbao (60), San Sebastián (61), Cantabria (62) y Zaragoza (70) con hasta seis denominaciones de Cercanías candidatas. Madrid y Asturias superan seis; Catalunya también. Esto es inventario candidato, no certificación de cobertura: validar agrupación comercial, líneas, servicios, vigencia y colores antes de publicar cada núcleo.

Fuentes: https://www.renfe.com/es/es/cercanias y GTFS oficial https://ssl.renfe.com/ftransit/Fichero_CER_FOMENTO/fomento_transit.zip . El ZIP también contiene regionales, autobuses y variantes: no usar únicamente un conteo ciego ni presentar servicios ajenos como Cercanías.

## Goals / Non-Goals
**Goals:** incorporar núcleos elegibles y configuración persistente con interfaz móvil compacta.
**Non-Goals:** redes de más de seis líneas, transbordos entre núcleos, nuevas alertas en vivo o un backend.

## Decisions
- Catálogo explícito de núcleos y líneas comerciales, contrastado con Renfe. Agrupar los dos sentidos; mantener variantes con denominación comercial propia. Seis es el límite de admisión del núcleo, no recortar seis líneas de una red mayor. Publicar solo núcleos con datos validados; registrar exclusiones y motivo.
- Namespace por núcleo para estaciones, líneas, patrones y alertas; los identificadores GTFS originales se conservan en datos. JSON por núcleo/estación y carga bajo demanda, sin llevar el ZIP al teléfono. Catálogo inicial ligero; calendarios y vigencia por núcleo.
- Versiones inmutables derivadas del ZIP y versión del transformador/catálogo. Adaptar actualización y retención sin sobreescribir snapshots existentes ni prolongar la vigencia de un núcleo con la de otro.
- Preferencias de trayecto v1 conservadas y clave explícita de núcleo network.v1, escrita al finalizar la configuración. Sin núcleo guardado válido, abrir SIEMPRE asistente, también con preferencia v1 de Bilbao; no inferir Bilbao. Recuperar estaciones anteriores solo después de que el usuario elija un núcleo compatible.
- Asistente de tres pasos: núcleo → origen → destino opcional. Texto: «Configúralo una vez. Después verás tus próximos trenes al abrir. Puedes cambiarlo cuando quieras». Destino ofrece «Sin destino». Botón final «Ver mis trenes». Atrás conserva borrador; solo finalizar guarda configuración completa. Un borrador no evita el asistente al recargar.
- Cabecera: convertir el actual «Cercanías Bilbao» en botón con nombre del núcleo más grande y marca desplegable. Sigue en la misma barra junto a la campana; no añadir fila permanente. Al pulsar abre selección de núcleo. Cancelar conserva trayecto vigente; confirmar otro núcleo reinicia filtros incompatibles. No confundir este control con los botones C1/C2 de línea.
- Las líneas usan los colores del núcleo (C1 no tiene un color global). Seis botones caben mediante ajuste a dos filas si es necesario, con áreas de 44 px; mantener ocultación con una sola línea y selección múltiple.
- Reemplazar texto fijo Bilbao y limitar el atajo «Mañana a Bilbao» a Bilbao; no ofrecer destinos de otra red. Mantener alerta pendiente sin mezclar identificadores entre redes.

## Risks / Trade-offs
- Cobertura de grupos no equivalente a núcleos comerciales → catálogo revisado contra Renfe y pruebas de referencias; no adivinar por prefijo.
- Esquema nuevo y antiguos clientes abiertos → versión nueva, adopción atómica, fallback a último snapshot válido y ruta de migración probada.
- Almacenamiento bloqueado → continuar en memoria durante la sesión y explicar que no podrá recordarse; próxima entrada sin núcleo vuelve a mostrar asistente.
- Cabeceras largas → permitir ajuste del texto sin solapar campana ni desbordar a 360 px.

## Migration Plan
Añadir catálogo y snapshots, validar cada núcleo, después activar asistente y preferencias v2. Probar favoritos v1 sin núcleo y regresiones Bilbao. Publicar mediante CI; archivar únicamente tras verificar selección/restauración en producción. Un rollback conserva snapshots previos y no destruye preferencias.

## Resultado de validación inicial
Publicables: Bilbao, Cádiz, València, Cartagena, Ferrol, León, San Sebastián y Zaragoza (329 estaciones). Sevilla, Málaga, Murcia/Alicante y Cantabria se excluyen por viajes con secuencia de paradas ausente/inválida en este ZIP; el manifiesto registra el primer identificador que falla. No se oculta ese fallo eliminando viajes sueltos. Si falla un núcleo ya publicado en una actualización, se conserva el snapshot anterior entero.
Bilbao conserva IDs numéricos por compatibilidad; otros núcleos usan prefijo propio. Catálogo y calendarios compactos iniciales se comparten; horarios de estación se descargan bajo demanda. La subida de bundle comprimido es aproximadamente 6 KB. Esta solución evita una segunda cascada de peticiones para el catálogo.
