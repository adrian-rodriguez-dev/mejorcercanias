# Design

## Context

Proyecto vacío salvo OpenSpec. Ver proposal.md y exploration.md. El diseño afecta UI, datos, reloj y almacenamiento, por lo que requiere este artefacto.

## Goals / Non-Goals

**Goals:** separar proveedor, cálculo temporal y presentación para sustituir fixtures sin rehacer el panel; no añadir dependencias de ejecución salvo React.

**Non-Goals:** parser GTFS, horarios reales, SSR, enrutamiento multipágina, autenticación y caché offline. Véase propuesta para límites funcionales.

## Decisions

- Vite + React + TypeScript estricto. Una SPA sin router simplifica hosting estático frente a un framework SSR.
- Proveedor asíncrono con catálogo de estaciones, fuente y salidas ISO con zona explícita. Identificadores demo con prefijo propio; no fingir identificadores GTFS oficiales.
- Fixture JSON estático pequeño por estación con patrón diario ficticio. Se materializa en Europe/Madrid con una librería temporal probada; no sumar 24 horas para avanzar días con cambio de hora. Los patrones operan de 06:00 a 23:00 y la UI indica mañana para salidas del siguiente día.
- localStorage almacena solo un id versionado. Validar contra catálogo y capturar excepciones. Sin IndexedDB hasta abordar offline.
- Un reloj compartido cada 15 segundos y evento visibilitychange. Ignorar respuestas anteriores tras cambiar estación; no dejar datos de otra estación visibles durante carga.
- CSS propio, fondo claro y panel oscuro de estación, tipografía del sistema, filas con jerarquía visual. Selector nativo para teclado y móvil.
- Vitest + Testing Library para lógica y estados; Playwright para flujo real, persistencia y viewport móvil.

## Risks / Trade-offs

- [Mock confundido con horario] → aviso destacado permanente y procedencia en contrato; README deja claro que no sirve para viajar.
- [Horarios de madrugada/cambio DST] → instantes absolutos, huso explícito y pruebas; calendario GTFS se aborda en su propuesta.
- [GTFS-RT sin CORS] → comprobación GET del 2026-10-02 con Origin https://mejorcercanias.es: HTTP 200 en trip_updates.pb, sin Access-Control-Allow-Origin. No habilitar consumo directo. Futuro Worker con upstream fijo, caché corta y origen restringido si una prueba de navegador confirma bloqueo.
- [Preferencia no guardada] → seguir en memoria y mostrar aviso accesible.

## Migration Plan

Primera entrega local: instalar, probar y generar dist. Publicación pendiente del remoto autorizado y revisión del producto; no activar dominio. Revertir una versión consiste en restaurar los archivos estáticos previos. El proveedor real se incorporará mediante nueva propuesta y metadatos de vigencia.
