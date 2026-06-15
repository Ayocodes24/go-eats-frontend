import { useState, useEffect } from 'react'
import { Search, UtensilsCrossed, Zap, Shield, Clock } from 'lucide-react'
import { getRestaurants } from '../api/index'
import RestaurantCard from '../components/RestaurantCard'

function SkeletonCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-44 bg-zinc-800" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-zinc-800 rounded-lg w-3/4" />
        <div className="h-3 bg-zinc-800 rounded-lg w-1/2" />
        <div className="h-3 bg-zinc-800 rounded-lg w-1/3" />
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: <Zap size={16} />, label: 'Fast delivery' },
  { icon: <Shield size={16} />, label: 'Safe & secure' },
  { icon: <Clock size={16} />, label: 'Track in real-time' },
]

export default function Home() {
  const [restaurants, setRestaurants] = useState([])
  const [filtered,    setFiltered]    = useState([])
  const [query,       setQuery]       = useState('')
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  useEffect(() => {
    getRestaurants()
      .then((r) => {
        // Backend returns a raw array directly
        const list = Array.isArray(r.data) ? r.data : (r.data?.restaurants ?? [])
        setRestaurants(list)
        setFiltered(list)
      })
      .catch(() => setError('Backend is not running. Start the Go server on :8080.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = query.toLowerCase()
    setFiltered(
      q
        ? restaurants.filter(
            (r) =>
              r.name?.toLowerCase().includes(q) ||
              r.city?.toLowerCase().includes(q) ||
              r.state?.toLowerCase().includes(q) ||
              r.description?.toLowerCase().includes(q)
          )
        : restaurants
    )
  }, [query, restaurants])

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-950 border-b border-zinc-800/60">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-500/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-brand-600/6 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {FEATURES.map(({ icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium px-3 py-1.5 rounded-full"
              >
                <span className="text-brand-400">{icon}</span>
                {label}
              </span>
            ))}
          </div>

          <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-50 tracking-tight mb-4">
            What are you{' '}
            <span className="text-brand-500">hungry</span> for?
          </h1>
          <p className="text-center text-zinc-400 text-lg mb-10 max-w-lg mx-auto">
            Order from the best restaurants in your city, delivered hot and fresh.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search restaurants, cities…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-2xl pl-11 pr-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Restaurant grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <UtensilsCrossed size={18} className="text-brand-500" />
            {query ? `Results for "${query}"` : 'All Restaurants'}
          </h2>
          {!loading && !error && (
            <span className="text-sm text-zinc-500">{filtered.length} places</span>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <p className="text-red-400 font-medium mb-1">Could not reach the server</p>
              <p className="text-zinc-500 text-sm">{error}</p>
            </div>
            <button
              onClick={() => { setError(''); setLoading(true); getRestaurants().then((r) => { const list = Array.isArray(r.data) ? r.data : []; setRestaurants(list); setFiltered(list); }).catch(() => setError('Backend is not running. Start the Go server on :8080.')).finally(() => setLoading(false)) }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-xl border border-zinc-700 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <span className="text-5xl">🍽️</span>
            <p className="text-zinc-400 font-medium">
              {query ? 'No restaurants match your search.' : 'No restaurants yet.'}
            </p>
            {query && (
              <button onClick={() => setQuery('')} className="text-brand-400 text-sm hover:underline">
                Clear search
              </button>
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
