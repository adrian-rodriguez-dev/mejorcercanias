# Proposal
## Why
El selector desplegable de línea exige abrir controles para una elección de solo tres opciones. Una barra visible permite filtrar de un toque y reconocer las líneas por su identidad oficial.
## What Changes
- Sustituir el selector de línea por botones Todas, C1, C2, C3 en una fila dentro del panel oscuro, tanto en próximas salidas como en horario completo.
- Aplicar colores del plano oficial de Bilbao: C1 rojo, C2 verde, C3 azul claro, también a las etiquetas de los trenes.
- Selección única inmediata, con marca visible y accesible; conservar comportamiento de filtros y de intercambio.
- Mantener únicamente la consulta horaria avanzada en el desplegable del horario completo.
Fuera de alcance: multiselección, líneas C4/C5, cambios de datos o identidad global de la app.
## Capabilities
### New Capabilities
Ninguna.
### Modified Capabilities
- `route-filters`: presentación móvil visible y selección de línea por botones con colores oficiales.
## Impact
Componente de filtros, App/Timetable, estilos compartidos de línea, pruebas y README. No cambia el predicado de horarios.
