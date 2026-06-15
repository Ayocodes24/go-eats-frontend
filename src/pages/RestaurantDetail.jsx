import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, MapPin, ShoppingCart } from 'lucide-react'
import { getRestaurant, getMenus, getCart, addToCart, removeFromCart } from '../api/index'
import MenuItemCard from '../components/MenuItemCard'
import { PageSpinner } from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function RestaurantDetail() {
  const { id }        = useParams()
  const { user }      = useAuth()
  const { toast }     = useToast()

  const [restaurant, setRestaurant] = useState(null)
  const [menus,      setMenus]      = useState([])
  const [cartItems,  setCartItems]  = useState({}) // { menuItemId: quantity }
  const [cartId,     setCartId]     = useState(null)
  const [loading,    setLoading]    = useState(true)

  // Load restaurant + menus
  useEffect(() => {
    Promise.all([getRestaurant(id), getMenus(id)])
      .then(([rRes, mRes]) => {
        setRestaurant(rRes.data?.restaurant ?? rRes.data)
        setMenus(mRes.data?.menus ?? mRes.data ?? [])
      })
      .catch(() => toast.error('Failed to load restaurant details.'))
      .finally(() => setLoading(false))
  }, [id])

  // Load existing cart
  const refreshCart = useCallback(() => {
    if (!user) return
    getCart().then((r) => {
      const items = r.data?.items ?? []
      const cId   = r.data?.cart_id ?? r.data?.id ?? null
      setCartId(cId)
      const map = {}
      items.forEach((i) => { map[i.menu_item_id ?? i.item_id] = i.quantity })
      setCartItems(map)
    }).catch(() => {})
  }, [user])

  useEffect(() => { refreshCart() }, [refreshCart])

  const handleAdd = async (item) => {
    if (!user) { toast.info('Please log in to add items to cart.'); return }
    try {
      await addToCart({ menu_item_id: item.id, quantity: 1 })
      setCartItems((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? 0) + 1 }))
    } catch {
      toast.error('Could not add item to cart.')
    }
  }

  const handleRemove = async (item) => {
    if (!cartId) return
    try {
      await removeFromCart(cartId, item.id)
      setCartItems((prev) => {
        const qty = (prev[item.id] ?? 1) - 1
        if (qty <= 0) { const next = { ...prev }; delete next[item.id]; return next }
        return { ...prev, [item.id]: qty }
      })
    } catch {
      toast.error('Could not remove item from cart.')
    }
  }

  const totalItems = Object.values(cartItems).reduce((a, b) => a + b, 0)

  if (loading) return <PageSpinner />

  if (!restaurant) {
    return (
      <div className="text-center py-20 text-zinc-400">
        <p>Restaurant not found.</p>
        <Link to="/" className="btn-ghost mt-4 inline-block">Go back</Link>
      </div>
    )
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to restaurants
      </Link>

      {/* Hero */}
      <div className="card overflow-hidden mb-8">
        <div className="h-52 bg-zinc-800 relative">
          {restaurant.image_url ? (
            <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-zinc-800 to-zinc-900">🏪</div>
          )}
          {restaurant.cuisine_type && (
            <span className="absolute top-4 left-4 badge bg-brand-500/90 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {restaurant.cuisine_type}
            </span>
          )}
        </div>
        <div className="p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-50 mb-1">{restaurant.name}</h1>
            {restaurant.address && (
              <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                <MapPin size={13} />
                {restaurant.address}
              </div>
            )}
          </div>
          {restaurant.rating != null && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg self-start">
              <Star size={14} className="text-amber-400" fill="currentColor" />
              <span className="text-amber-400 font-bold text-sm">{Number(restaurant.rating).toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-zinc-100">Menu</h2>
        <span className="text-sm text-zinc-500">{menus.length} items</span>
      </div>

      {menus.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">No menu items available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {menus.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              quantity={cartItems[item.id] ?? 0}
              onAdd={() => handleAdd(item)}
              onRemove={() => handleRemove(item)}
            />
          ))}
        </div>
      )}

      {/* Floating cart */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
          <Link
            to="/cart"
            className="flex items-center gap-3 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl shadow-brand-500/30 transition-colors font-semibold"
          >
            <ShoppingCart size={18} />
            <span>View cart</span>
            <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {totalItems}
            </span>
          </Link>
        </div>
      )}
    </main>
  )
}
