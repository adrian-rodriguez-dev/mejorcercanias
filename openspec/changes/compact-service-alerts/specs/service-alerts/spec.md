# Spec Delta
## Purpose
Hacer visibles las incidencias que afectan a la consulta sin ocupar espacio permanente ni dificultar el acceso a los próximos trenes.
## ADDED Requirements
### Requirement: Indicador condicional en título
The system SHALL mostrar un único indicador compacto en la barra superior de la aplicación solo cuando haya incidencias oficiales relevantes y vigentes. Sin incidencias SHALL mantener la campana neutra y deshabilitada; SHALL NOT mostrar una franja «Sin incidencias».
#### Scenario: Ausencia de avisos
- **WHEN** una consulta válida devuelve cero incidencias relevantes
- **THEN** la campana está neutra y el contenido no añade filas ni mensajes.
#### Scenario: Una o varias incidencias
- **WHEN** existe al menos una incidencia relevante
- **THEN** aparece un botón con icono, resumen de una línea y contador si hay varias, priorizando el impacto de servicio conocido.
### Requirement: Relevancia y vigencia
The system SHALL seleccionar avisos por identificadores oficiales de Bilbao y su afectación a estación, línea o trayecto consultado, respetando los períodos activos. SHALL NOT unir núcleos distintos únicamente porque compartan el nombre C1/C2/C3 ni inventar una afectación no documentada.
#### Scenario: Cambio de consulta
- **WHEN** se cambia origen, destino, línea o fecha
- **THEN** se recalculan avisos relevantes y se descartan respuestas de consultas anteriores.
#### Scenario: Horario de mañana
- **WHEN** se consulta otra fecha
- **THEN** se muestran solo avisos cuyo período publicado afecte a esa fecha; no se presentan avisos actuales como predicción confirmada de mañana.
#### Scenario: Aviso general
- **WHEN** un aviso oficial afecta explícitamente a todo el núcleo
- **THEN** permanece visible con cualquier estación de Bilbao, incluso sin destino elegido.
### Requirement: Detalle a un toque
The system SHALL abrir el detalle solo por interacción del usuario, mostrar texto completo, afectación conocida, período y fuente/última actualización, y permitir cerrarlo con un toque o Escape devolviendo el foco al indicador. SHALL mantener disponibles las selecciones existentes.
#### Scenario: Acceso rápido
- **WHEN** se pulsa el indicador
- **THEN** se abre un panel de detalle accesible, cerrado inicialmente, sin navegar fuera de los horarios ni reiniciar la consulta.
#### Scenario: Móvil y teclado
- **WHEN** se usa una pantalla de 360 px, texto largo o teclado
- **THEN** el indicador cabe en la barra sin desbordamiento ni superposición, tiene área táctil de al menos 44 px y nombre accesible completo; cerrado, el primer tren sigue visible a 360 por 800 px.
### Requirement: Datos de alertas honestos
The system SHALL distinguir cero avisos de fuente no disponible, no mostrar incidencias caducadas como activas ni afirmar ausencia de incidencias tras fallo de red. La descarga de alertas SHALL NOT bloquear los horarios.
#### Scenario: Red fallida o feed antiguo
- **WHEN** no se pueden verificar avisos recientes
- **THEN** no se crea una incidencia ficticia en el título ni una franja de error; el estado de disponibilidad se conserva en la etiqueta accesible de la campana, sin aviso visible de error mientras la integración esté pendiente.
#### Scenario: Aviso retirado
- **WHEN** una actualización completa y válida retira un aviso o termina su vigencia
- **THEN** desaparece del indicador y, si era el último, la barra recupera su espacio normal.

Ajuste solicitado 2026-10-03: campana en masthead, neutra/deshabilitada sin avisos verificables; marcada y con contador al haberlos. Se retira el texto visible de error de fuente. Sustituye la ubicación en origen y cualquier referencia anterior a ocultar la campana.
