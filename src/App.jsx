import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Detail from './pages/Detail.jsx'

export default function App() {
  return (
    <>
      {/* Header simple con navegación */}
      <header style={{
        padding: '12px 16px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <h1 style={{ fontSize: '20px', margin: 0 }}>PROJECT11_REACT_BASICS</h1>
        <nav style={{ display: 'flex', gap: '10px' }}>
          {/* NavLink marca activo automáticamente */}
          <NavLink to="/" style={{ textDecoration: 'none' }}>Inicio</NavLink>
        </nav>
      </header>

      {/* Contenido de cada ruta */}
      <main style={{ padding: '16px', maxWidth: 1200, margin: '0 auto' }}>
        <Routes>
          {/* Ruta principal */}
          <Route path="/" element={<Home />} />

          {/* Ruta con parámetro :id */}
          <Route path="/detail/:id" element={<Detail />} />

          {/* 404 */}
          <Route path="*" element={<p>Página no encontrada</p>} />
        </Routes>
      </main>
    </>
  )
}
