# Proposal
## Why
El usuario habitual necesita abrir sus trenes desde la pantalla de inicio. La SPA actual no incluye manifiesto ni invitación de instalación.
## What Changes
- Preparar la aplicación como PWA instalable con nombre, iconos y apertura independiente.
- Invitación compacta «Instala mejorcercanías» con acciones Instalar y Ahora no, después de consultar la primera estación.
- Diálogo nativo si está disponible; guía manual para iPhone/iPad y ayuda para otros navegadores.
- Ocultar en modo instalado y recordar el rechazo durante 30 días.
- Acceso manual a instalación desde el pie, sin bloquear el panel.
Fuera de alcance: caché offline de horarios, notificaciones push, tiendas y backend. No se prometerá uso sin conexión.
## Capabilities
### New Capabilities
- `app-installation`: instalación opcional y promoción contextual respetuosa.
### Modified Capabilities
Ninguna. Se mantienen los requisitos móviles y de procedencia de station-board.
## Impact
Manifiesto, iconos, index.html, componente de invitación y estado de instalación, pruebas y README. Compatible con GitHub Pages bajo /mejorcercanias/. `pwa-basic-offline` queda como propuesta posterior independiente.
