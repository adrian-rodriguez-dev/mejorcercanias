# Design
## Context
Selectores nativos en panel y asistente.
## Decisions
Combobox con lista accesible, flecha desplegable y navegación por teclado y botón de borrar accesible. Solo confirmar nombres existentes; texto parcial no sustituye selección. Escape o perder foco restaura la selección confirmada. Vaciar origen permite elegir otro sin repetir el asistente en la sesión. Borrar destino conserva origen y vuelve a todas las salidas compatibles con líneas.
## Risks
Lista acotada con scroll y búsqueda sin distinguir acentos; conservar escritura, teclado y controles táctiles de 44 px.
