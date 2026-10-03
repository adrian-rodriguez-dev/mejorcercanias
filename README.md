# mejorcercanías

Horarios oficiales de Renfe y cálculo de rutas con hasta tres transbordos. Aplicación estática React + TypeScript + Vite, instalable y con consulta offline de datos guardados.

[Web pública](https://adrian-rodriguez-dev.github.io/mejorcercanias/) · [Manual de mantenimiento y operación](docs/README.md)

## Arrancar

Node 24 (ver `.nvmrc`) y npm. Desde la raíz del repositorio:

```sh
npm ci
npm run dev
```

Vite indica la URL local. No se necesitan base de datos, cuentas ni claves para consultar horarios. Python 3.12+ se necesita para el pipeline y sus pruebas.

```sh
npm run check
python -m unittest discover -s scripts -p 'test_*.py'
npm run test:worker
npx playwright install chromium
npm run test:e2e
npm run test:offline
```

`check` comprueba formato, dependencias entre capas, pruebas unitarias, tipos, build y OpenSpec. La suite offline utiliza el `dist/` producido por el build. [Guía de desarrollo](docs/development.md).

## Qué hace

- Origen y destino opcional, próximos trenes y horario completo por fecha.
- Con destino: llegada final, número de cambios y detalle desplegable de trenes, esperas y caminatas documentadas. El filtro de líneas se aplica al primer tren.
- Sin destino: salidas y llegada a la terminal real de cada tren.
- Catálogo de diez redes en el snapshot revisado el 3 de octubre de 2026, incluyendo Madrid y Rodalies. La vigencia y las exclusiones se consultan por red en el manifiesto; no son constantes del producto.
- Preferencias locales, modo oscuro, instalación y recuperación offline de archivos consultados.

Son horarios programados, sin garantía de puntualidad. El minuto para cambios dentro del mismo punto y los diez minutos de ciertos enlaces peatonales son estimaciones; las reglas explícitas de GTFS prevalecen. No se inventan conexiones por proximidad. Los avisos no modifican las rutas. La integración en vivo de incidencias sigue pendiente: [estado y activación](docs/service-alerts.md).

## Mantener y publicar

La CI valida pushes y pull requests. Un push válido a `main` publica en Pages; un PR genera un artefacto de previsualización. `Refresh GTFS` comprueba cobertura cada hora y renueva cuando caduca una red, conservando el snapshot previo ante errores. Un refresco sin cambios no publica. [Actions y artefactos](docs/actions.md) · [Operación y recuperación](docs/operations.md).

Las nuevas funcionalidades se describen con OpenSpec antes de implementar; los refactors y herramientas sin cambio de requisitos pueden declarar `skip_specs`. [Convenciones y decisiones](docs/governance.md).

## Fuentes y licencias

GTFS de Renfe Operadora, CC BY 4.0, transformado para esta aplicación independiente. El motor adapta lógica de renfe-cli bajo BSD-3-Clause; atribución en `public/licenses/renfe-cli.txt`. [Contrato y procedencia](docs/data-contract.md). No se ha definido una licencia general para todo el código de la aplicación.
