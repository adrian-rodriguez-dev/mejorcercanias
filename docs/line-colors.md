# Colores de líneas de Bilbao

Fuente: [plano oficial Renfe Bilbao](https://www.renfe.com/content/dam/renfe/es/Viajeros/Secciones/Cercanias/Mapas/2025/Mapa_Bilbao_Cercanias_junio_2025.pdf), inspeccionado el 2026-10-02.

Conversión visual RGB muestreada del relleno de las insignias de cabecera del PDF renderizado con PDFium: C1 `#e5232c` (rojo), C2 `#0f9d4b` (verde), C3 `#5aafe4` (azul claro). Son valores derivados del documento, no códigos corporativos certificados. Tokens compartidos en `.board`, usados por botones y etiquetas de trenes. Texto negro para contraste; selección por borde, marca y aria-pressed. Colores y texto no son la única señal del estado.

Contraste del texto negro sobre las insignias: C1 4,61:1; C2 5,94:1; C3 8,69:1 (luminancia relativa sRGB).

Multiselección: botón completo activo con el RGB de referencia y texto negro; inactivo con 32% de ese color y 68% de #10201c y texto blanco. Selección reforzada por marca y aria-pressed; no hay botón Todas.
