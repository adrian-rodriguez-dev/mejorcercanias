# journey-routing Specification

## Purpose
Calcular rutas con transbordos al elegir estaciones en el panel existente, mostrando llegada y cambios necesarios.

## Requirements

### Requirement: Búsqueda interna por rondas
The system SHALL buscar hasta tres transbordos usando calendarios, tiempos de embarque y bajada, reglas GTFS y enlaces explícitos; SHALL usar penalización de 15 minutos para preferir itinerarios menos complejos.
#### Scenario: Cambio demasiado corto
- **WHEN** el siguiente tren sale antes del mínimo de transbordo
- **THEN** se descarta esa conexión y se considera un tren posterior.
#### Scenario: Puntos de embarque separados
- **WHEN** una estación agrupa dos puntos físicos
- **THEN** el cambio entre ellos respeta el enlace peatonal sin atajo por identidad compartida.

### Requirement: Integración en panel y tabla
The system SHALL mostrar llegada final, Directo o número de transbordos y detalle desplegable al elegir destino, sin nueva vista ni formulario.
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
