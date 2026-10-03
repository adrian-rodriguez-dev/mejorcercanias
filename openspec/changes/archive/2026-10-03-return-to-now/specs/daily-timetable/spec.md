## ADDED Requirements
### Requirement: Volver a ahora sin perder trayecto
The system SHALL ofrecer un botón Ahora cuando la tabla muestre una fecha distinta de hoy. SHALL volver a próximas salidas usando la hora actual, conservando núcleo, origen, destino y líneas, con foco en la pestaña activa.
#### Scenario: Planificación futura
- **WHEN** se consulta mañana y se pulsa Ahora
- **THEN** aparecen los próximos trenes del momento actual con los mismos filtros; al reabrir la tabla se muestra hoy.
#### Scenario: Tabla de hoy
- **WHEN** la fecha coincide con hoy
- **THEN** no se reserva espacio para el botón contextual.
