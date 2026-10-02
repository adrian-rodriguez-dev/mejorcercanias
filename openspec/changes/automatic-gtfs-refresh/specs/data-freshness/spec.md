# Spec Delta
## Purpose
Mantener los horarios oficiales comprobados periódicamente y distribuir versiones consistentes con un coste mínimo para el móvil.
## ADDED Requirements
### Requirement: Renovación central por fin de vigencia
The system SHALL comprobar periódicamente la cobertura oficial del snapshot y renovar cuando haya terminado su vigencia, no por la edad de descarga. validTo SHALL ser inclusivo en Europe/Madrid. El cliente SHALL descargar solo metadatos y JSON compactos, nunca GTFS bruto.
#### Scenario: Versión vigente
- **WHEN** la fecha local está dentro de validFrom y validTo aunque la descarga tenga más de 24 horas
- **THEN** no se descarga de nuevo GTFS automáticamente ni se marca caducado por antigüedad.
#### Scenario: Fin de cobertura
- **WHEN** comienza el día posterior a validTo en Europe/Madrid
- **THEN** la siguiente ejecución intenta descargar y validar una versión con cobertura vigente.
#### Scenario: Cobertura desconocida
- **WHEN** falta una cobertura interpretable o no existe snapshot
- **THEN** se intenta obtener GTFS válido sin inventar una fecha de vigencia.
#### Scenario: Consulta futura
- **WHEN** se consulta una fecha posterior a la cobertura mientras el snapshot sigue vigente hoy
- **THEN** se indica horario aún no publicado para esa fecha sin tratar todo el snapshot como caducado ni disparar una descarga desde el móvil.
### Requirement: Metadatos honestos
The system SHALL distinguir última comprobación correcta, descarga y publicación de la versión, y cobertura de servicios. Un reprocesado local SHALL NOT rejuvenecer la fecha de descarga o verificación del origen.
#### Scenario: Fuente sin cambios
- **WHEN** una descarga correcta devuelve el mismo hash que la versión vigente
- **THEN** se actualiza la marca de comprobación sin crear otra versión de horarios ni volver a descargar los JSON de estación en el cliente.
#### Scenario: Fuente caducada
- **WHEN** el fichero recién descargado no contiene servicios para una fecha consultada
- **THEN** sigue apareciendo horario no publicado para esa fecha; una descarga reciente no amplía la cobertura.
### Requirement: Publicación consistente y recuperable
The system SHALL sustituir el conjunto publicado solo después de validar datos y aplicación, sin mezclar calendarios, catálogo y salidas de versiones diferentes. Una renovación fallida SHALL conservar la última versión correcta y su marca de verificación.
#### Scenario: Fallo de Renfe o validación
- **WHEN** la descarga, validación o publicación falla
- **THEN** permanece la versión anterior, la ejecución informa del error y el próximo intento puede reintentar mientras la versión siga caducada.
#### Scenario: Caducidad visible
- **WHEN** la fecha local supera validTo y no se ha publicado un reemplazo vigente
- **THEN** se muestra la cobertura agotada y la actualización pendiente, conservando consultas históricas dentro de la cobertura y sin inventar próximos trenes.
### Requirement: Actualización ligera del cliente
The system SHALL comprobar metadatos al abrir la app, al volver a ella y periódicamente mientras esté visible, con un intervalo mínimo de una hora entre comprobaciones exitosas. Si hay una versión nueva compatible SHALL cargarla sin perder origen, destino, línea, vista, fecha ni hora de consulta.
#### Scenario: Nueva versión
- **WHEN** se detecta una versión nueva y se cargan correctamente su catálogo, calendario y estación
- **THEN** el panel adopta esa versión de forma atómica y descarta respuestas antiguas pendientes.
#### Scenario: Estación eliminada
- **WHEN** una estación seleccionada ya no figura en la nueva versión
- **THEN** se explica el cambio y se solicita elegir otra estación, sin asignar silenciosamente un origen distinto.
#### Scenario: Sin conexión o versión incompatible
- **WHEN** falla la comprobación o la versión nueva no se puede interpretar
- **THEN** la consulta actual continúa con la versión cargada y su cobertura visible, sin afirmar una actualización correcta ni bloquear el panel.
