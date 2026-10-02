# Spec Delta
## ADDED Requirements
### Requirement: Horas compactas bajo destino
The system SHALL mostrar salida y llegada debajo del nombre del destino en próximas salidas, con etiquetas inequívocas, sin columna horaria separada ni texto repetido Próximo tren/Hoy/Programado. SHALL mantener cuenta atrás a la derecha y distinguir salidas de otro día y llegadas al día siguiente. Sin destino elegido SHALL mostrar solo salida.
#### Scenario: Destino elegido
- **WHEN** un tren tiene llegada al destino seleccionado
- **THEN** se muestran Salida HH:mm y Llegada HH:mm bajo su nombre, sin desbordar 360 px.
#### Scenario: Sin destino y medianoche
- **WHEN** no hay destino elegido o el tren cruza medianoche
- **THEN** no se reserva espacio de llegada ausente y se conserva la indicación de día necesaria.
