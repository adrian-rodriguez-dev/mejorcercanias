# Design
## Context
La preferencia actual guarda solo origen. App normaliza líneas al cambiar filtros y limpia destino/líneas al cambiar origen manualmente.
## Goals / Non-Goals
Recordar trayecto completo entre visitas. Fecha, hora y vista siguen siendo consultas de sesión.
## Decisions
Un único JSON versionado de trayecto evita restaurar combinaciones parciales. Inicialización perezosa antes de cargar horarios; validar tipos y catálogo. Fallback a la clave antigua de origen. Guardar tras cambios de estado y mantener la clave antigua para compatibilidad. Reutilizar normalización de líneas para restauración y cambios de UI.
## Risks / Trade-offs
Almacenamiento bloqueado o corrupto: capturar errores y conservar comportamiento en memoria. Cambios de catálogo: eliminar valores inexistentes/incompatibles. No recuperar una línea explícita si solo queda una posible.
