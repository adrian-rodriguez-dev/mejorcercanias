# Design
## Context
Vite ya usa base relativa y el proveedor construye URLs con BASE_URL. CI comprueba lógica, importador y navegador.
## Goals / Non-Goals
Publicar dist en Pages. Dominio propio y renovación de datos quedan fuera de este cambio.
## Decisions
Reutilizar el job check existente y subir dist al terminar las pruebas; un job dependiente despliega solamente pushes a main. Actions configure-pages v5, upload-pages-artifact v4, deploy-pages v4 según documentación oficial. Permisos pages e id-token limitados al job deploy.
## Risks / Trade-offs
Datos con caducidad → conservar aviso de vigencia y refresco manual documentado. Configuración de Pages requiere administración → habilitar con credencial existente sin mostrarla.
## Migration Plan
Habilitar Pages workflow, subir cambio y comprobar HTTPS y JSON. Revertir commit para regresar al despliegue anterior.
