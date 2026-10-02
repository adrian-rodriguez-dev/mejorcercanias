# Proposal

## Why
El panel inmediato no permite preparar un viaje de mañana ni saber qué tren llega a Bilbao antes de las 09:00. Para hacerlo con fiabilidad hay que consultar los servicios publicados para esa fecha, incluidos fines de semana y excepciones, en lugar de repetir horarios de demostración.

## What Changes
- Añadir una vista secundaria de horario completo con Hoy, Mañana, anterior/siguiente y fecha concreta.
- Filtrar por destino directo y por salir desde una hora o llegar antes de una hora; mostrar salida y llegada y destacar la última opción que cumple el límite.
- Incorporar un preprocesador reproducible del GTFS oficial para Bilbao C1/C2/C3, con calendarios, excepciones, límites de vigencia y JSON compacto por estación.
- Usar esos mismos datos en próximas salidas, conservando la estación favorita y la pantalla inicial actual.
- Sustituir el aviso demo por procedencia, vigencia y aviso de horario programado sin tiempo real.

## Capabilities
### New Capabilities
- `daily-timetable`: horario por fecha y consulta de viajes directos por hora de salida o llegada.
- `static-service-calendar`: datos estáticos oficiales preprocesados y selección de servicios por fecha.
### Modified Capabilities
- `station-board`: incorporar datos oficiales, ampliar catálogo y mantener procedencia honesta sin cambiar el acceso principal.

## Impact
Frontend, proveedor de datos, script Python estándar de preprocesado, fixtures de prueba y documentación. Sin backend, búsqueda de transbordos, GTFS-RT, PWA ni automatización programada de actualización. No se inventan servicios fuera del horizonte publicado ni se confunde ausencia de datos con ausencia de trenes.
