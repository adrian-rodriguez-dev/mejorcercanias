# Spec Delta
## Purpose
Configurar núcleo y trayecto habitual una vez para abrir directamente el panel, recuperando de forma guiada cualquier selección incompleta.
## ADDED Requirements
### Requirement: Asistente obligatorio sin núcleo
The system SHALL abrir siempre el asistente cuando no haya un núcleo válido guardado, incluso si existe una estación anterior. SHALL evitar inferir Bilbao o permitir que cerrar u omitir el asistente cuente como configuración completada.
#### Scenario: Favorito antiguo sin núcleo
- **WHEN** existe una estación de Bilbao guardada pero falta networkId
- **THEN** aparece el asistente desde la elección de núcleo, sin asignarlo automáticamente.
#### Scenario: Recarga incompleta
- **WHEN** el usuario abandona el asistente antes de finalizar y vuelve a entrar
- **THEN** vuelve a aparecer el asistente.
#### Scenario: Núcleo retirado o preferencia corrupta
- **WHEN** el núcleo guardado no es válido o ya no está disponible
- **THEN** aparece el asistente y no se consultan horarios de otro núcleo silenciosamente.
### Requirement: Configuración guiada y persistente
The system SHALL explicar que la configuración se hace una vez, guiar por núcleo, origen y destino opcional, guardar la selección completa al finalizar y abrir próximas salidas. SHALL permitir omitir el destino y restaurar después núcleo, origen, destino y líneas.
#### Scenario: Destino omitido
- **WHEN** se elige núcleo y origen y se continúa sin destino
- **THEN** se guarda una configuración válida y se muestran todas las salidas compatibles del origen.
#### Scenario: Regreso configurado
- **WHEN** se abre la app con núcleo y origen válidos guardados
- **THEN** aparece el panel sin asistente y se recuperan destino y líneas compatibles.
#### Scenario: Almacenamiento no disponible
- **WHEN** no se puede guardar la configuración
- **THEN** se mantiene durante la visita y se explica la limitación
- **AND** en una nueva visita sin núcleo guardado reaparece el asistente.
### Requirement: Núcleo editable en la barra de título
The system SHALL mostrar el núcleo con letra mayor que la etiqueta actual en la misma barra superior, como control accesible que permita cambiarlo al pulsar, sin añadir otra fila permanente de selección al panel.
#### Scenario: Cambio de núcleo
- **WHEN** se pulsa el nombre del núcleo en la cabecera
- **THEN** se abre su selección y después se eligen estaciones de ese núcleo
- **AND** cancelar conserva el trayecto previo y confirmar elimina selecciones incompatibles.
#### Scenario: Pantalla móvil
- **WHEN** la app se usa a 360 px con un nombre de núcleo largo
- **THEN** el nombre es legible, el control admite teclado y tiene área táctil de al menos 44 px, sin solapar la campana ni desbordar horizontalmente.
