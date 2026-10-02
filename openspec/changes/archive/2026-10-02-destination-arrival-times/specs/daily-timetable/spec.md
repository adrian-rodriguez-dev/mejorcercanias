# Spec Delta
## ADDED Requirements
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
