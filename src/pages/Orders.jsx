import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight, Clock } from 'lucide-react'
import { getOrders } from '../api/index'
import { PageSpinner } from '../components/Spinner'
import { useToast } from '../context/ToastContext'

const statusColors = {
  pending:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed:  'bg-blue-500/10   text-blue-400   border-blue-500/20',
  preparing:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  out_for_delivery: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
  delivered:  'bg-green-500/10  text-green-400  border-green-500/20',
  cancelled:  'bg-red-500/10    text-red-400    border-red-500/20',
}

export default function Orders() {
  const { toast }                = useToast()
  const [orders,  setOrders]     = useState([])
  const [loading, setLoading]    = useState(true)

  useEffect(() => {
    getOrders()
      .then((r) => setOrders(r.data?.orders ?? r.data ?? []))
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
        <div className="card p-12 text-center space-y-4">
          <span className="text-5xl">📦</span>
          <p className="text-zinc-400">You haven't placed any orders yet.</p>
          <Link to="/" className="btn-primary inline-block px-6 py-2.5">Start ordering</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const statusKey = (order.status ?? '').toLowerCase().replace(/ /g, '_')
            const colorCls  = statusColors[statusKey] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'
            return (
              <Link
                key={order.id ?? order.order_id}
                to={`/orders/${order.id ?? order.order_id}`}
                className="card flex items-center gap-4 p-5 hover:border-zinc-600 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                  <Package size={18} className="text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-zinc-100 text-sm">
                      Order #{order.id ?? order.order_id}
                    </span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${colorCls}`}>
                      {order.status ?? 'unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    {order.delivery_address && (
                      <span className="truncate max-w-[200px]">{order.delivery_address}</span>
                    )}
                    {order.created_at && (
                      <span className="flex items-center gap-1 shrink-0">
                        <Clock size={10} />
                        {new Date(order.created_at).toLocaleDateString()}
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
