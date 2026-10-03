## MODIFIED Requirements
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


### Requirement: Selectores editables y borrables
The system SHALL permitir escribir y elegir opciones desplegables en núcleo, origen y destino, con botón × accesible para borrar. SHALL confirmar solo opciones existentes y conservar selección ante texto inválido al abandonar el campo.
#### Scenario: Quitar destino
- **WHEN** se pulsa Borrar destino
- **THEN** queda vacío, la llegada pasa a la terminal de cada tren y se muestran salidas sin filtro de destino, persistiendo ese estado.
#### Scenario: Sustituir origen
- **WHEN** se borra origen
- **THEN** se permite escribir y elegir otro sin forzar el asistente durante esa visita ni mostrar horarios del origen borrado.
#### Scenario: Escribir y desplegar
- **WHEN** se edita un campo
- **THEN** se ofrecen opciones del núcleo correspondiente y puede confirmarse una opción con teclado o puntero.

