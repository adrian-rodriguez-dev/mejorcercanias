## ADDED Requirements
### Requirement: Selección de línea sin check
The system SHALL indicar selección mediante estilo y aria-pressed sin check junto al nombre.
#### Scenario: Seleccionar C2
- **WHEN** se activa C2
- **THEN** cambia el estilo y aria-pressed sin añadir un símbolo.
## MODIFIED Requirements
### Requirement: Lema de cabecera
The system SHALL mostrar «Tu tren en segundos» con el mismo ancho visual que la marca y tamaño legible proporcional al nombre.
#### Scenario: Inicio
- **WHEN** se abre a 360 px o se amplía texto
- **THEN** marca y lema mantienen ancho alineado sin desbordamiento de página.
