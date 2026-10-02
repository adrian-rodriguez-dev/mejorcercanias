# Spec Delta
## MODIFIED Requirements
### Requirement: Procedencia honesta
The system SHALL identificar siempre los horarios ficticios como demostración no válida para viajar, identificar los oficiales como horarios programados de Renfe y SHALL evitar afirmar puntualidad o tiempo real sin datos que lo acrediten.
#### Scenario: Demo
- **WHEN** se muestra cualquier salida del proveedor de demostración
- **THEN** el aviso de horarios ficticios permanece visible junto al panel
#### Scenario: Horario oficial
- **WHEN** se usa el proveedor GTFS oficial
- **THEN** se muestra atribución Renfe, vigencia y ausencia de datos de retrasos en tiempo real
## ADDED Requirements
### Requirement: Migración de favoritas
The system SHALL conservar las cinco preferencias de la demo asignándolas a las estaciones oficiales correspondientes.
#### Scenario: Favorita anterior
- **WHEN** existe demo-barakaldo como preferencia
- **THEN** se abre Desertu-Barakaldo con el identificador oficial y el panel de próximas salidas
