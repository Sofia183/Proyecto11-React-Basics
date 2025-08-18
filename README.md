# PROJECT11_REACT_BASICS

SPA en React (Vite) que consume la API pública de **Rick & Morty**.  
Incluye **React Router**, **estados (useState)**, **efectos (useEffect)**, **petición a API**, y **diseño responsive**.

## 🚀 Arranque local

```bash
npm install
npm run dev

Abre la URL que muestre Vite (normalmente http://localhost:5173).

## Rutas

/ → lista de personajes (buscador + paginación).

/detail/:id → detalle de personaje (usa el parámetro :id para pedir los datos).

## Requisitos del enunciado (cumplidos)

Responsive: grid fluido y layout centrado.

Buenas prácticas HTML/CSS: estilos globales, variables CSS, semántica básica.

Estados (mín. 3): query, page, items, loading, error, totalPages.

useEffect (mín. 1): en Home (lista) y en Detail (detalle por id).

Petición a API: https://rickandmortyapi.com/api/character

Lista: ?page=X&name=QUERY

Detalle: /character/:id

React Router: declaración de rutas (+ :id) y navegación con Link.

## Stack
React + Vite

React Router DOM

Fetch API nativa