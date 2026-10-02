# Spec Delta
## ADDED Requirements
### Requirement: Horarios sin franja informativa superior
The system SHALL eliminar la franja Renfe/horario programado encima de los horarios. SHALL conservar atribución y limitación de información de tiempo real fuera del panel, en el pie, sin sustituir la franja por otra.
#### Scenario: Consulta de trenes
- **WHEN** se muestran próximas salidas u horario completo
- **THEN** los horarios siguen a los controles sin franja informativa intermedia.
