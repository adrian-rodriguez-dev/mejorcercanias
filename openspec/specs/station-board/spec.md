# station-board Specification

## Purpose
Permitir consultar las próximas salidas de la estación habitual con una sola mirada, distinguiendo siempre los datos de demostración de los horarios reales.

## Requirements

### Requirement: Elegir estación
The system SHALL ofrecer estaciones del núcleo elegido y solicitar núcleo y origen mediante el asistente cuando falte una configuración válida, con destino opcional.
#### Scenario: Primera visita
- **WHEN** no hay núcleo guardado válido, aunque exista una estación antigua
- **THEN** aparece el asistente para núcleo, origen y destino opcional sin exigir fecha ni hora.
#### Scenario: Cambio de estación
- **WHEN** se elige otra estación mientras se cargan datos
- **THEN** el panel muestra exclusivamente las salidas de la selección más reciente.

### Requirement: Recordar preferencia
The system SHALL restaurar núcleo, origen, destino y líneas compatibles entre visitas y mantener la aplicación utilizable si el almacenamiento no está disponible.
#### Scenario: Regreso
- **WHEN** se abre con núcleo y origen válidos guardados
- **THEN** aparece automáticamente el panel de esa estación.
#### Scenario: Preferencia inválida o almacenamiento bloqueado
- **WHEN** falta núcleo u origen válido o falla la lectura
- **THEN** se ofrece la configuración guiada sin bloquear la aplicación
- **AND** si guardar falla, se avisa de que la selección solo dura esta visita.

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

### Requirement: Horas compactas bajo destino
The system SHALL mostrar salida y llegada debajo del nombre del destino en próximas salidas, con etiquetas inequívocas, sin columna horaria separada ni texto repetido Próximo tren/Hoy/Programado. SHALL mantener cuenta atrás a la derecha y distinguir salidas de otro día y llegadas al día siguiente. Sin destino elegido SHALL mostrar solo salida.
#### Scenario: Destino elegido
- **WHEN** un tren tiene llegada al destino seleccionado
- **THEN** se muestran Salida HH:mm y Llegada HH:mm bajo su nombre, sin desbordar 360 px.
#### Scenario: Sin destino y medianoche
- **WHEN** no hay destino elegido o el tren cruza medianoche
- **THEN** no se reserva espacio de llegada ausente y se conserva la indicación de día necesaria.

### Requirement: Campana de incidencias en cabecera compacta
The system SHALL mostrar una campana en la barra superior fuera del panel de estaciones, marcada con contador solo si hay avisos verificables. Sin avisos verificables SHALL estar neutra y deshabilitada, con estado accesible que distinga fuente no disponible de consulta vacía, sin texto visible de error. El panel SHALL comenzar a 8 px de la cabecera y conservar controles de 44 px sin desbordar móvil.
#### Scenario: Fuente pendiente
- **WHEN** la fuente no está disponible
- **THEN** no aparece Avisos no disponibles en el contenido y la campana no indica falsamente ausencia de incidencias.
#### Scenario: Avisos verificados
- **WHEN** hay incidencias relevantes
- **THEN** la campana se marca y abre el detalle existente, con Escape y retorno del foco.

### Requirement: Horarios sin franja informativa superior
The system SHALL eliminar la franja Renfe/horario programado encima de los horarios. SHALL conservar atribución y limitación de información de tiempo real fuera del panel, en el pie, sin sustituir la franja por otra.
#### Scenario: Consulta de trenes
- **WHEN** se muestran próximas salidas u horario completo
- **THEN** los horarios siguen a los controles sin franja informativa intermedia.

### Requirement: Encabezados legibles y próximos a filtros
The system SHALL mostrar LÍNEA / DESTINO y SALE EN a 10 px y reducir el espacio vertical entre filtros y primera salida, manteniendo alineación, áreas táctiles y ausencia de desbordamiento móvil.
#### Scenario: Consulta móvil
- **WHEN** se muestran próximas salidas con o sin barra de líneas
- **THEN** los encabezados son legibles y no queda la separación anterior de la franja retirada.

### Requirement: Filas compactas y legibles
The system SHALL reducir el espacio superior e inferior de cada tren y aumentar la letra de estación y horas de salida y llegada, tanto en próximas salidas como en horario completo, sin truncar nombres ni desbordar a 360 px.
#### Scenario: Destino seleccionado
- **WHEN** se muestran salida y llegada en móvil
- **THEN** ambas horas y el destino son legibles, con filas ajustadas al contenido y sin espacio vertical sobrante.

### Requirement: Acentos legibles
The system SHALL mostrar correctamente acentos y eñes en la interfaz y nombres de estaciones, incluyendo catálogos antiguos recuperables con doble codificación, sin modificar nombres ya válidos ni los horarios.
#### Scenario: Catálogo anterior
- **WHEN** se recibe un nombre como San MamÃ©s u OrduÃ±a
- **THEN** se presenta San Mamés u Orduña en selectores y horarios.
#### Scenario: Texto válido
- **WHEN** el catálogo contiene Autonomía, Iñarratxu, Málaga o València correctamente codificados
- **THEN** se mantienen idénticos y el documento se sirve como UTF-8.

### Requirement: Lema de cabecera
The system SHALL mostrar «Tu tren en menos de 5 segundos» como lema de cabecera.
#### Scenario: Inicio
- **WHEN** se abre la aplicación
- **THEN** se muestra el nuevo lema sin desbordamiento horizontal móvil.

### Requirement: Selectores editables y borrables
The system SHALL permitir escribir y elegir opciones desplegables en núcleo, origen y destino, con botón × accesible para borrar. SHALL confirmar solo opciones existentes y conservar selección ante texto inválido al abandonar el campo.
#### Scenario: Quitar destino
- **WHEN** se pulsa Borrar destino
- **THEN** queda vacío, desaparece llegada y se muestran salidas sin filtro de destino, persistiendo ese estado.
#### Scenario: Sustituir origen
- **WHEN** se borra origen
- **THEN** se permite escribir y elegir otro sin forzar el asistente durante esa visita ni mostrar horarios del origen borrado.
#### Scenario: Escribir y desplegar
- **WHEN** se edita un campo
- **THEN** se ofrecen opciones del núcleo correspondiente y puede confirmarse una opción con teclado o puntero.
