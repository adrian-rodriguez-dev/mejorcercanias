## ADDED Requirements

### Requirement: Búsqueda visible con teclado móvil
The system SHALL colocar el campo de búsqueda enfocado cerca del borde superior del área visible en pantallas móviles y limitar el desplegable al espacio disponible debajo. SHALL reajustarse cuando cambia el viewport visible al abrir el teclado, sin modificar el valor ni impedir desplazarse por las opciones. En escritorio SHALL conservar la posición de la página.

#### Scenario: Teclado reduce el espacio visible
- **WHEN** se enfoca un selector de núcleo, origen o destino en móvil y aparece el teclado
- **THEN** el campo permanece arriba, las opciones caben en el área visible y su lista puede desplazarse sin desplazar el campo fuera de la pantalla.

#### Scenario: Escritorio
- **WHEN** se enfoca el mismo campo en una pantalla de escritorio
- **THEN** no se fuerza su desplazamiento a la parte superior.
