# daily-timetable Specification

## Purpose
Consultar todos los trenes de una fecha con una tabla compacta de salidas y llegadas, manteniendo los filtros compartidos de estaciones y líneas.

## Requirements

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

### Requirement: Hora de llegada al destino seleccionado
The system SHALL mostrar la hora programada de salida y de llegada a la estación elegida cuando exista destino, con etiquetas inequívocas y hora Europe/Madrid. Sin destino SHALL mostrar llegada a la terminal real de ese tren, no al final teórico de la línea. SHALL asociar nombre de estación y hora, mostrando — si falta la llegada terminal. SHALL indicar si la llegada corresponde al día siguiente y no inferir tiempos ausentes.
#### Scenario: Parada intermedia
- **WHEN** se elige un destino anterior a la terminal del tren
- **THEN** aparece la llegada a esa parada, no la de la terminal, manteniendo identificación del destino final del tren.
#### Scenario: Cambio o intercambio
- **WHEN** cambia el destino o se intercambian origen y destino
- **THEN** las llegadas corresponden a la nueva selección sin mostrar datos anteriores durante la carga.
#### Scenario: Sin destino o llegada
- **WHEN** se elimina el destino
- **THEN** se muestra la llegada a la terminal real del tren y su nombre.
- **AND** si un tren carece de llegada válida al destino elegido no se presenta como coincidencia ni se inventa su hora.
#### Scenario: Medianoche y móvil
- **WHEN** un tren llega al día siguiente y se consulta a 360 px
- **THEN** salida y llegada son legibles sin desplazamiento horizontal y la llegada indica +1 día.
