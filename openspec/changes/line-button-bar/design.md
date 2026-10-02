# Design
## Context
La cabecera única ya contiene origen/destino e intercambio. RouteFilters usa un select dentro de details; la app conserva línea entre vistas. Las etiquetas actuales usan colores de demo, no los del plano oficial. El catálogo incluye líneas por estación; no debe inferirse disponibilidad desde salidas de una fecha.
## Goals / Non-Goals
Barra compacta de acceso directo y coherencia visual. Sin multiselección ni ampliación del núcleo.
## Decisions
- Barra compartida dentro del panel, debajo de las pestañas y antes de los resultados/controles diarios. Grid de cuatro columnas con mínimo táctil 44 px y separación; no añadir altura de un desplegable redundante en próximas salidas.
- Botones nativos agrupados con etiqueta «Filtrar por línea» y aria-pressed. Todas neutral; C1/C2/C3 con franja o fondo de su color. Selección mediante borde y marca, sin depender de opacidad/color. Conservar código textual y contraste WCAG AA: si el color oficial no admite texto blanco, texto oscuro o chip separado; no cambiar el color identificativo para compensar.
- Un mapa de tokens por núcleo/línea compartido por barra y etiquetas. Referencia visual oficial verificada: plano Renfe Bilbao junio 2025, C1 rojo/C2 verde/C3 azul claro. No se ha verificado una tabla normativa hexadecimal: extraer y documentar valores digitales de los elementos del PDF durante implementación, distinguiendo conversión visual de un código corporativo certificado.
- Botones sin línea en el catálogo de origen deshabilitados; no deshabilitar por cero coincidencias de día/destino. Si al intercambiar queda una línea seleccionada que el catálogo no contiene, conservar estado visible y ofrecer Todas; no ampliar silenciosamente filtros. Mantener limpieza de destino incompatible al elegir explícitamente otra línea según spec existente.
- Eliminar select de línea, conservar controles horarios plegables solo en tabla. No cambiar lógica de filtrado antes del límite de ocho ni estado compartido. Ajustar pruebas que esperan combobox de línea para comprobar botones y aria-pressed.
## Risks / Trade-offs
Colores oficiales claros → marca cromática separada de texto con contraste verificado. Las líneas C4/C5 aparecen en planos oficiales pero no pertenecen al alcance actual del dataset → solo tres botones solicitados. No hay horarios para una fecha → estado vacío, no ocultar la línea.
## Referencia verificada
https://www.renfe.com/content/dam/renfe/es/Viajeros/Secciones/Cercanias/Mapas/2025/Mapa_Bilbao_Cercanias_junio_2025.pdf
Inspección visual del plano oficial: 2026-10-02. La spec no presenta colores aproximados como códigos reglamentarios certificados.
