# mobile-accessibility Specification

## Purpose
Mantener legibilidad, navegación y comprensión de horarios y controles con texto ampliado, teclado y tecnologías de asistencia.

## Requirements

### Requirement: Texto ampliable y reflujo
The system SHALL permitir ampliar el texto al 200 % sin perder controles ni provocar desplazamiento horizontal de la página a 360 px. La tabla de horarios podrá desplazarse dentro de una región etiquetada y accesible por teclado. SHALL conservar el diseño compacto con tamaño normal.
#### Scenario: Texto grande
- **WHEN** se duplica el tamaño de texto
- **THEN** la cabecera y controles se redistribuyen, las horas siguen legibles y el contenido no se recorta.

### Requirement: Operación por teclado y ayudas técnicas
The system SHALL ofrecer foco visible, controles táctiles de al menos 44 px, etiquetas y estados accesibles y un acceso para saltar al contenido; no anunciará repetidamente cada actualización de la cuenta atrás.
#### Scenario: Selector y navegación
- **WHEN** se usa teclado para buscar, seleccionar y borrar una estación o cambiar de vista
- **THEN** el foco permanece visible, se identifica cada control y el resultado coincide con el uso táctil.

### Requirement: Contraste de líneas
The system SHALL mantener colores oficiales y elegir texto legible de al menos 4.5:1 en los distintivos y botones de líneas, conservando una marca y estado accesible de selección además del color.
#### Scenario: Línea de fondo oscuro
- **WHEN** se presenta una línea con color oficial oscuro
- **THEN** el texto usa contraste suficiente en el chip y en el botón activo.

### Requirement: Paleta clara sobria
The system SHALL presentar fondo claro cálido, paneles verde oscuro, texto claro en el panel y acentos naranja vivo en sustitución del lima, manteniendo colores oficiales de línea y contraste accesible en panel, tabla, selectores y estados activos.
#### Scenario: Consulta en móvil
- **WHEN** se consulta el panel o tabla
- **THEN** textos, controles y foco conservan contraste y las líneas sus colores oficiales.

### Requirement: Tema oscuro seleccionable
The system SHALL ofrecer un botón de luna inmediatamente antes de la campana que activa un tema oscuro y cambia a sol para volver al claro. SHALL recordar la elección y permitir alternar aunque no esté disponible el almacenamiento.
#### Scenario: Alternancia y recarga
- **WHEN** se pulsa la luna y se recarga
- **THEN** se conserva el tema oscuro con el botón de sol, sin alterar el trayecto.
