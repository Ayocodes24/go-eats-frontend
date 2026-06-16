import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, ShoppingCart, Info } from 'lucide-react'
import { getRestaurant, getMenus, getCart, addToCart, removeFromCart } from '../api/index'
import MenuItemCard from '../components/MenuItemCard'
import { PageSpinner } from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function RestaurantDetail() {
  const { id }    = useParams()
  const { user }  = useAuth()
  const { toast } = useToast()

  const [restaurant,  setRestaurant]  = useState(null)
  const [menus,       setMenus]       = useState([])
  // { item_id: quantity } for UI display
  const [cartQty,     setCartQty]     = useState({})
  // { item_id: cart_item_id } for deletion
  const [cartItemIds, setCartItemIds] = useState({})
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([getRestaurant(id), getMenus(id)])
      .then(([rRes, mRes]) => {
        // Single restaurant returned directly
        setRestaurant(rRes.data)
        // Menu is raw array
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
        const qtyMap = {}
        const idMap  = {}
        items.forEach((i) => {
          qtyMap[i.item_id] = (qtyMap[i.item_id] ?? 0) + Number(i.quantity)
          idMap[i.item_id]  = i.cart_item_id
        })
        setCartQty(qtyMap)
        setCartItemIds(idMap)
      })
      .catch(() => {
        // 500 "no rows" means user has no cart yet — start with empty
        setCartQty({})
        setCartItemIds({})
      })
  }, [user])

  useEffect(() => { refreshCart() }, [refreshCart])

  const handleAdd = async (item) => {
    if (!user) { toast.info('Please log in to add items to cart.'); return }
    try {
      // Backend expects: { item_id, restaurant_id, quantity }
      await addToCart({ item_id: item.menu_id, restaurant_id: parseInt(id), quantity: 1 })
      setCartQty((prev) => ({ ...prev, [item.menu_id]: (prev[item.menu_id] ?? 0) + 1 }))
      // Refresh to get the cart_item_id for new items
      refreshCart()
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Could not add item to cart.')
    }
  }

  const handleRemove = async (item) => {
    const cartItemId = cartItemIds[item.menu_id]
    if (!cartItemId) return
    try {
      // Backend expects: DELETE /cart/remove/:cart_item_id
      await removeFromCart(cartItemId)
      setCartQty((prev) => {
        const qty = (prev[item.menu_id] ?? 1) - 1
        if (qty <= 0) { const n = { ...prev }; delete n[item.menu_id]; return n }
        return { ...prev, [item.menu_id]: qty }
      })
      refreshCart()
    } catch {
      toast.error('Could not remove item.')
    }
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

  // Backend fields: restaurant_id, name, store_image, description, address, city, state
  const location = [restaurant.city, restaurant.state].filter(Boolean).join(', ')

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 text-sm mb-6 transition-colors">
        <ArrowLeft size={16} /> All restaurants
      </Link>

      {/* Hero card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-8">
        <div className="h-52 bg-zinc-800 relative">
          {restaurant.store_image ? (
            <img src={restaurant.store_image} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🏪</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold text-zinc-50 mb-2">{restaurant.name}</h1>

          {restaurant.description && (
            <p className="text-zinc-400 text-sm mb-3 flex items-start gap-1.5">
              <Info size={13} className="text-zinc-600 mt-0.5 shrink-0" />
              {restaurant.description}
            </p>
          )}

          {(restaurant.address || location) && (
            <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
              <MapPin size={13} className="text-brand-400 shrink-0" />
              {[restaurant.address, location].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-zinc-100">Menu</h2>
        <span className="text-sm text-zinc-500">{menus.length} items</span>
      </div>

      {menus.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">No menu items yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {menus.map((item) => (
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
            className="flex items-center gap-3 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3.5 rounded-2xl shadow-2xl shadow-brand-500/30 transition-colors font-semibold text-sm"
          >
            <ShoppingCart size={18} />
            <span>View cart</span>
            <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {totalItems}
            </span>
          </Link>
        </div>
      )}
    </main>
  )
}
