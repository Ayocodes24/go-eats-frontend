import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Package, MapPin, Truck, Clock, IndianRupee } from 'lucide-react'
import { getOrders, getOrderItems, getOrderDeliveries } from '../api/index'
import { PageSpinner } from '../components/Spinner'
import { useToast } from '../context/ToastContext'

// order_status values seen: pending, in_progress, confirmed, preparing, out_for_delivery, delivered, cancelled
const STATUS_STEPS   = ['pending', 'confirmed', 'preparing', 'in_progress', 'out_for_delivery', 'delivered']
const STATUS_COLORS  = {
  pending:           'text-yellow-400',
  confirmed:         'text-blue-400',
  preparing:         'text-purple-400',
  in_progress:       'text-brand-400',
  out_for_delivery:  'text-orange-400',
  delivered:         'text-green-400',
  cancelled:         'text-red-400',
}

export default function OrderDetail() {
  const { id }    = useParams()
  const { toast } = useToast()

  const [order,      setOrder]      = useState(null)
  const [items,      setItems]      = useState([])
  const [deliveries, setDeliveries] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      getOrders(),
      getOrderItems(id),
      getOrderDeliveries(id).catch(() => ({ data: {} })),
    ])
      .then(([oRes, iRes, dRes]) => {
        // Orders list: { orders: [{order_id, order_status, total_amount, delivery_address}] }
        const allOrders = oRes.data?.orders ?? []
        const found     = allOrders.find((o) => String(o.order_id) === String(id))
        setOrder(found ?? null)

        // Order items: { orders: [{order_item_id, item_id, quantity, price, MenuItem: {...}}] }
        // Note: backend uses key "orders" for items too, and "MenuItem" (capital M)
        setItems(iRes.data?.orders ?? [])

        // Delivery info: { delivery_info: [...] }
        setDeliveries(dRes.data?.delivery_info ?? [])
      })
      .catch(() => toast.error('Failed to load order details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageSpinner />

  if (!order) {
    return (
      <div className="text-center py-20 text-zinc-400">
        <p>Order not found.</p>
        <Link to="/orders" className="text-brand-400 hover:underline mt-4 inline-block">← Back to orders</Link>
      </div>
    )
  }

  // Backend field: order_status (not "status"), order_id (not "id")
  const rawStatus   = order.order_status ?? ''
  const statusKey   = rawStatus.toLowerCase().replace(/ /g, '_')
  const stepIndex   = STATUS_STEPS.indexOf(statusKey)
  const isCancelled = statusKey === 'cancelled'
  const colorCls    = STATUS_COLORS[statusKey] ?? 'text-zinc-400'

  // Items total: backend pre-computes price = unit_price * quantity in order_items.price
  const total = items.reduce((s, i) => s + Number(i.price ?? 0), 0)

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 text-sm transition-colors">
        <ArrowLeft size={16} /> Back to orders
      </Link>

      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-zinc-50">Order #{order.order_id}</h1>
            {order.CreatedAt && (
              <p className="text-sm text-zinc-500 mt-0.5 flex items-center gap-1">
                <Clock size={12} /> {new Date(order.CreatedAt).toLocaleString()}
              </p>
            )}
          </div>
          <span className={`text-sm font-semibold ${colorCls}`}>{rawStatus || 'Unknown'}</span>
        </div>

        {/* Progress tracker */}
        {!isCancelled && stepIndex >= 0 && (
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              {STATUS_STEPS.map((s, i) => (
                <div key={s} className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-2.5 h-2.5 rounded-full transition-colors ${i <= stepIndex ? 'bg-brand-500' : 'bg-zinc-700'}`} />
                  <span className={`text-[9px] text-center leading-tight capitalize ${i <= stepIndex ? 'text-brand-400' : 'text-zinc-600'}`}>
                    {s.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${((stepIndex + 1) / STATUS_STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {order.delivery_address && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <MapPin size={13} className="text-brand-400 shrink-0" />
            {order.delivery_address}
          </div>
        )}

        {order.total_amount > 0 && (
          <div className="flex items-center gap-1 text-sm text-zinc-400 mt-2">
            <IndianRupee size={13} className="text-brand-400" />
            {Number(order.total_amount).toFixed(2)} total
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <Package size={15} className="text-brand-500" />
          <h2 className="font-semibold text-zinc-100 text-sm">Items ordered</h2>
        </div>

        {items.length === 0 ? (
          <p className="p-6 text-zinc-500 text-sm text-center">No items found.</p>
        ) : (
          <div className="divide-y divide-zinc-800">
            {items.map((item) => {
              // Backend key is "MenuItem" (capital M) — json:"MenuItem" tag on OrderItems struct
              const menuItem = item.MenuItem
              const name     = menuItem?.name ?? `Item #${item.item_id}`
              const photo    = menuItem?.photo
              // item.price is already unit_price * quantity (pre-computed by backend)
              return (
                <div key={item.order_item_id} className="flex items-center gap-4 p-4">
                  {photo && (
                    <img src={photo} alt={name} className="w-12 h-12 rounded-xl object-cover bg-zinc-800 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-100 font-medium text-sm">{name}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {menuItem?.price ? `₹${Number(menuItem.price).toFixed(2)}` : ''} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-zinc-300 font-semibold text-sm">
                    ₹{Number(item.price).toFixed(2)}
                  </span>
                </div>
              )
            })}
            {total > 0 && (
              <div className="flex items-center justify-between p-4 font-bold text-zinc-100 bg-zinc-800/40">
                <span>Total</span>
                <span className="text-brand-400">₹{total.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delivery updates */}
      {deliveries.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h2 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
            <Truck size={15} className="text-brand-500" /> Delivery updates
          </h2>
          <div className="space-y-3">
            {deliveries.map((d, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-zinc-200 capitalize">{d.delivery_status ?? d.status}</p>
                  {d.UpdatedAt && (
                    <p className="text-zinc-600 text-xs mt-0.5">{new Date(d.UpdatedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
