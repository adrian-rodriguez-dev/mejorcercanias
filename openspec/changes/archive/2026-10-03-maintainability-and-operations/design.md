## Context
Ver proposal.md. Aplicación estática con GTFS versionado y worker opcional de avisos.

## Goals / Non-Goals
Separar responsabilidades y hacer verificable el mantenimiento. No cambiar horarios, colores ni algoritmo de rutas, ni publicar desde esta revisión.

## Decisions
- Carpetas app, components, platform y styles; mantener data para motor y proveedores. Evitar una migración completa por funcionalidades mientras las fronteras sigan siendo pequeñas.
- Prettier ya instalado como puerta de CI, excluyendo datos generados. TypeScript estricto sigue siendo el control de tipos; sin dependencias nuevas de lint.
- Detectar cambios con git status limitado a datos, incluyendo archivos nuevos. Saltar validación costosa y publicación cuando no hay cambios. Recuperar despliegues fallidos por ejecución manual de Validate sobre main.
- Informes Playwright separados por suite y artefactos con retención explícita para diagnosticar fallos.
- Predicados de entrada rechazan valores JSON inválidos antes de acceder a propiedades anidadas.

## Risks / Trade-offs
- Imports rotos al mover archivos → tsc y suites completas.
- Documentación caducada → índice con fuentes de verdad, números ligados al snapshot y revisión en cada cambio.
- El gate de formato no detecta todos los defectos → pruebas de dominio, Python, worker y navegador siguen siendo obligatorias.

## Migration Plan
Cambio local reversible por Git. Sin migración de datos ni preferencias. Publicación normal tras revisión; recuperar con revert y una nueva build.
