# journey-routing Specification

## Purpose
Calcular rutas con transbordos al elegir estaciones en el panel existente, mostrando llegada y cambios necesarios.

## Requirements

### Requirement: Búsqueda interna por rondas
The system SHALL aplicar un margen estimado de 60 segundos para cambiar de tren en el mismo punto de embarque cuando no haya una regla GTFS aplicable. Las reglas oficiales aplicables SHALL tener prioridad; los enlaces peatonales entre puntos distintos SHALL mantener sus tiempos explícitos.
The system SHALL buscar hasta tres transbordos usando calendarios, tiempos de embarque y bajada, reglas GTFS y enlaces explícitos; SHALL usar penalización de 15 minutos para preferir itinerarios menos complejos.
The system SHALL descartar cada conexión cuyo intervalo entre llegada del tren anterior y salida del siguiente supere 60 minutos, incluyendo caminatas y márgenes mínimos. El límite SHALL aplicarse también al cruzar medianoche y no al tiempo a bordo ni a la espera inicial en origen.
#### Scenario: Espera nocturna excesiva
- **WHEN** una conexión exige esperar 378 minutos hasta el siguiente tren
- **THEN** se descarta durante la búsqueda y se siguen buscando salidas posteriores con cambios de hasta 60 minutos.
#### Scenario: Límite incluido
- **WHEN** hay 60 minutos exactos entre dos trenes y se respeta el mínimo aplicable
- **THEN** la conexión es válida; con 60 minutos y un segundo se descarta.
#### Scenario: Cambio demasiado corto
- **WHEN** el siguiente tren sale antes del mínimo de transbordo
- **THEN** se descarta esa conexión y se considera un tren posterior.
#### Scenario: Puntos de embarque separados
- **WHEN** una estación agrupa dos puntos físicos
- **THEN** el cambio entre ellos respeta el enlace peatonal sin atajo por identidad compartida.

#### Scenario: Un minuto en la misma estación
- **WHEN** se cambia de tren en el mismo punto sin regla específica de Renfe
- **THEN** se admite una conexión con 60 segundos disponibles, se rechaza una de 59 segundos y el margen se identifica como estimado.

### Requirement: Integración en panel y tabla
The system SHALL mostrar llegada final y, solo cuando haya cambios, número de transbordos y detalle desplegable al elegir destino, sin nueva vista ni formulario. SHALL omitir la etiqueta Directo.
#### Scenario: Dos líneas
- **WHEN** el usuario elige dos estaciones sin tren directo
- **THEN** el panel y la tabla muestran itinerarios con cambios y llegada a destino.

### Requirement: Datos versionados y cancelación
The system SHALL cargar solo el grafo del núcleo consultado, procesarlo fuera del hilo de interfaz, conservar uso offline tras descarga y descartar resultados de selecciones antiguas.
#### Scenario: Cambio rápido
- **WHEN** se cambia destino durante un cálculo
- **THEN** solo se presenta el resultado correspondiente al destino nuevo.
#### Scenario: Calendario sin datos
- **WHEN** la fecha no está cubierta
- **THEN** se informa de datos no publicados sin reutilizar otro día.

### Requirement: Recorrido visual de transbordos
The system SHALL presentar el detalle desplegado como un recorrido vertical compacto, con cada tramo en el color oficial de su línea, estación y hora de salida y llegada, y minutos disponibles entre trenes. SHALL distinguir enlaces a pie de esperas en la misma estación, conservar los márgenes estimados y señalar cambios de día.
#### Scenario: Recorrido con cambio
- **WHEN** se despliega una ruta con dos trenes
- **THEN** se muestran origen y salida, estación y llegada del primer tramo, intervalo de transbordo, salida del segundo tren y destino final con llegada, con sus colores de línea.

### Requirement: Preferencia por directos disponibles
The system SHALL conservar trenes directos y mostrar alternativas con cambios solo si llegan al menos 15 minutos antes que un directo que salga a la misma hora o después, indicando el ahorro cuando exista comparación. Sin directo disponible SHALL conservar conexiones válidas.
#### Scenario: Cambio que ahorra poco
- **WHEN** un directo sale después de la conexión y llega menos de 15 minutos más tarde
- **THEN** se conserva el directo y se omite la conexión.
#### Scenario: Ahorro significativo
- **WHEN** la conexión llega al menos 15 minutos antes
- **THEN** se conserva junto al directo y se indica el ahorro.

### Requirement: Evitar rodeos al origen
The system SHALL descartar recorridos que regresen a un nodo del origen y cambios a un tren que ya se podía abordar en origen al iniciar el trayecto.
#### Scenario: Abando a Trapagaran
- **WHEN** se puede abordar la C2 en Abando
- **THEN** no se propone la C1 para cambiar a ese mismo tren ni salir en C3 para regresar a Abando.
