# Design
## Context
Departure ya incluye arrivals por stationId. filterTimetable obtiene arrivalAt de esa colección. App filtra por destino pero solo presenta scheduledAt. Compartir extracción evita usar por error llegada a la terminal.
## Goals / Non-Goals
Mostrar llegada directa sin añadir formularios ni descargas. Sin duración estimada, transbordos ni retrasos en tiempo real.
## Decisions
Buscar llegada por identificador seleccionado; reutilizar helper entre ambas vistas si evita duplicación. En el panel agrupar Salida/Llegada en el bloque horario compacto, manteniendo cuenta atrás referida a la salida. Tabla diaria conserva columna condicional. +1 día se calcula comparando fechas locales de salida y llegada, no solo HH:mm. Ocultar bloque al vaciar destino.
## Risks / Trade-offs
Más información en móvil → comprobar 360 px, nombres largos y primer tren visible. Hora ausente → conservar exclusión del filtro por destino. Se exige solo programación oficial, no garantizar puntualidad.
