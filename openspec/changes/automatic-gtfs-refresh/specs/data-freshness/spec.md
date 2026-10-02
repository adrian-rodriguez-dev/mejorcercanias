# Spec Delta
## Purpose
Mantener los horarios oficiales comprobados periódicamente y distribuir versiones consistentes con un coste mínimo para el móvil.
## ADDED Requirements
### Requirement: Renovación central a las 24 horas
The system SHALL comprobar la antigüedad de la última verificación correcta de Renfe periódicamente y renovar desde la fuente oficial cuando sea mayor de 24 horas o falte una marca fiable. El cliente SHALL descargar únicamente metadatos y JSON compactos, nunca GTFS bruto.
#### Scenario: Umbral de antigüedad
- **WHEN** una ejecución observa 24 horas o menos desde la última comprobación correcta
- **THEN** no descarga de nuevo el GTFS salvo petición manual forzada.
#### Scenario: Datos antiguos o desconocidos
- **WHEN** la antigüedad supera 24 horas o la marca falta, es inválida o está en el futuro
- **THEN** se descarga el GTFS oficial en el proceso central y se valida antes de publicar.
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
- **THEN** permanece la versión anterior, la ejecución informa del error y el próximo intento puede reintentar sin esperar otras 24 horas.
#### Scenario: Antigüedad visible
- **WHEN** han pasado más de 24 horas sin una comprobación correcta
- **THEN** se muestra discretamente la fecha de comprobación y el estado de actualización pendiente, manteniendo horarios solo dentro de su cobertura conocida.
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
- **THEN** la consulta actual continúa con la versión cargada y su antigüedad visible, sin afirmar una actualización correcta ni bloquear el panel.
