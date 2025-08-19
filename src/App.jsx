import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Detail from './pages/Detail.jsx'

export default function App() {
  return (
    <>
      {/* Header con navegación */}
      <header style={{
        padding: '12px 16px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <h1 style={{ fontSize: '20px', margin: 0 }}>Puntos CBD · Barcelona</h1>
        <nav style={{ display: 'flex', gap: '10px' }}>
          <NavLink to="/" style={{ textDecoration: 'none' }}>Inicio</NavLink>
        </nav>
      </header>

      <main style={{ padding: '16px', maxWidth: 1200, margin: '0 auto' }}>
        <Routes>
          {/* Home: listado y buscador */}
          <Route path="/" element={<Home />} />

          {/* Detalle con parámetro :id OMS */}
          <Route path="/detail/:id" element={<Detail />} />

          {/* 404 */}
          <Route path="*" element={<p>Página no encontrada</p>} />
        </Routes>
      </main>
    </>
  )
}
