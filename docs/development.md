# Desarrollo y calidad

## Entorno reproducible

Usar Node 24 (`.nvmrc`), npm con `package-lock.json`, Python 3.12+ y Chromium de Playwright. `npm ci` instala las versiones del lock; no sustituirlo por una actualización indiscriminada de dependencias. Los scripts Python solo utilizan biblioteca estándar.

```sh
npm ci
npm run dev
npx playwright install chromium
```

En Linux CI se usa `npx playwright install --with-deps chromium`. En Windows no se necesita activar Bash para los comandos de desarrollo; los bloques `run` de Actions sí se ejecutan en Bash sobre Ubuntu.

## Puertas de calidad

| Comando                                                 | Comprueba                                                                                           |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `npm run format:check`                                  | Formato consistente de TS/TSX/CSS/JS, documentos y configuración.                                   |
| `npm run check:architecture`                            | Imports estáticos entre capas y ausencia de React en datos.                                         |
| `npm test`                                              | Calendarios, rutas, validadores, cachés, preferencias y componentes.                                |
| `npm run build`                                         | TypeScript estricto sin emisión y build de producción Vite.                                         |
| `npm run check`                                         | Formato + arquitectura + unitarias + build + OpenSpec estricto.                                     |
| `python -m unittest discover -s scripts -p 'test_*.py'` | Importación, redes, grafo y renovación de datos.                                                    |
| `npm run test:worker`                                   | Pasarela de avisos sin depender de Renfe en vivo.                                                   |
| `npm run test:e2e`                                      | UI, teclado, accesibilidad, persistencia, rutas y estados en desktop/mobile con fixtures.           |
| `npm run test:offline`                                  | Build real en subcarpeta, service worker, caché, reapertura y actualización. Requiere build previo. |

`npm run format` corrige formato. `.prettierignore` excluye el manifiesto generado, fixtures, datos públicos, lock e historial OpenSpec. No reformatear masivamente JSON de horarios: rompe la compacidad y dificulta revisar cambios reales. Python no tiene aún formateador/linter automático; sigue sujeto a revisión y pruebas.

Las suites de navegador usan puertos 4173 y 4176. Cerrar procesos antiguos en esos puertos si no corresponden a la revisión actual. El modo e2e sustituye el manifiesto y responde con fixtures; producción nunca debe construirse con ese modo. Los proyectos desktop/mobile son ambos Chromium, no una prueba de Safari/iOS real.

Informes: `playwright-report/e2e/` y `playwright-report/offline/`. Trazas de fallos: `test-results/<suite>/`. Para abrir un informe: `npx playwright show-report playwright-report/e2e`.

## Convenciones

- Componentes y tipos con nombres explícitos; funciones y módulos pequeños cuando tengan una responsabilidad separable.
- Tipar entradas externas como `unknown` y validarlas antes de acceder, almacenar o ejecutar. Una aserción `as` no valida JSON.
- Mantener calendario y reglas de transbordo en datos/motor, nunca en JSX por nombre de estación.
- Cancelar peticiones y cálculos al cambiar selección; evitar que respuestas antiguas sustituyan resultados nuevos.
- Añadir pruebas de regresión para defectos y casos de dominio, no pruebas que copien la implementación.
- Estilos en `src/styles/`; conservar colores de líneas oficiales y comprobar contraste en ambos temas.
- Capturar errores solo cuando exista una política explícita: fallback offline, aviso o rechazo del candidato. No ocultar fallos del importador.
- No incluir secretos en variables `VITE_*`: se incorporan al JavaScript público.

TypeScript está en modo estricto, con variables/parámetros no usados rechazados. No se ha añadido ESLint: el gate actual no promete detectar todas las reglas de hooks ni todos los problemas de complejidad. [Deuda concreta](quality-review.md).

## Revisión de cambios

Una corrección pequeña debe pasar las pruebas relevantes y `check`. Antes de integrar a main, CI ejecuta también Python, worker, navegador y offline. Revisar por separado cambios funcionales, movimientos de archivos y formato; Git puede mostrar renombrados. Usar `git diff --check` y evitar mezclar datos generados nuevos con un refactor si no son necesarios.

Para comparar rendimiento del router: `node --experimental-strip-types scripts/benchmark-routing.mjs`. Requiere el commit base e867f10 y los datos locales esperados; genera resultados en `work/`. No es un benchmark universal ni una puerta de CI.
