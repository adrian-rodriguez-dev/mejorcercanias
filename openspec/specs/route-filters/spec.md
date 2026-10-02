# route-filters Specification

## Purpose
Elegir línea y destino directo de forma consistente en ambas vistas, conservando el espacio útil del panel en pantallas móviles.

## Requirements

### Requirement: Filtros combinados
The system SHALL filtrar por línea y parada posterior de destino en próximas salidas y horario completo, antes del límite de ocho salidas y junto a los filtros horarios existentes.
#### Scenario: Tren posterior a los ocho primeros
- **WHEN** la primera coincidencia de línea y destino está después de los ocho trenes generales
- **THEN** el panel la muestra entre los próximos trenes filtrados
#### Scenario: Destino intermedio
- **WHEN** se selecciona una parada intermedia con bajada permitida
- **THEN** aparecen los trenes que paran allí aunque su terminal sea otra

### Requirement: Selección coherente
The system SHALL conservar línea y destino al cambiar de vista durante la visita, reiniciarlos al cambiar manualmente de origen; al intercambiar origen y destino SHALL conservar la línea e invertir las estaciones y limpiar un destino incompatible al elegir otra línea.
#### Scenario: Cambio de vista
- **WHEN** se pasa del panel a la tabla
- **THEN** se mantienen los filtros de línea y destino
#### Scenario: Sin servicios en la fecha
- **WHEN** la nueva fecha no tiene coincidencias
- **THEN** se conserva visible la selección y se muestra ausencia de coincidencias, sin ampliar filtros silenciosamente

### Requirement: Presentación móvil compacta
The system SHALL mostrar el destino opcional únicamente en la cabecera, una barra de líneas siempre visible y plegar inicialmente solo los filtros horarios avanzados con resumen visible, permitir abrir/cerrar y limpiar filtros, ofrecer controles de al menos 44 px y funcionar a 360 px sin desbordamiento horizontal.
#### Scenario: Primer tren visible
- **WHEN** una estación tiene salidas y los filtros horarios están plegados en un móvil de 360 por 800 px
- **THEN** la primera salida permanece visible sin desplazamiento
#### Scenario: Acceso con teclado
- **WHEN** se activa un botón de línea o el resumen de filtros horarios con teclado
- **THEN** se puede seleccionar la línea directamente, acceder a controles horarios etiquetados y cerrar estos recuperando el foco en el resumen

### Requirement: Identidad cromática oficial y accesible
The system SHALL colorear el recuadro completo de C1 rojo, C2 verde y C3 azul claro, usando un tono oscuro desmarcado y el tono luminoso de referencia al activarlo. SHALL conservar texto legible, foco y marca/estado accesible además del color; no habrá chip interior ni botón Todas.
#### Scenario: Reconocimiento de línea
- **WHEN** se pulsa una línea desmarcada y se vuelve a pulsar
- **THEN** su fondo pasa de oscuro a luminoso y de nuevo a oscuro, con aria-pressed y marca visual coherentes.
#### Scenario: Teclado y pantalla pequeña
- **WHEN** se usan botones en móvil de 360 px o teclado
- **THEN** los tres caben en una fila, tienen al menos 44 por 44 px, foco visible y descripción accesible de que ninguna selección equivale a todas.

### Requirement: Barra de líneas con selección múltiple
The system SHALL mostrar solo C1, C2 y C3; cada botón alterna su selección independientemente y el filtro acepta trenes de cualquiera de las líneas marcadas. Sin líneas marcadas SHALL mostrar todas, manteniendo destino y criterios horarios compatibles. El estado SHALL conservarse entre vistas e intercambio de estaciones.
#### Scenario: Combinación
- **WHEN** se marcan C1 y C2
- **THEN** se muestran trenes de C1 o C2 que cumplen el resto de filtros.
#### Scenario: Vaciar selección
- **WHEN** se desmarca la última línea activa
- **THEN** todos los botones quedan desmarcados y se muestran todas las líneas sin perder destino ni hora.
#### Scenario: Disponibilidad
- **WHEN** una línea no pasa por la estación
- **THEN** no se puede activar, pero si estaba seleccionada antes de un intercambio se permite desmarcarla; la falta de servicios en una fecha no deshabilita por sí sola una línea de la estación.
