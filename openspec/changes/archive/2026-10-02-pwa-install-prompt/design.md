# Design
## Context
React/Vite con base ./, theme-color e icon.svg. index.html no tiene manifiesto y main.tsx no registra service worker. Publicación HTTPS ya operativa. La estación favorita usa localStorage; la cabecera compacta y próximos trenes deben conservar su prioridad visual.
## Goals / Non-Goals
**Goals:** instalación y acceso recurrente con una invitación discreta.
**Non-Goals:** horarios offline, caché del GTFS, push o cuentas. Instalar no garantiza compartir localStorage entre navegador y app independiente.
## Decisions
- Manifiesto con id estable, start_url y scope relativos al despliegue, display standalone, colores existentes e iconos PNG 192/512 y apple-touch-icon 180 derivados del icono actual. Verificar fondo y zona segura; añadir icono maskable independiente si se declara.
- Componente de instalación bajo el listado, integrado en el panel, con ayuda discreta en el pie. Se muestra al tener estación cargada, nunca sobre los trenes ni durante error/carga. No usar banners fijos ni ventanas automáticas.
- Detección de beforeinstallprompt en raíz desde el arranque; guardar evento temporal en memoria y consumirlo solo tras click. appinstalled y display-mode standalone actualizan visibilidad; navigator.standalone para compatibilidad iOS.
- El cierre o descarte escribe un plazo de 30 días en una clave local independiente. Si falla el almacenamiento, estado de sesión en memoria. Cambiar estación o vista no reactiva el aviso. La ayuda manual ignora el plazo, porque la invoca el usuario.
- Guía iOS mediante Compartir → Añadir a pantalla de inicio; detectar contexto iPhone/iPad incluyendo iPadOS cuando sea razonable, sin usar detección de navegador como sustituto de capacidades. En navegadores integrados indicar abrir en un navegador compatible.
- No añadir un service worker solo para aparentar soporte offline: no es requisito universal de instalación. Si la matriz objetivo exige uno, limitarlo a pantalla de desconexión explícita y documentar la necesidad antes de ampliar alcance; no cachear datos de horarios en esta propuesta.
## Risks / Trade-offs
API de instalación no universal → evento como capacidad y guía manual. No siempre se detecta una instalación desde una pestaña → ocultar cuando se sabe y no prometer detección global. Rutas de Pages → probar build bajo subcarpeta. Simular eventos no acredita instalación real → prueba manual en Android e iOS antes de declarar compatibilidad verificada.
## Migration Plan
Desplegar manifiesto y componente juntos mediante CI existente. Comprobar iconos, ámbito e inicio en URL pública. Revertir commit si falla; no introducir caché persistente que retenga una versión antigua.
## Referencias verificadas
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt
Consulta: 2026-10-02.
