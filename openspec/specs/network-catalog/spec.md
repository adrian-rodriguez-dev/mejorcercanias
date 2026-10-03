# network-catalog Specification

## Purpose
Ofrecer núcleos de Cercanías y sus horarios oficiales sin mezclar estaciones, líneas, colores ni vigencia entre redes.

## Requirements

### Requirement: Núcleos de hasta seis líneas
The system SHALL admitir redes validadas sin límite de seis líneas, incluyendo Madrid y Rodalies de Catalunya con sus variantes y regionales identificados. SHALL conservar aislamiento por red y mostrar buses como autobuses. Para Madrid y Rodalies SHALL omitir y auditar viajes con menos de dos paradas, avisando de horarios incompletos; otros errores SHALL impedir publicar la red.
#### Scenario: Límite de admisión
- **WHEN** Madrid o Rodalies tiene más de seis líneas
- **THEN** se ofrece sin recortar líneas para cumplir un límite artificial.
#### Scenario: Viaje incompleto
- **WHEN** un viaje de estas redes tiene cero o una parada
- **THEN** queda auditado y excluido del panel y router, y la interfaz informa de cobertura parcial.
#### Scenario: Autobús
- **WHEN** el GTFS indica route_type 3
- **THEN** el horario y el detalle muestran Autobús.

### Requirement: Aislamiento y carga compacta
The system SHALL mostrar solo estaciones, líneas, colores y horarios del núcleo seleccionado, cargando JSON preprocesado bajo demanda y aplicando calendarios, excepciones y vigencia de ese núcleo.
#### Scenario: Dos núcleos con C1
- **WHEN** el usuario cambia entre dos núcleos que tienen C1
- **THEN** horarios, estaciones y colores corresponden al nuevo núcleo sin reutilizar datos de la C1 anterior.
#### Scenario: Cobertura caducada
- **WHEN** el núcleo seleccionado carece de cobertura para la fecha
- **THEN** se informa de ausencia de datos aunque otro núcleo sí tenga cobertura.
