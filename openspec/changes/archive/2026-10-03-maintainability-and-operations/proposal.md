## Why
La estructura plana y la documentación acumulada dificultan mantener la aplicación y recuperar publicaciones. Faltan controles de formato y artefactos de diagnóstico en CI.

## What Changes
- Separar composición, componentes y servicios de navegador sin cambiar la interfaz.
- Reforzar validación de JSON malformado y controles reproducibles de calidad.
- Evitar publicaciones sin cambios en el refresco programado y conservar diagnósticos.
- Documentar arquitectura, datos, automatizaciones y gobierno operativo.

## Capabilities
Sin cambios de comportamiento del producto: refactor, correcciones defensivas, herramientas y documentación. Se usa skip_specs.

## Impact
src, configuración TypeScript/Prettier, workflows, pruebas y docs. Sin dependencias nuevas ni cambios de contrato de datos.
