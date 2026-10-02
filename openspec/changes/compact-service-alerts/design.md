# Design
## Context
La fila redundante de título de vista y reloj se elimina en remove-redundant-board-header. La cabecera ahora empieza en origen/destino. No existe proveedor de alertas. El GTFS estático no contiene estado de incidencias; docs/renfe-data.md solo verificó CORS de trip_updates, no de alerts.
## Goals / Non-Goals
Información relevante con consumo mínimo de pantalla. No convertir la cabecera en un tablón ni abrir avisos automáticamente.
## Decisions
- Campana en la barra superior de la aplicación; no recrear la fila eliminada de título/reloj ni reservar hueco sin incidencia. Grid flexible y controles legibles, sin añadir fila permanente en móvil. Texto corto (p.ej. «C1 · Corte» o «2 incidencias»), nunca ticker ni animación. Nombre accesible contiene resumen completo. El color refuerza pero no sustituye icono y texto.
- Detalle mediante diálogo accesible móvil con título, cierre, Escape, gestión de foco y desplazamiento interno. No abrirlo por polling. Si desaparecen los avisos mientras está abierto, informar y permitir cerrar devolviendo foco al título cuando ya no exista el botón.
- Fuente candidata oficial confirmada en catálogo: Incidencias y avisos, recurso alerts.json; anuncia actualización cada 20 segundos. Verificar URL efectiva, esquema, IDs de Bilbao, timestamp y CORS desde el origen publicado antes de conectar. No asumir que las restricciones observadas para trip_updates se aplican igual.
- Adapter con estados loading/available/unavailable y avisos normalizados: id, texto, entidades oficiales, períodos, impacto, sourceTimestamp. Consultar cada 60 s mientras visible y al reanudar con límite de frecuencia. Considerar no verificable una observación con más de 5 minutos; hacer configurable este umbral del feed, independiente del validTo del GTFS estático. Interpretar feed completo/diferencial y retiradas según contrato real, sin asumir que un delta vacío elimina avisos.
- Si CORS impide fetch, usar únicamente una capa mínima con upstream fijo, cache breve y timestamp original, sin DB ni proxy abierto. Acreditar necesidad y documentar despliegue; la UI puede verificarse con fixtures pero no se declarará integración en vivo terminada sin fuente real.
- Normalizar IDs con referencia al catálogo oficial, conservar aviso general Bilbao, filtrar al trayecto cuando exista alcance verificable y no excluir avisos de accesibilidad relevantes. Para fechas futuras, exigir período conocido que solape la fecha; intervalo sin fin no implica vigencia eterna si el feed no es fresco.
- Fallos técnicos se reflejan en el espacio de fuente ya existente; cero avisos no significa garantía de puntualidad. No modificar horas programadas basándose en un texto de alerta.
## Risks / Trade-offs
Texto largo → resumen breve y detalle a un toque. Falta de IDs precisos → no atribuir por nombre de línea; mantener solamente alcance confirmado. Feed no disponible → horarios siguen operativos, sin fingir ausencia de avisos. Pruebas simuladas → documentarlas como tales.
## Referencia
https://data.renfe.com/dataset/f28e345f-e9a3-4d08-ab56-15c9418c2737/resource/3634402c-4972-4007-8bf0-42d33aeb1b68
Catálogo oficial consultado 2026-10-02; endpoint y CORS pendientes de prueba durante implementación.

Ajuste solicitado 2026-10-03: campana en masthead, neutra/deshabilitada sin avisos verificables; marcada y con contador al haberlos. Se retira el texto visible de error de fuente. Sustituye la ubicación en origen y cualquier referencia anterior a ocultar la campana.
