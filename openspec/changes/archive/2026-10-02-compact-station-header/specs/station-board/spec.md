# Spec Delta
## ADDED Requirements
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
