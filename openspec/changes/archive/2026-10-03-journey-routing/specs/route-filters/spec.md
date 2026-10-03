## MODIFIED Requirements
### Requirement: Filtros combinados
The system SHALL filtrar por línea del primer tren y destino de itinerario (directo o con hasta tres transbordos) en próximas salidas y horario completo, antes del límite de ocho salidas y junto a los filtros horarios existentes.
#### Scenario: Tren posterior a los ocho primeros
- **WHEN** la primera coincidencia de línea y destino está después de los ocho trenes generales
- **THEN** el panel la muestra entre los próximos trenes filtrados
#### Scenario: Destino intermedio
- **WHEN** se selecciona una parada intermedia con bajada permitida
- **THEN** aparecen los trenes que paran allí aunque su terminal sea otra

### Requirement: Barra de líneas con selección múltiple
The system SHALL mostrar las líneas del núcleo que pasan por el origen; con cálculo de rutas habilitado no exigirá que pasen por el destino, pues podrán enlazar con otra línea; en snapshots antiguos sin grafo conservará la intersección con destino; SHALL ocultar toda la barra con cero o una línea posible; cada botón alterna su selección independientemente y el filtro acepta trenes de cualquiera de las líneas marcadas. Sin líneas marcadas SHALL mostrar todas, manteniendo destino y criterios horarios compatibles. Las selecciones compatibles SHALL conservarse entre vistas e intercambio de estaciones; ninguna selección oculta podrá bloquear resultados.
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

