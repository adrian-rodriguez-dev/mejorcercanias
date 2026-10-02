# station-board Specification

## Purpose
Permitir consultar las próximas salidas de la estación habitual con una sola mirada, distinguiendo siempre los datos de demostración de los horarios reales.

## Requirements

### Requirement: Elegir estación
The system SHALL ofrecer estaciones del núcleo de Bilbao y solicitar únicamente una estación en la primera visita.

#### Scenario: Primera visita
- **WHEN** no existe una estación guardada válida
- **THEN** aparece un selector con etiqueta y no se exige destino, fecha ni hora

#### Scenario: Cambio de estación
- **WHEN** se elige otra estación mientras se cargan datos
- **THEN** el panel muestra exclusivamente las salidas de la selección más reciente

### Requirement: Recordar preferencia
The system SHALL restaurar la estación elegida entre visitas y mantener la aplicación utilizable si el almacenamiento no está disponible.

#### Scenario: Regreso
- **WHEN** se abre de nuevo la aplicación con una preferencia válida
- **THEN** aparece automáticamente el panel de esa estación

#### Scenario: Preferencia inválida o almacenamiento bloqueado
- **WHEN** el identificador guardado ya no existe o leerlo falla
- **THEN** se permite elegir estación sin bloquear la aplicación
- **AND** si guardar falla, se avisa de que la elección solo dura esta visita

### Requirement: Próximas salidas
The system SHALL mostrar hasta ocho salidas no pasadas, ordenadas por instante, con línea, destino, hora Europe/Madrid y minutos restantes redondeados hacia arriba; SHALL actualizar el panel al menos cada 30 segundos y al volver a la pestaña.

#### Scenario: Cuenta atrás
- **WHEN** faltan 61 segundos para una salida
- **THEN** se muestran 2 minutos, y el tren desaparece cuando su instante ha pasado

#### Scenario: Medianoche y zona horaria
- **WHEN** una salida cruza medianoche o el dispositivo usa otro huso
- **THEN** el orden usa instantes absolutos y la hora visible sigue siendo la de Bilbao

### Requirement: Procedencia honesta
The system SHALL identificar siempre los horarios ficticios como demostración no válida para viajar y SHALL evitar afirmar puntualidad o tiempo real sin datos que lo acrediten.

#### Scenario: Demo
- **WHEN** se muestra cualquier salida del proveedor de demostración
- **THEN** el aviso de horarios ficticios permanece visible junto al panel

### Requirement: Estados recuperables
The system SHALL mostrar carga, error con reintento y ausencia de próximas salidas de forma explícita.

#### Scenario: Error de lectura
- **WHEN** falla la carga de datos
- **THEN** aparece un mensaje y un botón para reintentar sin perder la estación

#### Scenario: Sin salidas
- **WHEN** no quedan salidas futuras
- **THEN** aparece un mensaje de ausencia de próximas salidas sin inventar trenes

### Requirement: Acceso móvil y teclado
The system SHALL mantener los controles utilizables con teclado y el contenido legible a 360 píxeles de ancho sin desplazamiento horizontal.

#### Scenario: Pantalla estrecha
- **WHEN** se abre el panel en un móvil de 360 píxeles
- **THEN** se ven línea, destino, hora y cuenta atrás, y el selector conserva su etiqueta y foco visible
