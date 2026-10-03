# Spec Delta
## MODIFIED Requirements
### Requirement: Próximas salidas
The system SHALL mostrar hasta ocho salidas no pasadas, ordenadas por instante, con línea, destino, hora Europe/Madrid y minutos restantes redondeados hacia arriba cuando falten menos de 60 minutos, u hora de salida grande cuando falten 60 minutos o más; SHALL actualizar el panel al menos cada 30 segundos y al volver a la pestaña.

#### Scenario: Cuenta atrás
- **WHEN** faltan 61 segundos para una salida
- **THEN** se muestran 2 minutos, y el tren desaparece cuando su instante ha pasado

#### Scenario: Medianoche y zona horaria
- **WHEN** una salida cruza medianoche o el dispositivo usa otro huso
- **THEN** el orden usa instantes absolutos y la hora visible sigue siendo la de Bilbao

#### Scenario: Salida lejana y transición
- **WHEN** faltan al menos 60 minutos
- **THEN** se muestra HH:mm grande de salida sin sufijo min, en Europe/Madrid
- **AND** al bajar de 60 minutos vuelve automáticamente la cuenta atrás

## ADDED Requirements
### Requirement: Filas compactas y legibles
The system SHALL reducir el espacio superior e inferior de cada tren y aumentar la letra de estación y horas de salida y llegada, tanto en próximas salidas como en horario completo, sin truncar nombres ni desbordar a 360 px.
#### Scenario: Destino seleccionado
- **WHEN** se muestran salida y llegada en móvil
- **THEN** ambas horas y el destino son legibles, con filas ajustadas al contenido y sin espacio vertical sobrante.
