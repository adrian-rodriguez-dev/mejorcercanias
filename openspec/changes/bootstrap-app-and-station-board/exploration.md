# Exploración inicial · 2026-10-02

## Problema y experiencia

La estación habitual es el punto de entrada; no se pide destino, fecha ni hora. En la primera visita se elige estación y en las siguientes aparece su panel. Dirección y línea deben distinguirse sin depender solo del color. Nada de formulario de planificación de rutas.

## Opciones y decisión

React + TypeScript + Vite genera archivos estáticos pequeños. No hacen falta SSR, cuentas ni API propia. localStorage basta para una preferencia; IndexedDB se reconsiderará con el offline. La UI recibe un catálogo y una función asíncrona que entrega salidas con fecha absoluta y procedencia.

El GTFS nacional exige resolver calendar/calendar_dates, horas mayores de 24, huso Europe/Madrid, cambios de hora y correspondencias de viajes. Meter un parser incompleto en la primera vertical sería deuda peligrosa. Se elige mock explícito para validar UX y lógica; la siguiente propuesta deberá descargar y preprocesar el GTFS oficial fuera del navegador y producir JSON compacto por núcleo/estación. El mock no se presenta como horario Renfe.

## Arquitectura objetivo

Renfe GTFS → preprocesado build/CI → catálogo + JSON por estación → proveedor de datos → panel React.
Preferencia local → estación. Futuro GTFS-RT → adaptador que conserva horario programado y añade estimaciones/cancelaciones, sin mutar su procedencia.

## Restricciones y riesgos

- Funcionar a 360 px, con teclado, foco visible, textos claros y sin fuentes externas.
- Mostrar zona horaria de Bilbao aunque el dispositivo esté en otra zona.
- No mostrar un tren ya salido ni convertir hora programada en «en hora» sin datos RT.
- Si localStorage falla, continuar en memoria y explicarlo.
- CORS es una propiedad observada del endpoint y puede cambiar; una descarga por terminal no demuestra por sí sola acceso desde navegador.
- No activar workers, PWA ni automatizaciones de actualización antes de tener su propuesta.

## Fuentes oficiales verificadas

- https://openspec.dev/docs/cli y https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md
- https://data.renfe.com/dataset/horarios-cercanias (GTFS, CC BY 4.0)
- https://ssl.renfe.com/ftransit/Fichero_CER_FOMENTO/fomento_transit.zip
- https://data.renfe.com/es/dataset/horarios-viaje-cercanias (trip updates, PB y JSON)

OpenSpec 1.14.0 se inicializó con `openspec init --tools=codex`. Explore no es un comando CLI ni exige un archivo estándar: este registro adicional captura la exploración solicitada. La propuesta usa el esquema oficial spec-driven. Tras completarla, el encargo del usuario autoriza expresamente continuar con apply en esta misma sesión.
