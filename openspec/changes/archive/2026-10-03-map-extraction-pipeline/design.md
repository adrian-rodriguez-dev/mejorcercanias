## Context
El prototipo contiene 537 observaciones revisadas de 15 mapas y correspondencias de puntos de embarque. El router consume routing-corrections.json.
## Goals / Non-Goals
Hacer reproducible la extracción y detectar cambios conservando decisiones revisadas. La clasificación automática solo produce candidatos; no habilita caminatas por proximidad ni aparcamientos.
## Decisions
- Versionar mapas y anotaciones bajo data/maps, herramientas bajo tools/maps y salidas bajo work/maps. No copiar mapas a public.
- Comprobar SHA de mapas, GTFS, leyendas y fuentes de apoyo antes de generar propuesta utilizable. Si cambia el mapa, extraer geometría/texto y candidatos genéricos sin aplicar la leyenda antigua.
- Pipeline de solo lectura en GitHub con artefactos y estado needs-review si cambian fuentes. Promoción local explícita y reproducible tras revisar anotaciones; regenerar GTFS después.
- Conservar separadamente el dato observado (<10 min) y política estimada (600 s). Exportar el contrato ya usado por el motor.
## Risks / Trade-offs
- Diferencias de primitivas entre versiones de PyMuPDF → dependencia fijada y tests del corpus.
- Cambios frecuentes del ZIP → correspondencias requieren nueva revisión, sin bloquear el pipeline horario que usa la última configuración aprobada.
- PDF/SVG con texto convertido a contornos → anotaciones revisadas y evidencia visual; no prometer extracción completa.
## Migration Plan
Publicar primero la aplicación existente. Integrar herramientas y ejecutar una captura fija reproducible y el workflow real. Las propuestas no cambian producción hasta promoción y regeneración validada.
