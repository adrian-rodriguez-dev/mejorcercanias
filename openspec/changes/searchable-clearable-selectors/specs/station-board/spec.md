# Spec Delta
## ADDED Requirements
### Requirement: Selectores editables y borrables
The system SHALL permitir escribir y elegir opciones desplegables en núcleo, origen y destino, con botón × accesible para borrar. SHALL confirmar solo opciones existentes y conservar selección ante texto inválido al abandonar el campo.
#### Scenario: Quitar destino
- **WHEN** se pulsa Borrar destino
- **THEN** queda vacío, desaparece llegada y se muestran salidas sin filtro de destino, persistiendo ese estado.
#### Scenario: Sustituir origen
- **WHEN** se borra origen
- **THEN** se permite escribir y elegir otro sin forzar el asistente durante esa visita ni mostrar horarios del origen borrado.
#### Scenario: Escribir y desplegar
- **WHEN** se edita un campo
- **THEN** se ofrecen opciones del núcleo correspondiente y puede confirmarse una opción con teclado o puntero.
