# PROJECT11_REACT_BASICS

Aplicación React (Vite) que lista **puntos de venta relacionados con CBD en el área metropolitana de Barcelona** usando datos abiertos de **OpenStreetMap** vía **Overpass API** (servicio público y sin clave).

> Nota: los datos provienen de OpenStreetMap (comunidad). **No garantizan** que los comercios estén “autorizados” ni su vigencia.

## Arranque local

```bash
npm install
npm run dev

URL que muestra Vite (por ejemplo http://localhost:5173 o http://localhost:5174).

## Rutas

/ → listado de tiendas:

Buscador por nombre + dirección + web (no utilizar tildes ni apostrofes)

Botón Buscar y también funciona con Enter.

Paginación en cliente.

Mini-mapa embebido (OpenStreetMap) en cada tarjeta cuando hay coordenadas.

/detail/:id → ruta preparada con parámetro :id (OSM id).
(Opcional a futuro: pedir detalle por id a Overpass y mostrar ficha ampliada.)

## Fuente de datos (Overpass API)

Endpoint: https://overpass.kumi.systems/api/interpreter (con fallback a https://overpass-api.de/api/interpreter)

Consulta: Overpass QL con bounding box amplia de Barcelona, buscando:

shop=cannabis / shop=hemp

palabras clave (cbd, cannabis, hemp, grow, vape, smoke) en name/brand/operator/description

otras tiendas tipo herbalist, health_food, e-cigarette, vape, etc. cuando el nombre contiene esas palabras.

## Stack

React + Vite
React Router DOM
Fetch API nativa
Overpass API (OpenStreetMap)