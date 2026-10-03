# network-catalog Specification

## Purpose
Ofrecer núcleos de Cercanías y sus horarios oficiales sin mezclar estaciones, líneas, colores ni vigencia entre redes.

## Requirements

### Requirement: Núcleos de hasta seis líneas
The system SHALL ofrecer núcleos validados del GTFS oficial de Renfe con un máximo de seis líneas comerciales distintas, agrupando ambos sentidos y sin recortar núcleos mayores ni incluir regionales como Cercanías.
#### Scenario: Límite de admisión
- **WHEN** un núcleo validado tiene seis líneas comerciales
- **THEN** se ofrece completo
- **AND** uno con más de seis no se publica parcialmente para cumplir el límite.

### Requirement: Aislamiento y carga compacta
The system SHALL mostrar solo estaciones, líneas, colores y horarios del núcleo seleccionado, cargando JSON preprocesado bajo demanda y aplicando calendarios, excepciones y vigencia de ese núcleo.
#### Scenario: Dos núcleos con C1
- **WHEN** el usuario cambia entre dos núcleos que tienen C1
- **THEN** horarios, estaciones y colores corresponden al nuevo núcleo sin reutilizar datos de la C1 anterior.
#### Scenario: Cobertura caducada
- **WHEN** el núcleo seleccionado carece de cobertura para la fecha
- **THEN** se informa de ausencia de datos aunque otro núcleo sí tenga cobertura.
