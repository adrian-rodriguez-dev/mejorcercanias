# Tasks
## 1. Fuente y relevancia
- [ ] 1.1 Verificar recurso oficial alerts, IDs de Bilbao, períodos, timestamp, semántica de retirada y CORS en la web publicada; documentar evidencia y conectar adaptador directo o capa mínima si resulta necesaria.
- [x] 1.2 Probar filtros con fixtures: cero avisos, varias incidencias, estación/intermedio, núcleo general, otro núcleo con C1, fecha futura, expiración y respuestas tardías; documentar límites.
## 2. Cabecera compacta
- [x] 2.1 Implementar indicador condicional de una línea y detalle accesible; probar apertura/cierre, Escape, foco, desaparición de avisos y estado de fuente sin bloquear horarios; actualizar README.
- [x] 2.2 Verificar a 360 px y escritorio que sin incidencias ocupa cero espacio, textos largos no desbordan y el primer tren permanece visible con detalle cerrado; comprobar botones de 44 px y teclado.
## 3. Entrega
- [ ] 3.1 Ejecutar pruebas/build/OpenSpec, publicar y comprobar fuente real y estados sin avisos/error; no declarar incidencias en vivo verificadas basándose solo en fixtures.


## Estado de integración · 2026-10-03
UI y adaptador probados. GET oficial responde pero fetch desde Pages falla por CORS. Pasarela de upstream fijo preparada en worker/; falta cuenta/despliegue y comprobación desde el origen público. Las tareas 1.1 y 3.1 siguen abiertas por este motivo; no hay integración en vivo confirmada.
