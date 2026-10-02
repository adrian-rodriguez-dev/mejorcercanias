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
The system SHALL identificar siempre los horarios ficticios como demostración no válida para viajar, identificar los oficiales como horarios programados de Renfe y SHALL evitar afirmar puntualidad o tiempo real sin datos que lo acrediten.
#### Scenario: Demo
- **WHEN** se muestra cualquier salida del proveedor de demostración
- **THEN** el aviso de horarios ficticios permanece visible junto al panel
#### Scenario: Horario oficial
- **WHEN** se usa el proveedor GTFS oficial
- **THEN** se muestra atribución Renfe, vigencia y ausencia de datos de retrasos en tiempo real

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

### Requirement: Migración de favoritas
The system SHALL conservar las cinco preferencias de la demo asignándolas a las estaciones oficiales correspondientes.
#### Scenario: Favorita anterior
- **WHEN** existe demo-barakaldo como preferencia
- **THEN** se abre Desertu-Barakaldo con el identificador oficial y el panel de próximas salidas

### Requirement: Cabecera editable única
The system SHALL mostrar el origen como selector principal dentro del único panel oscuro, sin tarjeta externa ni título duplicado, junto a un destino opcional. Ambos controles SHALL tener etiquetas accesibles y tamaño táctil mínimo de 44 px.
#### Scenario: Primera visita y estación guardada
- **WHEN** se abre la aplicación con o sin estación guardada
- **THEN** la selección se realiza en el propio panel, sin exigir destino y sin desplazamiento horizontal a 360 px.

### Requirement: Intercambio de trayecto
The system SHALL permitir invertir origen y destino cuando ambos están elegidos y son distintos, actualizar las salidas automáticamente y guardar el nuevo origen, conservando vista, fecha, hora y línea.
#### Scenario: Viaje de vuelta
- **WHEN** se invierte Santurtzi a Bilbao-Abando
- **THEN** origen pasa a Bilbao-Abando y destino a Santurtzi, y solo se muestran horarios correspondientes al nuevo trayecto.
#### Scenario: Destino vacío
- **WHEN** no hay destino seleccionado
- **THEN** el botón de intercambio está deshabilitado y se muestran salidas del origen sin filtro de destino.
#### Scenario: Intercambio durante carga o sin servicio
- **WHEN** se intercambia durante una carga o el trayecto inverso carece de servicios
- **THEN** ninguna respuesta anterior sustituye el nuevo trayecto y se muestra carga, error o ausencia de trenes según corresponda.

### Requirement: Panel sin cabecera redundante
The system SHALL comenzar el panel oscuro directamente por los controles de trayecto, sin fila de título de vista, reloj actual ni espacio reservado para ellos. SHALL conservar las pestañas, horas de salida/llegada y cuenta atrás automática.
#### Scenario: Ambas vistas
- **WHEN** se consulta próximos trenes o el horario diario a 360 px o escritorio
- **THEN** no aparece la fila PRÓXIMAS SALIDAS/HORARIO COMPLETO ni Hora de Bilbao y las pestañas siguen cambiando de vista.
#### Scenario: Paso del tiempo
- **WHEN** transcurre el tiempo o se regresa a la app
- **THEN** la cuenta atrás se actualiza y las horas de los trenes siguen expresadas en Europe/Madrid.

### Requirement: Hora de llegada al destino seleccionado
The system SHALL mostrar la hora programada de salida y de llegada a la estación elegida cuando exista destino, con etiquetas inequívocas y hora Europe/Madrid. Sin destino SHALL ocultar llegada y su espacio. SHALL indicar si la llegada corresponde al día siguiente y no inferir tiempos ausentes.
#### Scenario: Parada intermedia
- **WHEN** se elige un destino anterior a la terminal del tren
- **THEN** aparece la llegada a esa parada, no la de la terminal, manteniendo identificación del destino final del tren.
#### Scenario: Cambio o intercambio
- **WHEN** cambia el destino o se intercambian origen y destino
- **THEN** las llegadas corresponden a la nueva selección sin mostrar datos anteriores durante la carga.
#### Scenario: Sin destino o llegada
- **WHEN** se elimina el destino
- **THEN** desaparece la llegada sin dejar una columna vacía.
- **AND** si un tren carece de llegada válida al destino elegido no se presenta como coincidencia ni se inventa su hora.
#### Scenario: Medianoche y móvil
- **WHEN** un tren llega al día siguiente y se consulta a 360 px
- **THEN** salida y llegada son legibles sin desplazamiento horizontal y la llegada indica +1 día.
