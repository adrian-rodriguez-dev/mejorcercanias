# Spec Delta
## ADDED Requirements
### Requirement: Panel sin cabecera redundante
The system SHALL comenzar el panel oscuro directamente por los controles de trayecto, sin fila de título de vista, reloj actual ni espacio reservado para ellos. SHALL conservar las pestañas, horas de salida/llegada y cuenta atrás automática.
#### Scenario: Ambas vistas
- **WHEN** se consulta próximos trenes o el horario diario a 360 px o escritorio
- **THEN** no aparece la fila PRÓXIMAS SALIDAS/HORARIO COMPLETO ni Hora de Bilbao y las pestañas siguen cambiando de vista.
#### Scenario: Paso del tiempo
- **WHEN** transcurre el tiempo o se regresa a la app
- **THEN** la cuenta atrás se actualiza y las horas de los trenes siguen expresadas en Europe/Madrid.
