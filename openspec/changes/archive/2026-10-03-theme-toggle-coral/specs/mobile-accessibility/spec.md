## MODIFIED Requirements
### Requirement: Paleta clara sobria
The system SHALL presentar fondo blanco cálido, paneles blancos, texto carbón y acentos coral profundo en el tema claro, manteniendo colores oficiales de línea y contraste accesible en panel, tabla, selectores y estados activos.
#### Scenario: Consulta en móvil
- **WHEN** se consulta el panel o tabla
- **THEN** textos, controles y foco conservan contraste y las líneas sus colores oficiales.
## ADDED Requirements
### Requirement: Tema oscuro seleccionable
The system SHALL ofrecer un botón de luna inmediatamente antes de la campana que activa un tema oscuro y cambia a sol para volver al claro. SHALL recordar la elección y permitir alternar aunque no esté disponible el almacenamiento.
#### Scenario: Alternancia y recarga
- **WHEN** se pulsa la luna y se recarga
- **THEN** se conserva el tema oscuro con el botón de sol, sin alterar el trayecto.
