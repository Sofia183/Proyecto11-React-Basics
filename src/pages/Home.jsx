import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [term, setTerm] = useState('')
  const [query, setQuery] = useState('')

  const [items, setItems] = useState([])        // tiendas normalizadas
  const [loading, setLoading] = useState(false) // estado de carga
  const [error, setError] = useState('')        // mensaje de error
  const [page, setPage] = useState(1)           // paginación
  const PAGE_SIZE = 12

  // Cache local para acelerar recargas
  const CACHE_KEY = 'cbd-bcn:v1'
  const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutos

  // ===== Helpers =============================================================

  // Dirección legible
  function buildAddress(tags = {}) {
    const street = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ')
    const city = [tags['addr:postcode'], tags['addr:city']].filter(Boolean).join(' ')
    const full = tags['addr:full']
    return [full || street, city].filter(Boolean).join(', ')
  }

  // OpenStreetMap (west,south,east,north)
  function bboxForEmbed(lat, lon, d = 0.005) {
    const south = lat - d
    const north = lat + d
    const west  = lon - d
    const east  = lon + d
    return `${west},${south},${east},${north}`
  }

  
  function norm(v) {
    return (v || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
  }

  
  function getCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (!raw) return null
      const obj = JSON.parse(raw)
      if (!obj.items || !obj.fetchedAt) return null
      const isFresh = (Date.now() - obj.fetchedAt) <= CACHE_TTL_MS
      return isFresh ? obj.items : null
    } catch {
      return null
    }
  }

  
  function setCache(items) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        items,
        fetchedAt: Date.now()
      }))
    } catch {
     
    }
  }

  async function fetchOverpassGet(queryText) {
    const ENDPOINTS = [
      'https://overpass.kumi.systems/api/interpreter',
      'https://overpass-api.de/api/interpreter'
    ]
    let lastError = null

    for (const base of ENDPOINTS) {
      const ctrl = new AbortController()
      const timeoutId = setTimeout(() => ctrl.abort(), 20000) // 20s

      try {
        const url = `${base}?data=${encodeURIComponent(queryText)}`
        const res = await fetch(url, { signal: ctrl.signal })
        clearTimeout(timeoutId)
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`)
        return await res.json()
      } catch (e) {
        clearTimeout(timeoutId)
        lastError = e
        // prueba siguiente mirror
      }
    }
    throw lastError || new Error('No se pudo contactar con Overpass')
  }

  // ===== Carga inicial =======================================================

  useEffect(() => {
    let cancel = false

    async function load() {
      setLoading(true)
      setError('')

      // 1) Cache primero (carga instantánea si existe)
      const cached = getCache()
      if (cached) {
        setItems(cached)
        setPage(1)
        setLoading(false)
        return
      }

      // 2) Si no hay cache, Overpass
      setItems([])

      // Query amplia (área metropolitana + varias etiquetas/palabras clave)
      const q = `
        [out:json][timeout:25];
        (
          nwr["shop"~"^(cannabis|hemp)$"](41.00,1.60,41.80,2.70);
          nwr["name"~"(cbd|cannabis|hemp|grow|vape|smoke)", i](41.00,1.60,41.80,2.70);
          nwr["brand"~"(cbd|cannabis|hemp)", i](41.00,1.60,41.80,2.70);
          nwr["operator"~"(cbd|cannabis|hemp)", i](41.00,1.60,41.80,2.70);
          nwr["description"~"(cbd|cannabis|hemp)", i](41.00,1.60,41.80,2.70);
          nwr["shop"~"^(herbalist|health_food|e-cigarette|vape|tobacco|convenience|kiosk|chemist|medical_supply)$"]["name"~"(cbd|hemp|cannabis|grow|vape|smoke)", i](41.00,1.60,41.80,2.70);
        );
        out tags center;
      `.trim()

      try {
        const data = await fetchOverpassGet(q)

        const normalized = (data.elements || []).map(el => {
          const tags = el.tags || {}
          const lat = el.lat ?? el.center?.lat ?? null
          const lon = el.lon ?? el.center?.lon ?? null
          return {
            id: `${el.type}-${el.id}`,
            osmType: el.type,
            osmId: el.id,
            name: tags.name || 'Sin nombre',
            lat, lon,
            address: buildAddress(tags) || (
              [
                [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' '),
                [tags['addr:postcode'], tags['addr:city']].filter(Boolean).join(' ')
              ].filter(Boolean).join(', ')
            ),
            website: tags.website || tags['contact:website'] || null,
            phone: tags.phone || tags['contact:phone'] || null,
            opening_hours: tags.opening_hours || null
          }
        })

        // Guardar en cache para próximas cargas
        setCache(normalized)

        if (!cancel) {
          setItems(normalized)
          setPage(1)
        }
      } catch (e) {
        if (!cancel) setError(e.message || 'Fallo de red')
      } finally {
        if (!cancel) setLoading(false)
      }
    }

    load()
    return () => { cancel = true }
  }, [])

  // ===== Filtro + paginación en cliente =====================================

  const qNorm = norm(query)
  const filtered = items.filter(s => {
    const haystack = [s.name, s.address, s.website].map(norm).join(' ')
    return haystack.includes(qNorm)
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const prev = () => setPage(p => Math.max(1, p - 1))
  const next = () => setPage(p => Math.min(totalPages, p + 1))

  // ===== UI ==================================================================

  return (
    <section>
      <h2>Tiendas de CBD en Barcelona</h2>
      <p className="meta">Datos en vivo desde Overpass API (OpenStreetMap). Gratis, sin claves.</p>

      {/* Buscador */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              setQuery(term)
              setPage(1)
            }
          }}
          placeholder="Buscar por nombre, barrio o web…"
          style={{
            flex: '1 1 260px',
            padding: '8px 10px',
            border: '1px solid #ddd',
            borderRadius: 8,
            outline: 'none'
          }}
        />
        <button onClick={() => { setQuery(term); setPage(1) }}>
          Buscar
        </button>
        <span className="meta">Página {page} / {totalPages}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={prev} disabled={page <= 1}>Anterior</button>
          <button onClick={next} disabled={page >= totalPages}>Siguiente</button>
        </div>
      </div>

      {/* Estados */}
      {loading && <p style={{ marginTop: 12 }}>Cargando…</p>}
      {error && <p style={{ marginTop: 12, color: 'crimson' }}>Error: {error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p style={{ marginTop: 12 }}>Sin resultados.</p>
      )}

      {/* Grid */}
      <div
        style={{
          marginTop: 16,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16
        }}
      >
        {pageItems.map((shop) => (
          <article key={shop.id} style={{ border: '1px solid #eee', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
            <div style={{ padding: 10 }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: 16 }}>
                <Link to={`/detail/${shop.id}`} style={{ color: '#1a7f37', textDecoration: 'none', fontWeight: 600 }}>
                  {shop.name || 'Sin nombre'}
                </Link>
              </h3>

              <p className="meta" style={{ color: '#111' }}>
                {shop.address || 'Dirección no disponible'}
              </p>

              {/* Mini-mapa estable con iframe + link a OSM */}
              {shop.lat && shop.lon && (
                <>
                  <iframe
                    title={`Mapa ${shop.name}`}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${bboxForEmbed(shop.lat, shop.lon)}&layer=mapnik&marker=${shop.lat},${shop.lon}`}
                    style={{ width: '100%', height: 160, border: 0, marginTop: 8 }}
                  />
                  <p className="meta" style={{ marginTop: 4 }}>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${shop.lat}&mlon=${shop.lon}#map=16/${shop.lat}/${shop.lon}`}
                      target="_blank" rel="noreferrer"
                    >
                      Ver en mapa
                    </a>
                  </p>
                </>
              )}

              {shop.website && (
                <p className="meta">
                  <a href={shop.website} target="_blank" rel="noreferrer">Web</a>
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
