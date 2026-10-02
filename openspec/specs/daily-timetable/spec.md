# daily-timetable Specification

## Purpose
Consultar todos los trenes de una fecha y encontrar rápidamente un viaje directo que permita llegar a destino antes de una hora concreta.

## Requirements

### Requirement: Navegación por fecha
The system SHALL ofrecer Hoy, Mañana, anterior, siguiente y selector de fecha en una vista secundaria, conservando próximas salidas como vista inicial.
#### Scenario: Consultar mañana
- **WHEN** se abre Horario completo y se pulsa Mañana
- **THEN** se muestran todos los servicios publicados de mañana desde la estación elegida, incluidos los anteriores a la hora actual

### Requirement: Consulta de llegada
The system SHALL filtrar viajes directos por destino y hora de llegada límite, mostrar salida y llegada y destacar la salida más tardía que cumple el límite, sin calcular transbordos.
#### Scenario: Llegar a Bilbao a las nueve
- **WHEN** se selecciona mañana, Bilbao-Abando y llegar antes de las 09:00
- **THEN** solo aparecen viajes que paran después del origen en Bilbao y llegan como máximo a las 09:00 de la fecha elegida
- **AND** se destaca la salida más tardía compatible

### Requirement: Tabla completa y filtros
The system SHALL permitir quitar filtros para ver todo el día y filtrar por salida desde una hora; SHALL distinguir ninguna coincidencia de datos no publicados y descartar respuestas antiguas al cambiar fecha o estación.
#### Scenario: Limpiar filtros
- **WHEN** se pulsa Ver todo el día
- **THEN** se restauran todos los trenes de esa fecha en orden de salida
#### Scenario: Cambio rápido
- **WHEN** termina una carga de una fecha anterior tras seleccionar otra
- **THEN** no sustituye la tabla de la nueva selección

### Requirement: Hora de llegada al destino seleccionado
The system SHALL mostrar la hora programada de salida y de llegada a la estación elegida cuando exista destino, con etiquetas inequívocas y hora Europe/Madrid. Sin destino SHALL ocultar llegada y su espacio. SHALL indicar si la llegada corresponde al día siguiente y no inferir tiempos ausentes.
#### Scenario: Parada intermedia
- **WHEN** se elige un destino anterior a la terminal del tren
- **THEN** aparece la llegada a esa parada, no la de la terminal, manteniendo identificación del destino final del tren.
#### Scenario: Cambio o intercambio
- **WHEN** cambia el destino o se intercambian origen y destino
- **THEN** las llegadas corresponden a la nueva selección sin mostrar datos anteriores durante la carga.
#### Scenario: Sin destino o llegada
- **WHEN** se elimina el destino
- **THEN** desaparece la llegada sin dejar una columna vacía.
- **AND** si un tren carece de llegada válida al destino elegido no se presenta como coincidencia ni se inventa su hora.
#### Scenario: Medianoche y móvil
- **WHEN** un tren llega al día siguiente y se consulta a 360 px
- **THEN** salida y llegada son legibles sin desplazamiento horizontal y la llegada indica +1 día.
