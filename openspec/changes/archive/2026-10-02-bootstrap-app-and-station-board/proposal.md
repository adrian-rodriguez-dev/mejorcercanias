# Proposal

## Why

Consultar el tren habitual exige repetir demasiados campos. Esta primera vertical valida «abrir → mirar → saber cuándo pasa el tren» mediante un panel móvil que recuerda la estación.

## What Changes

- Crear una SPA React + TypeScript con Vite y un panel legible en móvil.
- Ofrecer varias estaciones de Bilbao, recordar la selección y recuperarse de almacenamiento bloqueado o valores antiguos.
- Mostrar línea, destino, hora y minutos restantes, ordenados por salida y actualizados automáticamente.
- Usar una fuente de demostración determinista, claramente identificada como ficticia, detrás de un contrato sustituible por JSON GTFS preprocesado.
- Incluir estados de carga, error, reintento y fin de servicio, pruebas y guía de desarrollo.
- Documentar la exploración, la fuente oficial Renfe, la comprobación CORS y propuestas futuras sin desarrollarlas aquí.

## Capabilities

### New Capabilities
- `station-board`: selección persistente de estación y consulta de próximas salidas con procedencia visible.

### Modified Capabilities
Ninguna: proyecto nuevo sin especificaciones existentes.

## Impact

Nuevo frontend estático, contrato de datos y pruebas. Sin cuentas, backend, base de datos, Angular ni .NET. GTFS real, horario completo, PWA y tiempo real quedan fuera de esta vertical; no debe publicitarse como servicio de horarios reales.
