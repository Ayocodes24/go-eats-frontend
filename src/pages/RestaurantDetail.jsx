import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, ShoppingCart, Star, Clock } from 'lucide-react'
import { getRestaurant, getMenus, getCart, addToCart, removeFromCart } from '../api/index'
import MenuItemCard from '../components/MenuItemCard'
import { PageSpinner } from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function isValidUrl(s) { return s && (s.startsWith('http://') || s.startsWith('https://')) }

function parseCuisine(desc = '') { const m = desc?.match(/^\[([^\]]+)\]/); return m ? m[1] : null }
function cleanDesc(desc = '') { return desc?.replace(/^\[[^\]]+\]\s*/, '') ?? '' }
function rating(id) { return (4.0 + ((id * 13 + 7) % 10) / 10).toFixed(1) }

const CUISINE_STYLES = {
  Italian: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' },
  American: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
  Japanese: { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500/30' },
  Indian: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30' },
  Mexican: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30' },
  Chinese: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' },
}

export default function RestaurantDetail() {
  const { id }    = useParams()
  const { user }  = useAuth()
  const { toast } = useToast()

  const [restaurant,  setRestaurant]  = useState(null)
  const [menus,       setMenus]       = useState([])
  const [cartQty,     setCartQty]     = useState({})
  const [cartItemIds, setCartItemIds] = useState({})
  const [loading,     setLoading]     = useState(true)
  const [activeTab,   setActiveTab]   = useState('all')

  useEffect(() => {
    Promise.all([getRestaurant(id), getMenus(id)])
      .then(([rRes, mRes]) => {
        setRestaurant(rRes.data)
        setMenus(Array.isArray(mRes.data) ? mRes.data : [])
      })
      .catch(() => toast.error('Failed to load restaurant details.'))
      .finally(() => setLoading(false))
  }, [id])

  const refreshCart = useCallback(() => {
    if (!user) return
    getCart()
      .then((r) => {
        const items = r.data?.items ?? []
        const qtyMap = {}; const idMap = {}
        items.forEach((i) => {
          qtyMap[i.item_id] = (qtyMap[i.item_id] ?? 0) + Number(i.quantity)
          idMap[i.item_id]  = i.cart_item_id
        })
        setCartQty(qtyMap)
        setCartItemIds(idMap)
      })
      .catch(() => { setCartQty({}); setCartItemIds({}) })
  }, [user])

  useEffect(() => { refreshCart() }, [refreshCart])

  const handleAdd = async (item) => {
    if (!user) { toast.info('Please log in to add items to cart.'); return }
    try {
      await addToCart({ item_id: item.menu_id, restaurant_id: parseInt(id), quantity: 1 })
      setCartQty((prev) => ({ ...prev, [item.menu_id]: (prev[item.menu_id] ?? 0) + 1 }))
      refreshCart()
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Could not add item to cart.')
    }
  }

  const handleRemove = async (item) => {
    const cartItemId = cartItemIds[item.menu_id]
    if (!cartItemId) return
    try {
      await removeFromCart(cartItemId)
      setCartQty((prev) => {
        const qty = (prev[item.menu_id] ?? 1) - 1
        if (qty <= 0) { const n = { ...prev }; delete n[item.menu_id]; return n }
        return { ...prev, [item.menu_id]: qty }
      })
      refreshCart()
    } catch { toast.error('Could not remove item.') }
  }

  const totalItems = Object.values(cartQty).reduce((a, b) => a + b, 0)

  if (loading) return <PageSpinner />
  if (!restaurant) {
    return (
      <div className="text-center py-20 text-zinc-400">
        <p>Restaurant not found.</p>
        <Link to="/" className="text-brand-400 hover:underline mt-4 inline-block">Go back</Link>
      </div>
    )
  }

  const location  = [restaurant.address, restaurant.city, restaurant.state].filter(Boolean).join(' · ')
  const cuisine   = parseCuisine(restaurant.description)
  const blurb     = cleanDesc(restaurant.description)
  const rat       = rating(restaurant.restaurant_id)
  const cStyle    = cuisine ? (CUISINE_STYLES[cuisine] ?? { bg: 'bg-zinc-700/40', text: 'text-zinc-300', border: 'border-zinc-600/40' }) : null

  // Category tabs
  const categories = ['all', ...Array.from(new Set(menus.map(m => m.category).filter(Boolean)))]
  const displayed  = activeTab === 'all' ? menus : menus.filter(m => m.category === activeTab)

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-sm mb-6 transition-colors group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" /> All restaurants
      </Link>

      {/* Hero */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden mb-8">
        <div className="h-60 sm:h-72 bg-zinc-800 relative">
          {isValidUrl(restaurant.store_image) ? (
            <img src={restaurant.store_image} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)' }}>
              <span className="text-8xl opacity-10">🍽️</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/30 to-transparent" />

          {/* Cuisine badge */}
          {cStyle && cuisine && (
            <div className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full border backdrop-blur-sm ${cStyle.bg} ${cStyle.text} ${cStyle.border}`}>
              {cuisine}
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white leading-tight">{restaurant.name}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span className="text-amber-400 text-sm font-semibold">{rat}</span>
                </div>
                <span className="text-zinc-500 text-xs">·</span>
                <div className="flex items-center gap-1 text-zinc-400 text-xs">
                  <Clock size={11} />
                  <span>25–35 min</span>
                </div>
                <span className="text-zinc-500 text-xs">·</span>
                <span className="text-zinc-400 text-xs">₹₹</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Open now
            </div>
          </div>
        </div>

        {(blurb || location) && (
          <div className="px-6 py-4 border-t border-zinc-800/60 flex flex-wrap gap-3 text-sm text-zinc-400">
            {blurb && <span className="italic">"{blurb}"</span>}
            {location && (
              <span className="flex items-center gap-1 text-zinc-500 text-xs">
                <MapPin size={12} className="text-brand-500 shrink-0" />{location}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Category tabs */}
      {categories.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`shrink-0 text-sm font-medium px-4 py-2 rounded-xl border transition-all ${
                activeTab === cat
                  ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
              }`}
            >
              {cat === 'all' ? `All (${menus.length})` : cat}
            </button>
          ))}
        </div>
      )}

      {/* Menu grid */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-zinc-100">Menu</h2>
        <span className="text-sm text-zinc-500">{displayed.length} item{displayed.length !== 1 ? 's' : ''}</span>
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 text-sm">No menu items yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayed.map((item) => (
            <MenuItemCard
              key={item.menu_id}
              item={item}
              quantity={cartQty[item.menu_id] ?? 0}
              onAdd={() => handleAdd(item)}
              onRemove={() => handleRemove(item)}
            />
          ))}
        </div>
      )}

      {/* Floating cart CTA */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
          <Link
            to="/cart"
            className="flex items-center gap-3 bg-brand-500 hover:bg-brand-600 text-white px-7 py-3.5 rounded-2xl shadow-2xl shadow-brand-500/40 transition-all font-semibold text-sm hover:-translate-y-0.5"
          >
            <ShoppingCart size={17} />
            <span>View cart</span>
            <span className="bg-white/25 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {totalItems}
            </span>
          </Link>
        </div>
      )}
    </main>
  )
}
