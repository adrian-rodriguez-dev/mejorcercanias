# Spec Delta
## Purpose
Resolver los servicios publicados por Renfe para cada fecha, respetando calendarios, excepciones y vigencia sin descargar GTFS bruto en el navegador.
## ADDED Requirements
### Requirement: Calendario oficial
The system SHALL aplicar calendar y calendar_dates cuando existan, priorizando altas y bajas por fecha sobre los días semanales, sin equiparar festivos con domingos por su cuenta.
#### Scenario: Excepción festiva
- **WHEN** una fecha elimina un servicio laborable y añade otro mediante calendar_dates
- **THEN** solo circula el servicio añadido aunque el día sea lunes
#### Scenario: Sábado y domingo
- **WHEN** el calendario asigna servicios diferentes a sábado y domingo
- **THEN** cada fecha devuelve sus servicios correspondientes
### Requirement: Vigencia y procedencia
The system SHALL mostrar fuente y horizonte de datos, rechazar consultas fuera del horizonte conocido y publicar JSON compacto por estación derivado del GTFS oficial con hash de origen.
#### Scenario: Fecha no publicada
- **WHEN** se consulta una fecha sin cobertura publicada
- **THEN** se indica que no hay datos para esa fecha y no se reutilizan horarios de otro día
### Requirement: Instantes y paradas
The system SHALL respetar horas GTFS mayores de 24, Europe/Madrid y cambios de hora; SHALL excluir subidas o bajadas prohibidas y no recomendar destinos anteriores al origen.
#### Scenario: Servicio tras medianoche
- **WHEN** un servicio sale a las 25:10 de su día de servicio
- **THEN** se presenta a las 01:10 del día civil siguiente
