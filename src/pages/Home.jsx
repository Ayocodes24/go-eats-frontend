import { useState, useEffect, useMemo } from 'react'
import { Search, UtensilsCrossed, Zap, Shield, Clock, ChevronRight } from 'lucide-react'
import { getRestaurants } from '../api/index'
import RestaurantCard from '../components/RestaurantCard'
import { Link } from 'react-router-dom'

function SkeletonCard() {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-zinc-800/80" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-zinc-800 rounded-lg w-3/4" />
        <div className="h-3 bg-zinc-800 rounded-lg w-1/3" />
        <div className="h-3 bg-zinc-800 rounded-lg w-1/2" />
      </div>
    </div>
  )
}

const CUISINE_ICONS = {
  Italian: '🍕', American: '🍔', Japanese: '🍣', Indian: '🍛',
  Mexican: '🌮', Chinese: '🍜', Thai: '🍲', Mediterranean: '🥙',
  Continental: '🍽️', 'Fast Food': '🍟', Cafe: '☕',
}

function parseCuisine(desc = '') {
  const m = desc?.match(/^\[([^\]]+)\]/)
  return m ? m[1] : null
}

export default function Home() {
  const [restaurants, setRestaurants] = useState([])
  const [query,       setQuery]       = useState('')
  const [cuisine,     setCuisine]     = useState('')
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  const fetchRestaurants = () => {
    setLoading(true)
    setError('')
    getRestaurants()
      .then((r) => setRestaurants(Array.isArray(r.data) ? r.data : []))
      .catch((err) => {
        if (err.response?.status === 404) {
          setRestaurants([])
        } else {
          setError('Cannot reach the server. Make sure the Go backend is running on :8080.')
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRestaurants() }, [])

  const cuisines = useMemo(() => {
    const set = new Set()
    restaurants.forEach((r) => { const c = parseCuisine(r.description); if (c) set.add(c) })
    return Array.from(set).sort()
  }, [restaurants])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return restaurants.filter((r) => {
      const matchQ = !q || r.name?.toLowerCase().includes(q) || r.city?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
      const matchC = !cuisine || parseCuisine(r.description) === cuisine
      return matchQ && matchC
    })
  }, [query, cuisine, restaurants])

  return (
    <main className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.14) 0%, transparent 70%)' }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 text-center">
          {/* Top pill */}
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <Zap size={12} className="text-brand-400" />
            Fast delivery · Live tracking · Best restaurants
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
            <span className="text-zinc-50">Food you</span>
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #fb923c 0%, #f97316 40%, #ea580c 100%)' }}
            >
              love, delivered
            </span>
          </h1>

          <p className="text-zinc-400 text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed font-light">
            Order from the best restaurants around you. Hot, fresh and right at your door.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <Search size={19} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search for restaurants, cuisines…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 rounded-2xl pl-13 pr-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/50 transition-all shadow-2xl shadow-black/40"
              style={{ paddingLeft: '3.25rem' }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xl leading-none"
              >×</button>
            )}
          </div>

          {/* Feature row */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: <Zap size={13} />, label: 'Fast delivery' },
              { icon: <Shield size={13} />, label: 'Secure payments' },
              { icon: <Clock size={13} />, label: 'Real-time tracking' },
            ].map(({ icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                <span className="text-brand-500">{icon}</span>{label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cuisine filter pills ── */}
      {!loading && !error && cuisines.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setCuisine('')}
              className={`shrink-0 flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border transition-all ${
                !cuisine
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/25'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
              }`}
            >
              All
            </button>
            {cuisines.map((c) => (
              <button
                key={c}
                onClick={() => setCuisine(cuisine === c ? '' : c)}
                className={`shrink-0 flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border transition-all ${
                  cuisine === c
                    ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/25'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
                }`}
              >
                {CUISINE_ICONS[c] && <span className="text-sm">{CUISINE_ICONS[c]}</span>}
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Grid section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <UtensilsCrossed size={18} className="text-brand-500" />
            {cuisine ? `${cuisine} restaurants` : query ? `"${query}"` : 'All Restaurants'}
          </h2>
          {!loading && !error && (
            <span className="text-sm text-zinc-500">{filtered.length} place{filtered.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-24 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <p className="text-red-400 font-semibold mb-1.5">Could not reach the server</p>
              <p className="text-zinc-500 text-sm">{error}</p>
            </div>
            <button onClick={fetchRestaurants}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-xl border border-zinc-700 transition-all">
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
              <span className="text-4xl">🍽️</span>
            </div>
            <div>
              <p className="text-zinc-300 font-semibold mb-1">
                {query || cuisine ? 'No matches found' : 'No restaurants yet'}
              </p>
              <p className="text-zinc-500 text-sm">
                {query || cuisine ? 'Try adjusting your filters.' : 'Head to Admin and seed some data.'}
              </p>
            </div>
            {(query || cuisine) ? (
              <button onClick={() => { setQuery(''); setCuisine('') }} className="text-brand-400 text-sm hover:underline font-medium">
                Clear filters
              </button>
            ) : (
              <Link to="/admin" className="inline-flex items-center gap-1.5 text-brand-400 text-sm hover:underline font-medium">
                Go to Admin <ChevronRight size={14} />
              </Link>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((r) => (
              <RestaurantCard key={r.restaurant_id} restaurant={r} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
