# Hoja de ruta

Estado del código revisado el 3 de octubre de 2026. No equivale al estado de la web publicada.

## Implementado

Horarios GTFS por fecha, diez redes con vigencia independiente, origen/destino, rutas hasta tres transbordos y detalle de etapas, caché de resultados, instalación, datos offline, renovación automática por caducidad, actualización voluntaria de app, tema claro/oscuro y controles de accesibilidad automatizados.

## Pendiente

| Área                | Trabajo y criterio de cierre                                                                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Incidencias en vivo | Desplegar pasarela, configurar ALERTS_URL y verificar CORS, frescura y retirada de avisos desde producción. Ampliar identificación de rutas más allá del mapeo actual de Bilbao. No cerrar compact-service-alerts antes de ello. |
| Cobertura           | Incorporar Asturias y revisar redes excluidas cuando haya datos válidos. No relajar secuencias por conveniencia.                                                                                                                 |
| Mapas               | Integrar como pipeline reproducible la investigación PDF/SVG con revisión de evidencia y salida de conexiones; actualmente se consume configuración revisada.                                                                    |
| Rendimiento         | Medir descarga/clonado de grafos grandes en móviles; acotar caché de grafos en memoria.                                                                                                                                          |
| Mantenimiento       | Dividir App y CSS cuando se aborden sus áreas; formato/lint Python y reglas de hooks, esquema de datos compartido.                                                                                                               |
| Operación           | Definir responsables y avisos de fallos; revisar protección de main y bot; fijar acciones por SHA; decidir licencia general del código.                                                                                          |
| Compatibilidad      | Pruebas reales de instalación, Safari/iOS y lectores de pantalla.                                                                                                                                                                |

Cada nueva funcionalidad debe tener propuesta y pruebas de aceptación. Consultar [revisión de calidad](quality-review.md) y [gobierno](governance.md) antes de priorizar.
