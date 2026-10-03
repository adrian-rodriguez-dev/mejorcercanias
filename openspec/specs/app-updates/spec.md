# app-updates Specification

## Purpose
Detectar nuevas versiones de la aplicación y permitir adoptarlas sin interrumpir la consulta ni perder el trayecto.

## Requirements

### Requirement: Detección de versión publicada
The system SHALL comprobar metadatos sin caché al cargar, al volver a primer plano o recuperar conexión y cada cinco minutos visible, con un máximo de una solicitud por minuto; los errores no impedirán consultar horarios.
#### Scenario: Nueva publicación
- **WHEN** la versión publicada difiere de la cargada
- **THEN** aparece Nueva versión disponible con botón Actualizar.
#### Scenario: Misma versión o fallo
- **WHEN** no hay versión nueva verificable
- **THEN** no aparece aviso falso ni se recarga la app.

### Requirement: Actualización voluntaria
The system SHALL recargar solamente cuando se pulse Actualizar y conservar núcleo, origen, destino y líneas guardados.
#### Scenario: Consulta en curso
- **WHEN** aparece el aviso mientras se consulta un horario
- **THEN** la vista se mantiene hasta que se acepta la actualización.
#### Scenario: Actualizar
- **WHEN** el usuario pulsa Actualizar
- **THEN** se carga la versión publicada y se restauran las selecciones persistidas.
