import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, MapPin, ArrowRight } from 'lucide-react'
import { getCart, removeFromCart, placeOrder } from '../api/index'
import { PageSpinner } from '../components/Spinner'
import { useToast } from '../context/ToastContext'

export default function Cart() {
  const { toast }  = useToast()
  const navigate   = useNavigate()

  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [address, setAddress] = useState('')

  const fetchCart = () => {
    setLoading(true)
    getCart()
      .then((r) => {
        // Response: { items: [{cart_item_id, item_id, quantity, menu_item: {name, price, photo, ...}}] }
        setItems(r.data?.items ?? [])
      })
      .catch((err) => {
        // "no rows" = user has no cart yet, treat as empty
        if (!err.response || err.response.status >= 500) {
          setItems([])
        } else {
          toast.error('Could not load cart.')
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCart() }, [])

  const handleRemove = async (cartItemId) => {
    try {
      await removeFromCart(cartItemId)
      setItems((prev) => prev.filter((i) => i.cart_item_id !== cartItemId))
    } catch {
      toast.error('Failed to remove item.')
    }
  }

  const handlePlaceOrder = async () => {
    if (!address.trim()) { toast.error('Please enter a delivery address.'); return }
    setPlacing(true)
    try {
      // Backend only needs { delivery_address } — no cart_id, gets cart from JWT
      await placeOrder(address.trim())
      toast.success('Order placed!')
      navigate('/orders')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Failed to place order.')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return <PageSpinner />

  // item.price is the unit price from menu_item; total = sum of unit_price * quantity
  const total = items.reduce((sum, i) => {
    const price = i.menu_item?.price ?? 0
    return sum + Number(price) * Number(i.quantity)
  }, 0)

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-zinc-50 mb-6 flex items-center gap-2">
        <ShoppingCart size={24} className="text-brand-500" /> Your Cart
      </h1>

      {items.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center space-y-4">
          <span className="text-5xl block">🛒</span>
          <p className="text-zinc-400">Your cart is empty.</p>
          <Link to="/" className="inline-block px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
            Browse restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Item list */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
            {items.map((item) => {
              // menu_item is lowercase json tag on CartItems.MenuItem field
              const mi    = item.menu_item
              const name  = mi?.name  ?? `Item #${item.item_id}`
              const price = mi?.price ?? 0
              const photo = mi?.photo

              return (
                <div key={item.cart_item_id} className="flex items-center gap-4 p-4">
                  {photo && (
                    <img src={photo} alt={name} className="w-12 h-12 rounded-xl object-cover bg-zinc-800 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-100 text-sm">{name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      ₹{Number(price).toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-zinc-200 mr-2">
                    ₹{(Number(price) * Number(item.quantity)).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleRemove(item.cart_item_id)}
                    className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Summary + checkout */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex justify-between items-center text-lg font-bold text-zinc-100">
              <span>Total</span>
              <span className="text-brand-400">₹{total.toFixed(2)}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                <MapPin size={14} className="text-brand-400" /> Delivery address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State"
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
              />
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing || !address.trim()}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
            >
              {placing
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <ArrowRight size={18} />
              }
              {placing ? 'Placing order…' : 'Place order'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
