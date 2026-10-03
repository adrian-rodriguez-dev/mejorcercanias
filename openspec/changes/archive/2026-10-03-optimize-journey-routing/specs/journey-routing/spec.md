## MODIFIED Requirements
### Requirement: Búsqueda interna por rondas
The system SHALL aplicar un margen estimado de 60 segundos para cambiar de tren en el mismo punto de embarque cuando no haya una regla GTFS aplicable. Las reglas oficiales aplicables SHALL tener prioridad; los enlaces peatonales entre puntos distintos SHALL mantener sus tiempos explícitos.
The system SHALL buscar hasta tres transbordos usando calendarios, tiempos de embarque y bajada, reglas GTFS y enlaces explícitos; SHALL usar penalización de 15 minutos para preferir itinerarios menos complejos.
#### Scenario: Cambio demasiado corto
- **WHEN** el siguiente tren sale antes del mínimo de transbordo
- **THEN** se descarta esa conexión y se considera un tren posterior.
#### Scenario: Puntos de embarque separados
- **WHEN** una estación agrupa dos puntos físicos
- **THEN** el cambio entre ellos respeta el enlace peatonal sin atajo por identidad compartida.


#### Scenario: Un minuto en la misma estación
- **WHEN** se cambia de tren en el mismo punto sin regla específica de Renfe
- **THEN** se admite una conexión con 60 segundos disponibles, se rechaza una de 59 segundos y el margen se identifica como estimado.
