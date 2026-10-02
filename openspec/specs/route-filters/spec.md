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

### Requirement: Barra de líneas de selección única
The system SHALL mostrar Todas, C1, C2 y C3 en ese orden, en una sola fila sin desplegable ni desplazamiento horizontal a 360 px, en ambas vistas. SHALL aplicar el filtro inmediatamente y marcar exactamente una opción activa; Todas elimina solo el filtro de línea.
#### Scenario: Seleccionar y limpiar
- **WHEN** se pulsa C2 y después Todas
- **THEN** primero aparecen salidas filtradas por C2 y después por todas las líneas, manteniendo destino y criterios horarios compatibles.
#### Scenario: Línea activa repetida
- **WHEN** se pulsa la línea ya seleccionada
- **THEN** se mantiene seleccionada; Todas es la acción explícita para retirar el filtro.
#### Scenario: Línea no disponible
- **WHEN** el catálogo de la estación no incluye una de las tres líneas
- **THEN** su botón sigue visible pero deshabilitado con explicación accesible; no se oculta la barra ni se inventan salidas.
#### Scenario: Fecha sin servicios
- **WHEN** una línea de esa estación carece de salidas para la fecha o filtros actuales
- **THEN** sigue siendo seleccionable y se muestra ausencia de coincidencias, conservando la selección.

### Requirement: Identidad cromática oficial y accesible
The system SHALL representar C1 en rojo, C2 en verde y C3 en azul claro conforme al plano oficial de Renfe Bilbao, con los mismos colores identificativos en botones y etiquetas de trenes. SHALL distinguir selección por marca o borde y estado accesible, además del color, manteniendo contraste legible y foco visible.
#### Scenario: Reconocimiento de línea
- **WHEN** se selecciona una línea y se muestran sus trenes
- **THEN** botón y etiquetas comparten identidad cromática y código textual; las opciones no activas conservan identificación de color.
#### Scenario: Teclado y pantalla pequeña
- **WHEN** se navega por la barra con teclado o se toca desde un móvil
- **THEN** los botones tienen etiqueta, estado de selección anunciado, foco visible y superficie de al menos 44 por 44 px.
