## Purpose
Permitir consultar horarios oficiales previamente descargados cuando no haya conexión, respetando la vigencia y el aislamiento de versiones.
## ADDED Requirements
### Requirement: Apertura y consulta sin conexión
The system SHALL permitir abrir la app tras una visita online completada y consultar estaciones guardadas con su catálogo y calendario de la misma versión. SHALL guardar solo estaciones consultadas, sin descargar GTFS bruto ni todos los núcleos.
#### Scenario: Reapertura offline
- **WHEN** se abre sin conexión después de cargar una estación y preparar la app
- **THEN** se restauran preferencias y horarios guardados, también en horario completo.
#### Scenario: Estación no guardada
- **WHEN** se consulta offline una estación que no se guardó
- **THEN** se indica que necesita conexión, sin mostrar los trenes de otra estación.
### Requirement: Vigencia visible
The system SHALL indicar el uso offline y la fecha final de vigencia, sin extrapolar días fuera del calendario publicado ni presentar alertas guardadas como actuales.
#### Scenario: Datos caducados
- **WHEN** la fecha solicitada no está cubierta
- **THEN** no se muestran salidas ficticias y se informa del límite de los datos.
### Requirement: Caché acotada y actualización segura
The system SHALL limitar datos locales a doce estaciones y dos versiones; fallos de almacenamiento no bloquearán el uso online. Las nuevas versiones de app no forzarán recargas y sus metadatos se consultarán siempre por red.
#### Scenario: Actualización disponible
- **WHEN** se descarga una nueva versión mientras la app sigue abierta
- **THEN** se conserva la consulta y se permite activar la nueva versión mediante Actualizar.
#### Scenario: Almacenamiento no disponible
- **WHEN** falla el guardado local
- **THEN** se mantiene la consulta online sin prometer que esa estación estará offline.
