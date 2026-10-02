# Spec Delta
## Purpose
Elegir línea y destino directo de forma consistente en ambas vistas, conservando el espacio útil del panel en pantallas móviles.
## ADDED Requirements
### Requirement: Filtros combinados
The system SHALL filtrar por línea y parada posterior de destino en próximas salidas y horario completo, antes del límite de ocho salidas y junto a los filtros horarios existentes.
#### Scenario: Tren posterior a los ocho primeros
- **WHEN** la primera coincidencia de línea y destino está después de los ocho trenes generales
- **THEN** el panel la muestra entre los próximos trenes filtrados
#### Scenario: Destino intermedio
- **WHEN** se selecciona una parada intermedia con bajada permitida
- **THEN** aparecen los trenes que paran allí aunque su terminal sea otra
### Requirement: Selección coherente
The system SHALL conservar línea y destino al cambiar de vista durante la visita, reiniciarlos al cambiar de origen y limpiar un destino incompatible al elegir otra línea.
#### Scenario: Cambio de vista
- **WHEN** se pasa del panel a la tabla
- **THEN** se mantienen los filtros de línea y destino
#### Scenario: Sin servicios en la fecha
- **WHEN** la nueva fecha no tiene coincidencias
- **THEN** se conserva visible la selección y se muestra ausencia de coincidencias, sin ampliar filtros silenciosamente
### Requirement: Presentación móvil compacta
The system SHALL plegar inicialmente los controles en una barra con resumen visible, permitir abrir/cerrar y limpiar filtros, ofrecer controles de al menos 44 px y funcionar a 360 px sin desbordamiento horizontal.
#### Scenario: Primer tren visible
- **WHEN** una estación tiene salidas y los filtros están plegados en un móvil de 360 por 800 px
- **THEN** la primera salida permanece visible sin desplazamiento
#### Scenario: Acceso con teclado
- **WHEN** se activa el resumen de filtros con teclado
- **THEN** se accede a selectores etiquetados y se puede cerrar recuperando el foco en el resumen
