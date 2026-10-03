# Spec Delta
## MODIFIED Requirements
### Requirement: Navegación por fecha
The system SHALL ofrecer anterior, siguiente y selector de fecha en Horario completo, sin botones Hoy/Mañana ni títulos o explicaciones de fecha duplicados. Próximas salidas SHALL seguir siendo la vista inicial.
#### Scenario: Consultar mañana
- **WHEN** se cambia la fecha con el selector o las flechas
- **THEN** aparecen todos los servicios publicados para esa fecha, incluidos los anteriores a la hora actual.
### Requirement: Tabla completa y filtros
The system SHALL mostrar siempre todo el día, manteniendo solo los filtros compartidos de origen, destino y líneas. SHALL eliminar modo horario, atajos, recomendaciones, resumen de cantidad y botón Ver todo el día; distinguir ninguna coincidencia de datos no publicados y descartar cargas antiguas.
#### Scenario: Limpiar filtros
- **WHEN** se abre Horario completo con destino elegido
- **THEN** se ven todas las salidas compatibles y sus llegadas, sin limitar por hora ni mostrar controles redundantes.
#### Scenario: Cambio rápido
- **WHEN** termina una carga de una fecha anterior tras seleccionar otra
- **THEN** no sustituye la tabla de la nueva selección.
## REMOVED Requirements
### Requirement: Consulta de llegada
**Reason**: El usuario solicita siempre el día completo sin hora límite ni atajo mañana antes de las nueve.
**Migration**: Consultar salida y llegada en la tabla completa con destino opcional.

