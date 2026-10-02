# Design
## Context
El importador actual descarga ZIP y escribe JSON versionado por SHA256. downloadedAt se asigna al procesar, incluso con --zip: no es una marca fiable de consulta a Renfe. El proveedor y catálogo importan el manifiesto en build; una pestaña abierta no descubre versiones nuevas. CI solo responde a push/PR y publica dist tras pruebas. Las pruebas usan octubre de 2026: no deben depender del dataset renovable de producción.
## Goals / Non-Goals
**Goals:** renovación central de bajo coste y adopción segura en móvil.
**Non-Goals:** SLA exacto a las 24 horas, descarga móvil del ZIP, backend o tiempo real.
## Decisions
- Un schedule de Actions cada hora, fuera del minuto cero, comprueba edad UTC >86400 segundos; añade workflow_dispatch para forzar. La frecuencia es de comprobación, no de descarga. Fallos permiten reintentar en la siguiente ejecución. GitHub puede retrasar o suspender schedules: mostrar antigüedad y documentar recuperación manual, sin prometer un límite exacto de 24 horas.
- Registrar checkedAt solo tras descarga correcta y validación. Guardar downloadedAt del origen y publishedAt por separado. --zip conserva procedencia conocida o deja fecha desconocida; nunca usa hora actual para fingir descarga. Igual hash conserva versión y actualiza checkedAt; no regenerar datos idénticos.
- Generar en staging y validar esquema, rutas de Bilbao, referencias, secuencias y calendarios. Construir y probar antes de publicar un snapshot completo. Conservar versiones previas para clientes abiertos; definir retención acotada (mínimo 7 días y versión anterior) y recuperación ante 404 de una versión retirada.
- Mantener metadatos y snapshot aceptado versionados en main para que futuros despliegues de código no reviertan los datos. Commit del bot limitado a archivos generados después de validar; nunca force-push ni sobreescribir cambios concurrentes. Si main avanzó, abortar y reintentar sobre la nueva revisión. Usar workflow reutilizable de validación/publicación invocado explícitamente tras actualización: un push con GITHUB_TOKEN no debe ser la única forma de disparar despliegue.
- Serializar despliegues de código/datos con el mismo grupo Pages y comprobar que la revisión a publicar sigue siendo actual antes de desplegar. Un fallo tras commit no se considera publicación correcta; mantener dist publicado anterior y permitir reintento.
- Publicar pequeño current.json con esquema, versión, checkedAt y URL del manifiesto versionado. Cliente lo revalida por red (no caché permanente) al abrir, reanudar y cada hora visible. Fallos con backoff mínimo de cinco minutos para evitar ráfagas. Sin nuevas credenciales en el cliente.
- Extraer dependencia de manifiesto embebido a un snapshot activo único de catálogo/calendarios/JSON. Preparar nueva versión completa y cambiarla de una vez, preservando filtros. Usar la versión embebida como arranque/fallback; rechazar esquemas incompatibles. Si IDs desaparecen, explicar y pedir selección, no inventarla.
- Pruebas funcionales con fixtures deterministas independientes de datos vivos; añadir smoke de validez/cobertura al snapshot descargado sin afirmar que siempre hay servicios todos los días.
## Risks / Trade-offs
Renfe caído → conservar última versión y marca antigua. Datos recientes pero cobertura agotada → mantener no publicado. GitHub puede retrasar schedule o deshabilitarlo por inactividad → aviso de antigüedad y procedimiento de reactivación. Cliente con caché futura PWA → excluir current.json de caché permanente en la spec offline.
## Migration Plan
Introducir contrato de metadatos y tests, migrar proveedor, habilitar workflow y ejecutar manualmente una renovación. Probar fallo controlado y rollback antes de dar automatización por terminada.
## Referencia
https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule (consultado 2026-10-02).
