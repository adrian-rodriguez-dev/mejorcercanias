# app-installation Specification

## Purpose
Permitir instalar mejorcercanías y abrir el panel desde la pantalla de inicio sin interrumpir la consulta de trenes.

## Requirements

### Requirement: Identidad instalable
The system SHALL ofrecer manifiesto e iconos válidos, identidad estable y apertura standalone en navegadores compatibles, con recursos y URL inicial dentro del ámbito publicado.
#### Scenario: Lanzamiento instalado
- **WHEN** se abre el icono instalado con conexión
- **THEN** se carga la aplicación sin navegador local y se restaura la favorita si está disponible en ese contexto de almacenamiento.
#### Scenario: Subcarpeta pública
- **WHEN** se instala desde GitHub Pages bajo /mejorcercanias/
- **THEN** el inicio y todos sus recursos se resuelven dentro de esa subcarpeta.

### Requirement: Invitación no intrusiva
The system SHALL mostrar una invitación verde compacta justo después de la cabecera, con texto legible, botón Instalar y cierre de al menos 44 px. SHALL conservar el logo móvil, no duplicar la invitación al pie y no abrir ningún diálogo automáticamente.
#### Scenario: Primera consulta compatible
- **WHEN** se abre la web a 360 px sin descarte ni instalación detectada
- **THEN** aparece una sola fila verde bajo la cabecera, con logo visible y sin desbordamiento; Instalar abre diálogo nativo disponible o ayuda manual.
#### Scenario: Rechazo
- **WHEN** se pulsa el cierre o se descarta el diálogo nativo
- **THEN** el aviso se oculta durante 30 días y sigue disponible la ayuda manual del pie.
#### Scenario: Almacenamiento bloqueado
- **WHEN** no se puede guardar el rechazo
- **THEN** no falla el panel y la invitación se mantiene oculta al menos durante la sesión actual de la página.

### Requirement: Instalación según capacidades
The system SHALL usar el diálogo nativo únicamente tras un gesto explícito y un evento disponible; SHALL ofrecer instrucciones manuales cuando corresponda y nunca afirmar que la app se ha instalado sin evidencia.
#### Scenario: Instalación nativa
- **WHEN** se pulsa Instalar con un evento nativo pendiente
- **THEN** se invoca una sola vez, se deshabilitan pulsaciones duplicadas y no se reutiliza ese evento.
#### Scenario: iPhone o iPad
- **WHEN** se solicita instalación en un navegador iOS compatible sin diálogo programático
- **THEN** se muestra una guía de Compartir y Añadir a pantalla de inicio que se puede cerrar, sin simular un diálogo nativo.
#### Scenario: Navegador sin soporte detectable
- **WHEN** no hay evento nativo ni guía aplicable
- **THEN** el botón Instalar del aviso abre ayuda que explica la compatibilidad sin afirmar instalación directa.

### Requirement: Supresión tras instalación
The system SHALL ocultar la invitación en modo standalone y al recibir confirmación de instalación en la sesión; no solicitará permisos de notificación ni anunciará funcionamiento offline.
#### Scenario: App ya abierta como instalada
- **WHEN** el contexto indica modo standalone o instalación confirmada
- **THEN** no aparece la invitación ni se vuelve a solicitar instalación en esa sesión.
#### Scenario: Comprobación no disponible
- **WHEN** se abre una pestaña y no se puede detectar si existe una instalación externa
- **THEN** se respetan los rechazos guardados sin afirmar que la aplicación no está instalada.
