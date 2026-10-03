# Manual de operación

Todos los comandos se ejecutan en la raíz del repositorio. Distinguir tres estados: archivos locales, revisión de main y revisión desplegada en Pages. Un commit local no publica nada.

## Publicar código

1. Abrir/revisar el cambio y esperar todos los checks de CI. Comprobar también vigencia del manifiesto.
2. Integrar a main. El push activa Validate y publica tras todas las pruebas.
3. En Actions, confirmar éxito del job deploy y URL del entorno github-pages. Anotar SHA y ejecución.
4. Abrir la web, aceptar Actualizar si aparece y probar un trayecto directo y uno con transbordo, horarios y tema. Revisar una consulta offline ya guardada.

Para republicar main sin tocar datos: Actions → Validate → Run workflow → main. Una build genera una nueva versión de app. No reutilizar indefinidamente un dist descargado: puede contener horarios caducados.

## Renovar horarios

Normalmente basta el refresco automático por caducidad. Para comprobar Renfe antes de caducar: Actions → Refresh GTFS → Run workflow → force=true.

Equivalente local para preparar un candidato, sin push ni publicación:

```sh
python scripts/refresh_gtfs.py --force
python -m unittest discover -s scripts -p 'test_*.py'
npm run check
npm run test:worker
npm run test:e2e
npm run test:offline
git diff --stat
```

Revisar redes conservadas, coverageDates por red, excludedNetworks/excludedTrips, hashes, grafos y current.json. No alargar validTo a mano. No corregir horarios en JSON generado: cambiar la fuente/configuración o rechazar el candidato. [Detalles del pipeline](gtfs-import.md).

## Diagnóstico y recuperación

| Síntoma                                    | Comprobar                                                           | Actuación                                                                                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Horarios caducados                         | Última ejecución Refresh, cobertura por red, fuente descargada      | Forzar refresco. Si Renfe no cubre hoy o falla validación, mantener el anterior y el aviso; no extrapolar.                                               |
| Refresh no publica                         | Resumen de cambios y estado de main                                 | Si no hay cambios es normal. Para recuperar un deploy fallido, ejecutar Validate manualmente sobre main.                                                 |
| Push del bot rechazado                     | Log, avance de main y protección de rama                            | Reejecutar refresco sobre main actual; si es protección, resolver el modelo de permisos. Nunca force push.                                               |
| Pruebas de navegador fallan                | Artefacto browser-diagnostics o refresh-diagnostics                 | Abrir informe HTML y traza; reproducir con el mismo SHA y fixtures.                                                                                      |
| Datos correctos en main pero sitio antiguo | Job deploy y control de revisión obsoleta                           | Publicar main actual. No cambiar datos solo para provocar un deploy.                                                                                     |
| Solo un navegador ve datos antiguos        | Versión de app, current.json, conectividad, actualización pendiente | Recuperar conexión y usar Actualizar. Cerrar pestañas antiguas. Borrar almacenamiento solo como último recurso: elimina preferencias y horarios offline. |
| No calcula un trayecto                     | Red, cobertura, JSON routing y reglas de transbordo                 | Confirmar que hay servicio, subidas/bajadas permitidas y enlace documentado. No insertar excepciones en JSX.                                             |
| Campana neutra                             | Variable ALERTS_URL, CORS y timestamp                               | Una campana neutra no acredita ausencia de incidencias. Ver guía de pasarela.                                                                            |
| 404 de un JSON antiguo                     | Versiones retenidas, current.json y caché                           | Actualizar snapshot/app; restaurar archivos de la versión si aún deben servirse.                                                                         |

## Volver a una versión anterior

**Código:** revertir el commit causante mediante un cambio revisado y publicar una nueva revisión de main. No resetear ni forzar historial. Mantener datos vigentes al revertir un refactor.

**Datos:** conservar las carpetas versionadas todavía utilizadas. Recuperar manifiesto y JSON coherentes desde Git; comprobar si su cobertura sirve hoy. El cliente compara publishedAt, por lo que restaurar solo un puntero antiguo puede no hacer que adopte el rollback. Tras restaurar un conjunto coherente, `python scripts/refresh_gtfs.py --bootstrap` vuelve a generar metadatos con una marca actual; **no descarga ni valida la vigencia del GTFS**. Ejecutar validaciones, build y suites antes de publicar. Si también es necesario recuperar un grafo ya retenido en memoria del navegador, actualizar/recargar la app.

Un rollback de datos debe revisar si el próximo refresco volverá a introducir el mismo defecto; suspender temporalmente el workflow desde Actions solo como intervención explícita del responsable, registrar motivo y reactivarlo tras corregirlo.

## Pasarela de incidencias

Ver [service-alerts.md](service-alerts.md). El repo prepara un Worker Cloudflare; no hay despliegue automático de ese worker en estos workflows. GET /alerts reenvía solo el endpoint fijo de Renfe con timeout de 8 segundos, límite de 512 KiB y CORS para los orígenes configurados. Añadir un dominio exige revisar la lista permitida y volver a desplegar. No meter tokens Cloudflare en VITE_ALERTS_URL.

## Rutina operativa

- Tras publicar: SHA/ejecución, smoke test, vigencia y errores de red.
- Revisar fallos de renovación cuando ocurran; una red de cobertura corta puede bloquear toda la renovación.
- Antes de ampliar catálogo: comprobar tamaños de grafo y tiempos de cálculo en móvil.
- Periódicamente: dependencias/lock, permisos, retención de datos, accesibilidad y funcionamiento instalado en dispositivos reales.

No hay monitor externo ni alertas operativas propias configuradas. Los logs de Actions y sus notificaciones son la evidencia disponible; decidir un responsable que las reciba.
