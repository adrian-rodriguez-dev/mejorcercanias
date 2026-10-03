# Design
## Context
La instalación y ayuda ya comparten estado y usan un portal para el acceso superior.
## Decisions
Mover el destino del portal fuera de la cabecera y unificar allí la invitación. Mostrarla si no fue descartada, también cuando solo hay ayuda manual. Texto de 14 px, controles táctiles de 44 px y fondo verde claro. Conservar ayuda del pie tras descarte. Restaurar estilos de marca anteriores.
## Risks / Trade-offs
El aviso añade una fila: limitarlo a una sola línea a 360 px y no duplicarlo al pie.
