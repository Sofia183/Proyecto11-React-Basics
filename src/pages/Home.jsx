import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  // ✅ ESTADOS con sentido
  const [query, setQuery] = useState('')          // texto de búsqueda
  const [page, setPage] = useState(1)             // página actual
  const [items, setItems] = useState([])          // resultados
  const [loading, setLoading] = useState(false)   // cargando
  const [error, setError] = useState('')          // error de red/API
  const [totalPages, setTotalPages] = useState(1) // páginas totales según API

  // ✅ useEffect: se ejecuta cuando query o page cambian
  useEffect(() => {
    let cancel = false

    async function fetchCharacters() {
      setLoading(true)
      setError('')

      const base = 'https://rickandmortyapi.com/api/character'
      const url = `${base}/?page=${page}&name=${encodeURIComponent(query)}`

      try {
        const res = await fetch(url)

        // La API devuelve 404 cuando no hay resultados
        if (res.status === 404) {
          if (!cancel) {
            setItems([])
            setTotalPages(1)
          }
          return
        }

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`)
        }

        const data = await res.json()
        if (!cancel) {
          setItems(data.results || [])
          setTotalPages(data.info?.pages || 1)
        }
      } catch (err) {
        if (!cancel) setError(err.message || 'Fallo de red')
      } finally {
        if (!cancel) setLoading(false)
      }
    }

    fetchCharacters()
    return () => { cancel = true } // evita actualizar estado si el componente se desmonta
  }, [query, page])

  // Handlers simples
  const onSearchChange = (e) => {
    setQuery(e.target.value)
    setPage(1) // reiniciamos a la primera página cuando cambia la búsqueda
  }

  const prev = () => setPage(p => Math.max(1, p - 1))
  const next = () => setPage(p => Math.min(totalPages, p + 1))

  return (
    <section>
      <h2>Personajes (Rick & Morty)</h2>

      {/* Buscador */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={query}
          onChange={onSearchChange}
          placeholder="Buscar por nombre…"
          style={{
            flex: '1 1 240px',
            padding: '8px 10px',
            border: '1px solid #ddd',
            borderRadius: 8,
            outline: 'none'
          }}
        />
        <span style={{ fontSize: 12, color: '#666' }}>
          Página {page} / {totalPages}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={prev} disabled={page <= 1}>Anterior</button>
          <button onClick={next} disabled={page >= totalPages}>Siguiente</button>
        </div>
      </div>

      {/* Estados de carga / error */}
      {loading && <p style={{ marginTop: 12 }}>Cargando…</p>}
      {error && <p style={{ marginTop: 12, color: 'crimson' }}>Error: {error}</p>}
      {!loading && !error && items.length === 0 && (
        <p style={{ marginTop: 12 }}>Sin resultados.</p>
      )}

      {/* Grid responsive */}
    <div
  style={{
    marginTop: 16,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 16,
    alignItems: 'start'
  }}
      >
        {items.map((ch) => (
          <article key={ch.id} style={{ border: '1px solid #eee', borderRadius: 10, overflow: 'hidden' }}>
            <Link to={`/detail/${ch.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              <img
                src={ch.image}
                alt={ch.name}
                style={{ display: 'block', width: '100%', height: 180, objectFit: 'cover' }}
              />
              <div style={{ padding: 10 }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 16 }}>{ch.name}</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#555' }}>
                  {ch.status} · {ch.species}
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
