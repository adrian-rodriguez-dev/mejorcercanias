# Design
## Context
InstallPrompt ya mantiene el evento nativo, descarte y detección standalone.
## Goals / Non-Goals
Conservar una sola instancia de ese estado y hacer accesible la instalación desde arriba. No cambiar el soporte offline.
## Decisions
Renderizar el botón de cabecera mediante portal en un contenedor de App. Un diálogo nativo muestra la ayuda cerca del usuario, evita desplazarlo al pie, captura foco y permite Escape. Conservar la invitación y acceso manual existentes. Icono SVG con etiqueta corta y área táctil de 44 px; cabecera móvil conserva sus filas actuales.
## Risks / Trade-offs
Los navegadores no siempre permiten detectar instalación externa: respetar standalone/appinstalled y explicar la instalación manual sin prometer éxito.
