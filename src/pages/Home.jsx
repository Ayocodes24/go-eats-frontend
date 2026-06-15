import { useState, useEffect } from 'react'
import { Search, UtensilsCrossed, TrendingUp } from 'lucide-react'
import { getRestaurants } from '../api/index'
import RestaurantCard from '../components/RestaurantCard'
import { PageSpinner } from '../components/Spinner'

export default function Home() {
  const [restaurants, setRestaurants] = useState([])
  const [filtered,    setFiltered]    = useState([])
  const [query,       setQuery]       = useState('')
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  useEffect(() => {
    getRestaurants()
      .then((r) => {
        const list = r.data?.restaurants ?? r.data ?? []
        setRestaurants(list)
        setFiltered(list)
      })
      .catch(() => setError('Failed to load restaurants. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = query.toLowerCase()
    setFiltered(
      q
        ? restaurants.filter(
            (r) =>
              r.name?.toLowerCase().includes(q) ||
              r.cuisine_type?.toLowerCase().includes(q) ||
              r.address?.toLowerCase().includes(q)
          )
        : restaurants
    )
  }, [query, restaurants])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <section className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 text-sm text-brand-400 font-medium mb-6">
          <TrendingUp size={14} />
          Fast delivery to your door
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-50 tracking-tight mb-4">
          What are you{' '}
          <span className="text-brand-500">hungry</span> for?
        </h1>
        <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
          Order from the best restaurants in your city, delivered hot and fresh.
        </p>

        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search restaurants, cuisines…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input w-full pl-11 py-3.5 text-base"
          />
        </div>
      </section>

      {/* Restaurant grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <UtensilsCrossed size={20} className="text-brand-500" />
            {query ? `Results for "${query}"` : 'All Restaurants'}
          </h2>
          <span className="text-sm text-zinc-500">{filtered.length} places</span>
        </div>

        {loading && <PageSpinner />}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-2">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-ghost text-sm">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <span className="text-5xl">🍽️</span>
            <p className="text-zinc-400">{query ? 'No restaurants match your search.' : 'No restaurants available yet.'}</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
