## ADDED Requirements
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
