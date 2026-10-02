# Design
## Decisions
Reubicar AlertIndicator en masthead-actions. Campana SVG sin dependencias y contador visual; cero avisos mantiene botón deshabilitado con etiqueta accesible según fuente. Quitar reglas que estrechaban origen para indicador. Sobrescribir margen del workspace incluyendo has-station, que antes tenía 22 px por especificidad. Mantener tamaño táctil.
## Risks / Trade-offs
Cabecera móvil estrecha: ajustar tamaño de región, comprobar a 360 px. Se actualiza la propuesta pendiente de incidencias a esta nueva ubicación y supresión de texto de error.
