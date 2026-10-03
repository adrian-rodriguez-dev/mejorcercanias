# Spec Delta
## MODIFIED Requirements
### Requirement: Elegir estación
The system SHALL ofrecer estaciones del núcleo elegido y solicitar núcleo y origen mediante el asistente cuando falte una configuración válida, con destino opcional.
#### Scenario: Primera visita
- **WHEN** no hay núcleo guardado válido, aunque exista una estación antigua
- **THEN** aparece el asistente para núcleo, origen y destino opcional sin exigir fecha ni hora.
#### Scenario: Cambio de estación
- **WHEN** se elige otra estación mientras se cargan datos
- **THEN** el panel muestra exclusivamente las salidas de la selección más reciente.
### Requirement: Recordar preferencia
The system SHALL restaurar núcleo, origen, destino y líneas compatibles entre visitas y mantener la aplicación utilizable si el almacenamiento no está disponible.
#### Scenario: Regreso
- **WHEN** se abre con núcleo y origen válidos guardados
- **THEN** aparece automáticamente el panel de esa estación.
#### Scenario: Preferencia inválida o almacenamiento bloqueado
- **WHEN** falta núcleo u origen válido o falla la lectura
- **THEN** se ofrece la configuración guiada sin bloquear la aplicación
- **AND** si guardar falla, se avisa de que la selección solo dura esta visita.
