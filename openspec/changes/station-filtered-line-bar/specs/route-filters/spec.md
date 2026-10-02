# Spec Delta

## MODIFIED Requirements

### Requirement: Selección coherente
The system SHALL conservar línea y destino al cambiar de vista durante la visita, reiniciarlos al cambiar manualmente de origen; al intercambiar origen y destino SHALL conservar las líneas compatibles e invertir las estaciones. Al cambiar destino SHALL eliminar selecciones de línea incompatibles sin eliminar el destino; con cero o una línea posible SHALL limpiar la selección explícita.
#### Scenario: Cambio de vista
- **WHEN** se pasa del panel a la tabla
- **THEN** se mantienen los filtros de línea y destino
#### Scenario: Sin servicios en la fecha
- **WHEN** la nueva fecha no tiene coincidencias
- **THEN** se conserva visible la selección y se muestra ausencia de coincidencias, sin ampliar filtros silenciosamente

### Requirement: Presentación móvil compacta
The system SHALL mostrar el destino opcional únicamente en la cabecera, una barra de líneas visible solo cuando al menos dos líneas pasan por las estaciones seleccionadas, sin reservar espacio cuando está oculta y plegar inicialmente solo los filtros horarios avanzados con resumen visible, permitir abrir/cerrar y limpiar filtros, ofrecer controles de al menos 44 px y funcionar a 360 px sin desbordamiento horizontal.
#### Scenario: Primer tren visible
- **WHEN** una estación tiene salidas y los filtros horarios están plegados en un móvil de 360 por 800 px
- **THEN** la primera salida permanece visible sin desplazamiento
#### Scenario: Acceso con teclado
- **WHEN** se activa un botón de línea o el resumen de filtros horarios con teclado
- **THEN** se puede seleccionar la línea directamente, acceder a controles horarios etiquetados y cerrar estos recuperando el foco en el resumen

### Requirement: Barra de líneas con selección múltiple
The system SHALL mostrar únicamente las líneas C1, C2 y C3 que pasan por el origen y, si hay destino, también por él; SHALL ocultar toda la barra con cero o una línea posible; cada botón alterna su selección independientemente y el filtro acepta trenes de cualquiera de las líneas marcadas. Sin líneas marcadas SHALL mostrar todas, manteniendo destino y criterios horarios compatibles. Las selecciones compatibles SHALL conservarse entre vistas e intercambio de estaciones; ninguna selección oculta podrá bloquear resultados.
#### Scenario: Combinación
- **WHEN** se marcan C1 y C2
- **THEN** se muestran trenes de C1 o C2 que cumplen el resto de filtros.
#### Scenario: Vaciar selección
- **WHEN** se desmarca la última línea activa
- **THEN** todos los botones quedan desmarcados y se muestran todas las líneas sin perder destino ni hora.
#### Scenario: Disponibilidad
- **WHEN** se elige Barakaldo sin destino
- **THEN** se muestran C1 y C2; una fecha sin servicio no altera estas opciones.
#### Scenario: Una sola línea
- **WHEN** se elige Santurtzi como destino desde Barakaldo, o Santurtzi como único origen
- **THEN** no se muestra la barra ni se reserva su espacio; los trenes siguen apareciendo sin filtro oculto.
#### Scenario: Ninguna conexión
- **WHEN** se eligen estaciones sin línea común
- **THEN** la barra desaparece y el panel informa de ausencia de trenes directos.
#### Scenario: Recuperar opciones
- **WHEN** se elimina un destino que limitaba Barakaldo a C1
- **THEN** reaparecen C1 y C2 sin selección explícita.

