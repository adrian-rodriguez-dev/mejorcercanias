## ADDED Requirements
### Requirement: Acceso compacto desde cabecera
The system SHALL ofrecer en la barra superior un botón con icono de instalación y texto Instalar, área táctil de al menos 44 px y nombre accesible Instalar app. SHALL abrir la instalación disponible o su ayuda manual, incluso tras descartar la invitación, y ocultarse en modo standalone o tras appinstalled.
#### Scenario: Instalación desde arriba
- **WHEN** se pulsa el acceso con evento nativo disponible
- **THEN** se solicita instalación una sola vez mediante ese evento.
#### Scenario: Ayuda sin evento nativo
- **WHEN** se pulsa el acceso sin evento nativo
- **THEN** aparece ayuda modal según plataforma, se puede cerrar con botón o Escape y el foco vuelve al acceso.
#### Scenario: Pantalla móvil
- **WHEN** se consulta a 360 px de ancho
- **THEN** el acceso cabe en cabecera sin desbordamiento horizontal ni tapar los controles.
## MODIFIED Requirements
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
- **THEN** no se muestra una invitación automática; el acceso manual Instalar abre ayuda que explica la compatibilidad sin afirmar instalación directa.
