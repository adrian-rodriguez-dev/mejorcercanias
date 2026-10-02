# Spec Delta
## ADDED Requirements
### Requirement: Persistencia del trayecto seleccionado
The system SHALL guardar origen, destino opcional y líneas seleccionadas localmente y restaurarlos al abrir la app, usando solo estaciones existentes y líneas compatibles. SHALL recordar selecciones vacías e intercambio, migrar la preferencia antigua de origen y continuar funcionando si el almacenamiento falla. Con cero o una línea posible SHALL limpiar selección explícita, conservando la barra oculta.
#### Scenario: Regreso
- **WHEN** se recarga tras elegir origen, destino y varias líneas
- **THEN** se recupera la selección completa y se filtran los trenes desde la primera carga.
#### Scenario: Vaciar e invertir
- **WHEN** se vacía destino o líneas, o se intercambian estaciones, y se recarga
- **THEN** se restaura el último estado completo sin recuperar filtros anteriores.
#### Scenario: Datos antiguos o dañados
- **WHEN** hay JSON corrupto, tipos inválidos o IDs obsoletos
- **THEN** se ignoran valores inválidos, se recupera origen antiguo válido cuando procede y la app sigue funcionando.
#### Scenario: Almacenamiento bloqueado
- **WHEN** el navegador impide guardar
- **THEN** la selección funciona durante la visita y se comunica que no se puede guardar.
