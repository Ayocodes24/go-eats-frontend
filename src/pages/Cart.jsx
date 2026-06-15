import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, MapPin, ArrowRight } from 'lucide-react'
import { getCart, removeFromCart, placeOrder } from '../api/index'
import { PageSpinner } from '../components/Spinner'
import { useToast } from '../context/ToastContext'

export default function Cart() {
  const { toast }   = useToast()
  const navigate    = useNavigate()

  const [cart,     setCart]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [placing,  setPlacing]  = useState(false)
  const [address,  setAddress]  = useState('')

  const fetchCart = () => {
    setLoading(true)
    getCart()
      .then((r) => setCart(r.data))
      .catch(() => toast.error('Could not load cart.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCart() }, [])

  const handleRemove = async (menuItemId) => {
    if (!cart?.cart_id && !cart?.id) return
    const cId = cart.cart_id ?? cart.id
    try {
      await removeFromCart(cId, menuItemId)
      fetchCart()
    } catch {
      toast.error('Failed to remove item.')
    }
  }

  const handlePlaceOrder = async () => {
    if (!address.trim()) { toast.error('Please enter a delivery address.'); return }
    const cId = cart?.cart_id ?? cart?.id
    if (!cId) return
    setPlacing(true)
    try {
      const res = await placeOrder(cId, address.trim())
      const orderId = res.data?.order_id ?? res.data?.order?.id
      toast.success('Order placed successfully!')
      navigate(orderId ? `/orders/${orderId}` : '/orders')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Failed to place order.')
    } finally {
      setPlacing(false)
    }
  }

  if (loading) return <PageSpinner />

  const items   = cart?.items ?? []
  const total   = items.reduce((sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 1), 0)

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-zinc-50 mb-6 flex items-center gap-2">
        <ShoppingCart size={24} className="text-brand-500" /> Your Cart
      </h1>

      {items.length === 0 ? (
        <div className="card p-12 text-center space-y-4">
          <span className="text-5xl">🛒</span>
          <p className="text-zinc-400">Your cart is empty.</p>
          <Link to="/" className="btn-primary inline-block px-6 py-2.5">Browse restaurants</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Item list */}
          <div className="card divide-y divide-zinc-800">
            {items.map((item) => (
              <div key={item.menu_item_id ?? item.item_id ?? item.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-100 text-sm">{item.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    ₹{Number(item.price ?? 0).toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold text-zinc-200">
                  ₹{(Number(item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                </span>
                <button
                  onClick={() => handleRemove(item.menu_item_id ?? item.item_id ?? item.id)}
                  className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Order summary + checkout */}
          <div className="card p-6 space-y-5">
            <div className="flex justify-between text-lg font-bold text-zinc-100 border-t border-zinc-800 pt-4">
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
                className="input w-full"
              />
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing || !address.trim()}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60 text-base font-semibold"
            >
              {placing ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight size={18} />
              )}
              {placing ? 'Placing order…' : 'Place order'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
