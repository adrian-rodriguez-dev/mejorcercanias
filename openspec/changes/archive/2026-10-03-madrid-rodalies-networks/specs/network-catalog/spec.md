## MODIFIED Requirements
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
