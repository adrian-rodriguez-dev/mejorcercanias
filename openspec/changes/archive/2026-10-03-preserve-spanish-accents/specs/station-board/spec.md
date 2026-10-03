# Spec Delta
## ADDED Requirements
### Requirement: Acentos legibles
The system SHALL mostrar correctamente acentos y eñes en la interfaz y nombres de estaciones, incluyendo catálogos antiguos recuperables con doble codificación, sin modificar nombres ya válidos ni los horarios.
#### Scenario: Catálogo anterior
- **WHEN** se recibe un nombre como San MamÃ©s u OrduÃ±a
- **THEN** se presenta San Mamés u Orduña en selectores y horarios.
#### Scenario: Texto válido
- **WHEN** el catálogo contiene Autonomía, Iñarratxu, Málaga o València correctamente codificados
- **THEN** se mantienen idénticos y el documento se sirve como UTF-8.
