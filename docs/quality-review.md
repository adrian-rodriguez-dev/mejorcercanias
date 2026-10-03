# Revisión de calidad — 3 de octubre de 2026

Revisión de estructura, fronteras entre módulos, validación de datos, herramientas, workflows y documentación. No es una certificación, auditoría de seguridad completa ni comprobación de los permisos remotos de GitHub.

## Corregido

| Hallazgo                                                                                                   | Resultado                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Componentes, composición y servicios del navegador mezclados en src                                        | Separados en app, components, platform y styles; imports y pruebas actualizados. Gate de dependencias estáticas entre capas. |
| Sin control de formato en CI; scripts de formato alcanzaban JSON generado                                  | Prettier en check, ignore explícito, editorconfig y normalización de fuentes/herramientas.                                   |
| Configuración offline fuera del alcance explícito de TypeScript; import de configuración ambiguo para Node | Configuraciones/build incluidos en tsc, extensión explícita y compilación verificada.                                        |
| JSON con elementos nulos podía romper validadores de catálogo/grafo                                        | Validación defensiva antes de acceso anidado y regresiones para entradas malformadas. Validador de grafo separado de E/S.    |
| Refresco horario publicaba incluso sin cambios                                                             | Detección de cambios y omisión del trabajo posterior; Validate manual permite recuperación sin cambiar datos.                |
| Trazas de navegador se perdían al finalizar Actions                                                        | Informes separados y artefactos con siete días de retención; preview descargable para revisiones que no publican.            |
| README y guías afirmaban Bilbao solamente, refresco manual o funcionalidades pendientes ya implementadas   | README reescrito, índice de docs y guías de arquitectura, calidad, artefactos, operación y gobierno.                         |

## Deuda que permanece

- App concentra estado y efectos; CSS contiene bloques acumulados. Están localizados, pero aún requieren descomposición gradual con pruebas visuales; moverlos no elimina esa complejidad.
- Caché de grafos en memoria sin límite explícito; grafos grandes se clonan al worker. La LRU de resultados y la retención offline sí están acotadas.
- Validación de contratos duplicada en Python/TypeScript. No hay esquema compartido ni validación exhaustiva de toda combinación semántica en el cliente.
- Python conserva estilo compacto y no tiene gate de formato/lint; no se han instalado herramientas nuevas en esta revisión. Tampoco hay ESLint con reglas de hooks.
- Acciones fijadas a versiones mayores, permisos de flujos mejorables por separación de responsabilidades; ajustes remotos y monitorización no verificados.
- Pasarela de avisos preparada sin integración en vivo confirmada; catálogo incompleto y exclusiones auditadas. Ver hoja de ruta.
- Las suites usan Chromium y fixtures donde corresponde; no acreditan horarios reales de hoy ni pruebas en móviles físicos.

## Verificación

Comprobaciones locales completadas:

- 73 pruebas unitarias de TypeScript/React.
- 46 pruebas e2e en proyectos desktop y mobile.
- 5 pruebas de producción/offline, incluyendo rutas de Madrid y Rodalies.
- 14 pruebas Python del pipeline y 1 prueba de la pasarela.
- TypeScript, build de producción y validación estricta de OpenSpec.
- Gate de arquitectura comprobado tanto con el código real como con imports/reexports prohibidos temporales; estos últimos se rechazan.
- Sintaxis YAML de los tres workflows y enlaces relativos de README/docs comprobados.

Los nuevos workflows se revisan localmente, pero su ejecución real en GitHub requiere subir la revisión. No se ha publicado ni modificado configuración remota. Los avisos informativos existentes de OpenSpec sobre requisitos largos no bloquean la validación.
