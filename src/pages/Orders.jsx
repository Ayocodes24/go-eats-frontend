import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, Clock, IndianRupee } from 'lucide-react'
import { getOrders } from '../api/index'
import { PageSpinner } from '../components/Spinner'
import { useToast } from '../context/ToastContext'

// Backend field: order_status (not "status")
const STATUS_STYLES = {
  pending:      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed:    'bg-blue-500/10   text-blue-400   border-blue-500/20',
  preparing:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  in_progress:  'bg-brand-500/10  text-brand-400  border-brand-500/20',
  out_for_delivery: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  delivered:    'bg-green-500/10  text-green-400  border-green-500/20',
  cancelled:    'bg-red-500/10    text-red-400    border-red-500/20',
}

export default function Orders() {
  const { toast }             = useToast()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Response: { orders: [{order_id, order_status, total_amount, delivery_address, ...}] }
    getOrders()
      .then((r) => setOrders(r.data?.orders ?? []))
      .catch(() => toast.error('Could not load orders.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSpinner />

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-zinc-50 mb-6 flex items-center gap-2">
        <Package size={24} className="text-brand-500" /> My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center space-y-4">
          <span className="text-5xl block">📦</span>
          <p className="text-zinc-400">You haven't placed any orders yet.</p>
          <Link to="/" className="inline-block px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
            Start ordering
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            // Backend field names: order_id, order_status, total_amount
            const orderId   = order.order_id
            const rawStatus = order.order_status ?? ''
            const statusKey = rawStatus.toLowerCase().replace(/ /g, '_')
            const colorCls  = STATUS_STYLES[statusKey] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'

            return (
              <Link
                key={orderId}
                to={`/orders/${orderId}`}
                className="flex items-center gap-4 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                  <Package size={18} className="text-zinc-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-zinc-100 text-sm">Order #{orderId}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${colorCls}`}>
                      {rawStatus || 'unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                    {order.total_amount > 0 && (
                      <span className="flex items-center gap-0.5">
                        <IndianRupee size={10} />
                        {Number(order.total_amount).toFixed(2)}
                      </span>
                    )}
                    {order.delivery_address && (
                      <span className="truncate max-w-[180px]">{order.delivery_address}</span>
                    )}
                    {order.CreatedAt && (
                      <span className="flex items-center gap-1 shrink-0">
                        <Clock size={10} />
                        {new Date(order.CreatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
