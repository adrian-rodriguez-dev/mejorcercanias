# Spec Delta
## MODIFIED Requirements
### Requirement: Selección coherente
The system SHALL conservar línea y destino al cambiar de vista durante la visita, reiniciarlos al cambiar manualmente de origen; al intercambiar origen y destino SHALL conservar la línea e invertir las estaciones y limpiar un destino incompatible al elegir otra línea.
#### Scenario: Cambio de vista
- **WHEN** se pasa del panel a la tabla
- **THEN** se mantienen los filtros de línea y destino
#### Scenario: Sin servicios en la fecha
- **WHEN** la nueva fecha no tiene coincidencias
- **THEN** se conserva visible la selección y se muestra ausencia de coincidencias, sin ampliar filtros silenciosamente

### Requirement: Presentación móvil compacta
The system SHALL mostrar el destino opcional únicamente en la cabecera y plegar inicialmente los controles de línea y hora en una barra con resumen visible, permitir abrir/cerrar y limpiar filtros, ofrecer controles de al menos 44 px y funcionar a 360 px sin desbordamiento horizontal.
#### Scenario: Primer tren visible
- **WHEN** una estación tiene salidas y los filtros están plegados en un móvil de 360 por 800 px
- **THEN** la primera salida permanece visible sin desplazamiento
#### Scenario: Acceso con teclado
- **WHEN** se activa el resumen de filtros con teclado
- **THEN** se accede a selectores etiquetados y se puede cerrar recuperando el foco en el resumen
