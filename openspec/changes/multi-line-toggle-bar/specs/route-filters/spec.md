# Spec Delta
## REMOVED Requirements
### Requirement: Barra de líneas de selección única
**Reason**: El usuario solicita selección múltiple y elimina Todas.
**Migration**: Sustituir línea única por colección; vacío equivale a todas.
## ADDED Requirements
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
## MODIFIED Requirements
### Requirement: Identidad cromática oficial y accesible
The system SHALL colorear el recuadro completo de C1 rojo, C2 verde y C3 azul claro, usando un tono oscuro desmarcado y el tono luminoso de referencia al activarlo. SHALL conservar texto legible, foco y marca/estado accesible además del color; no habrá chip interior ni botón Todas.
#### Scenario: Alternancia visual
- **WHEN** se pulsa una línea desmarcada y se vuelve a pulsar
- **THEN** su fondo pasa de oscuro a luminoso y de nuevo a oscuro, con aria-pressed y marca visual coherentes.
#### Scenario: Móvil y teclado
- **WHEN** se usan botones en móvil de 360 px o teclado
- **THEN** los tres caben en una fila, tienen al menos 44 por 44 px, foco visible y descripción accesible de que ninguna selección equivale a todas.
