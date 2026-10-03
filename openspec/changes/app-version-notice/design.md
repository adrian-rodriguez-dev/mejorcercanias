# Design
## Context
Vite publica recursos con nombres inmutables; no existe detector de versión.
## Decisions
Cada build genera un identificador único embebido y app-version.json. Consultar sin caché al inicio, visibilidad/online y cada cinco minutos, limitando solicitudes a una por minuto. Fallos silenciosos conservan la app abierta; actualizar recarga la URL actual sin borrar almacenamiento. El desarrollo normal no comprueba builds; e2e permite simularlos.
## Risks / Trade-offs
Una respuesta del servidor puede llegar tarde: limitar timeout y cancelar al desmontar. El posterior soporte offline debe excluir estos metadatos de caché.
