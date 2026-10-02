# Design
## Context
El estado actual es line:string y la barra tiene cuatro botones. No se persisten filtros, por lo que no hay migración de almacenamiento.
## Goals / Non-Goals
Selección múltiple y ahorro de espacio. Sin cambios de datos ni navegación.
## Decisions
RouteFilter.lines será string[]; vacío acepta cualquier línea. Al cambiar se preserva destino si cualquiera de las líneas elegidas sirve esa parada; al vaciar se conserva siempre. Compartir entre vistas y aplicar antes del límite de ocho. Usar tres columnas y tokens existentes para fondo luminoso; mezclar con negro para inactivo y usar texto claro. Marca y aria-pressed refuerzan brillo. Las etiquetas en resultados mantienen colores normales. Permitir desactivar una línea seleccionada que ya no pasa por el origen después de invertir.
## Risks / Trade-offs
Ningún botón activo podría parecer ningún resultado → descripción accesible y title explican que significa todas. Mantener primer tren visible, sin nueva fila de ayuda permanente.
