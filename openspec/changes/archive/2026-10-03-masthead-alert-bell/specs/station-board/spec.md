# Spec Delta
## ADDED Requirements
### Requirement: Campana de incidencias en cabecera compacta
The system SHALL mostrar una campana en la barra superior fuera del panel de estaciones, marcada con contador solo si hay avisos verificables. Sin avisos verificables SHALL estar neutra y deshabilitada, con estado accesible que distinga fuente no disponible de consulta vacía, sin texto visible de error. El panel SHALL comenzar a 8 px de la cabecera y conservar controles de 44 px sin desbordar móvil.
#### Scenario: Fuente pendiente
- **WHEN** la fuente no está disponible
- **THEN** no aparece Avisos no disponibles en el contenido y la campana no indica falsamente ausencia de incidencias.
#### Scenario: Avisos verificados
- **WHEN** hay incidencias relevantes
- **THEN** la campana se marca y abre el detalle existente, con Escape y retorno del foco.
