# Verification
- 80 pruebas unitarias, 46 pruebas de navegador desktop/mobile, 5 pruebas offline/producción correctas.
- npm run check correcto: formato, capas, tipos, build y OpenSpec.
- Captura móvil revisada: lema alineado al ancho de la marca, mayor tamaño, sin desbordamiento. Prueba de accesibilidad con texto ampliado correcta.
- Comparación con motor anterior y snapshot local para 2026-10-03: Abando 13200 a Trapagaran 13503, antes 36 opciones (2 con cambio), después 34 directos C2. Filtro C1 antes 35 cambios vía Zabalburu, ahora ninguno; filtro C3 antes 29 recorridos con regreso a Abando, ahora ninguno. Filtro C2 mantiene 34 directos. También comprobado Abando a Trápaga 13502: 34 directos C2.
- No se regeneran datos ni se alteran reglas oficiales. Los filtros de primera línea siguen activos: si se excluye C2 no se inventa un rodeo.
- Acentos: datos actuales correctos; endurecida recuperación de catálogos antiguos y corregidas rutas que usaban nombres crudos del grafo/manifiesto.
