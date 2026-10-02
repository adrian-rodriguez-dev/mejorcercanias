# static-publication Specification

## Purpose
Permitir consultar la aplicación públicamente desde cualquier navegador mediante una URL HTTPS estable.

## Requirements

### Requirement: Publicación estática verificada
El sistema SHALL publicar la aplicación en HTTPS después de superar la validación de main, incluyendo recursos y datos de estación bajo la subcarpeta del repositorio.
#### Scenario: Acceso público
- **WHEN** se abre la URL publicada y se elige una estación
- **THEN** se carga el panel y el horario oficial sin servidor local ni autenticación.
#### Scenario: Validación fallida
- **WHEN** falla la validación de un cambio
- **THEN** ese cambio no sustituye la versión publicada.
