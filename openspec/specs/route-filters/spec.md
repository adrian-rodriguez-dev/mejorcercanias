# route-filters Specification

## Purpose
Elegir línea y destino directo de forma consistente en ambas vistas, conservando el espacio útil del panel en pantallas móviles.

## Requirements

### Requirement: Filtros combinados
The system SHALL filtrar por línea del primer tren y destino de itinerario (directo o con hasta tres transbordos) en próximas salidas y horario completo, antes del límite de ocho salidas y junto a los filtros horarios existentes.
#### Scenario: Tren posterior a los ocho primeros
- **WHEN** la primera coincidencia de línea y destino está después de los ocho trenes generales
- **THEN** el panel la muestra entre los próximos trenes filtrados
#### Scenario: Destino intermedio
- **WHEN** se selecciona una parada intermedia con bajada permitida
- **THEN** aparecen los trenes que paran allí aunque su terminal sea otra

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

### Requirement: Identidad cromática oficial y accesible
The system SHALL colorear el recuadro completo de C1 rojo, C2 verde y C3 azul claro, usando un tono oscuro desmarcado y el tono luminoso de referencia al activarlo. SHALL conservar texto legible, foco y marca/estado accesible además del color; no habrá chip interior ni botón Todas.
#### Scenario: Reconocimiento de línea
- **WHEN** se pulsa una línea desmarcada y se vuelve a pulsar
- **THEN** su fondo pasa de oscuro a luminoso y de nuevo a oscuro, con aria-pressed y marca visual coherentes.
#### Scenario: Teclado y pantalla pequeña
- **WHEN** se usan botones en móvil de 360 px o teclado
- **THEN** los tres caben en una fila, tienen al menos 44 por 44 px, foco visible y descripción accesible de que ninguna selección equivale a todas.

### Requirement: Barra de líneas con selección múltiple
The system SHALL mostrar las líneas que pasan por el origen cuando no hay destino; con destino SHALL ofrecer las líneas compartidas por ambas estaciones. Si no comparten ninguna y hay cálculo de rutas habilitado, SHALL ofrecer las líneas del origen para el primer tren de un viaje con transbordos. En snapshots antiguos sin grafo conservará la intersección con destino. SHALL ocultar toda la barra con cero o una línea posible; cada botón alterna su selección independientemente y el filtro acepta trenes de cualquiera de las líneas marcadas. Sin líneas marcadas SHALL calcular todas las alternativas, incluidos transbordos por otras líneas, manteniendo destino y criterios horarios compatibles. Las selecciones compatibles SHALL conservarse entre vistas e intercambio de estaciones; ninguna selección oculta podrá bloquear resultados.

#### Scenario: Una línea compartida con cálculo de transbordos habilitado

- **WHEN** el origen tiene C1 y C2, se seleccionó C2 y se elige un destino servido solo por C1
- **THEN** la barra se oculta, se limpia C2 y se calculan las rutas sin un filtro oculto, tanto en próximos trenes como en horario completo.
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

### Requirement: Persistencia del trayecto seleccionado
The system SHALL guardar origen, destino opcional y líneas seleccionadas localmente y restaurarlos al abrir la app, usando solo estaciones existentes y líneas compatibles. SHALL recordar selecciones vacías e intercambio, migrar la preferencia antigua de origen y continuar funcionando si el almacenamiento falla. Con cero o una línea posible SHALL limpiar selección explícita, conservando la barra oculta.
#### Scenario: Regreso
- **WHEN** se recarga tras elegir origen, destino y varias líneas
- **THEN** se recupera la selección completa y se filtran los trenes desde la primera carga.
#### Scenario: Vaciar e invertir
- **WHEN** se vacía destino o líneas, o se intercambian estaciones, y se recarga
- **THEN** se restaura el último estado completo sin recuperar filtros anteriores.
#### Scenario: Datos antiguos o dañados
- **WHEN** hay JSON corrupto, tipos inválidos o IDs obsoletos
- **THEN** se ignoran valores inválidos, se recupera origen antiguo válido cuando procede y la app sigue funcionando.
#### Scenario: Almacenamiento bloqueado
- **WHEN** el navegador impide guardar
- **THEN** la selección funciona durante la visita y se comunica que no se puede guardar.
