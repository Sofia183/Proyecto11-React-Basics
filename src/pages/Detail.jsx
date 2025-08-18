import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Detail() {
  // 1) Leemos el parámetro :id de la URL
  const { id } = useParams()

  // 2) Estados: dato, cargando y error
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 3) useEffect: cuando cambia el id, pedimos el personaje a la API
  useEffect(() => {
    let cancel = false

    async function fetchOne() {
      setLoading(true)
      setError('')

      try {
        const res = await fetch(`https://rickandmortyapi.com/api/character/${id}`)
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`)
        const data = await res.json()
        if (!cancel) setItem(data)
      } catch (e) {
        if (!cancel) setError(e.message || 'Fallo de red')
      } finally {
        if (!cancel) setLoading(false)
      }
    }

    fetchOne()
    return () => { cancel = true } // evita setState si el componente se desmonta
  }, [id])

  // 4) UI según estado
  if (loading) return <section><p>Cargando…</p></section>
  if (error) return <section><p style={{ color: 'crimson' }}>Error: {error}</p></section>
  if (!item) return null

  // 5) Detalle
  return (
    <section>
      <Link to="">{/* volver a la anterior si hay historial o a / si no */}
        <span onClick={(e) => {
          e.preventDefault()
          if (window.history.length > 1) window.history.back()
          else window.location.href = '/'
        }}>← Volver</span>
      </Link>

      <h2 style={{ marginTop: 12 }}>{item.name}</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        gap: 16,
        alignItems: 'start'
      }}>
        <img
          src={item.image}
          alt={item.name}
          style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 12 }}
        />
        <div>
          <p><strong>Estado:</strong> {item.status}</p>
          <p><strong>Especie:</strong> {item.species}</p>
          {item.type ? <p><strong>Tipo:</strong> {item.type}</p> : null}
          <p><strong>Género:</strong> {item.gender}</p>
          <p><strong>Origen:</strong> {item.origin?.name}</p>
          <p><strong>Ubicación:</strong> {item.location?.name}</p>
          <p><strong>Episodios:</strong> {item.episode?.length}</p>
        </div>
      </div>
    </section>
  )
}
