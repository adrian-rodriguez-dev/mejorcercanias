## Context
Tema claro actual con paleta azul.
## Goals / Non-Goals
Añadir control luna/sol, persistencia y coral. No inferir cambios del sistema.
## Decisions
Variables semánticas compartidas; light por defecto. Preferencia localStorage tolerante a errores. Color del navegador sincronizado. Colores oficiales de líneas intactos. SVG de marca integrado en el bundle evita icono antiguo en caché.
## Risks / Trade-offs
Validar contraste y espacio de cabecera en móvil en ambos temas.

## Final user revision
El usuario prefiere recuperar el verde oscuro original y sustituir el lima por naranja vivo (#ff850a). Se conserva luna/sol y persistencia; probador de paletas retirado.
