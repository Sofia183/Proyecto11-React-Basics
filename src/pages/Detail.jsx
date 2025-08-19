import { useParams, Link } from 'react-router-dom'

export default function Detail() {
  const { id } = useParams()

  return (
    <section>
      <Link to="" onClick={(e) => {
        e.preventDefault()
        if (window.history.length > 1) window.history.back()
        else window.location.href = '/'
      }}>← Volver</Link>

      <h2 style={{ marginTop: 12 }}>Detalle tienda (OSM id: {id})</h2>
      <p className="meta">En el siguiente paso pediremos los datos de este ID a Overpass.</p>
    </section>
  )
}
