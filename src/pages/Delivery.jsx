import { useState, useEffect } from 'react'
import { Truck, KeyRound, Package, CheckCircle2 } from 'lucide-react'
import { addDeliveryPerson, loginDelivery, getDeliveries, updateOrderStatus } from '../api/index'
import { PageSpinner } from '../components/Spinner'
import { useToast } from '../context/ToastContext'

const ORDER_STATUSES = ['confirmed', 'preparing', 'out_for_delivery', 'delivered']

export default function Delivery() {
  const { toast } = useToast()

  const [tab,        setTab]        = useState('login')      // 'login' | 'register' | 'dashboard'
  const [token,      setToken]      = useState('')
  const [totp,       setTotp]       = useState('')
  const [deliveries, setDeliveries] = useState([])
  const [loading,    setLoading]    = useState(false)
  const [updating,   setUpdating]   = useState(null)

  const [loginForm, setLoginForm] = useState({ email: '', password: '', totp_code: '' })
  const [regForm,   setRegForm]   = useState({ name: '', email: '', password: '', phone: '' })

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await addDeliveryPerson(regForm)
      toast.success('Registered! Scan the QR code / save your TOTP secret to log in.')
      const secret = res.data?.totp_secret ?? res.data?.secret
      if (secret) toast.info(`TOTP secret: ${secret}`)
      setTab('login')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res   = await loginDelivery(loginForm)
      const tok   = res.data?.token ?? res.data?.access_token
      if (!tok) throw new Error('No token in response')
      setToken(tok)
      toast.success('Logged in as delivery person.')
      setTab('dashboard')
      fetchDeliveries(tok)
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Login failed. Check TOTP code.')
    } finally {
      setLoading(false)
    }
  }

  const fetchDeliveries = async (tok = token) => {
    if (!tok) return
    try {
      const res = await getDeliveries()
      setDeliveries(res.data?.deliveries ?? res.data ?? [])
    } catch {
      toast.error('Could not load deliveries.')
    }
  }

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId)
    try {
      await updateOrderStatus(orderId, status)
      toast.success(`Status updated to "${status}".`)
      fetchDeliveries()
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Update failed.')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
        <Truck size={24} className="text-brand-500" /> Delivery Portal
      </h1>

      {tab !== 'dashboard' && (
        <div className="flex gap-2 mb-6">
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Register */}
      {tab === 'register' && (
        <form onSubmit={handleRegister} className="card p-6 space-y-4">
          <h2 className="font-semibold text-zinc-100">Register as delivery person</h2>
          {[
            { name: 'name',     label: 'Full name',    type: 'text',     ph: 'John Doe' },
            { name: 'email',    label: 'Email',         type: 'email',    ph: 'you@example.com' },
            { name: 'password', label: 'Password',      type: 'password', ph: '••••••••' },
            { name: 'phone',    label: 'Phone',         type: 'text',     ph: '+91 9999999999' },
          ].map(({ name, label, type, ph }) => (
            <div key={name} className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">{label}</label>
              <input
                type={type}
                value={regForm[name]}
                onChange={(e) => setRegForm((f) => ({ ...f, [name]: e.target.value }))}
                placeholder={ph}
                required
                className="input w-full"
              />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>
      )}

      {/* Login */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} className="card p-6 space-y-4">
          <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
            <KeyRound size={16} className="text-brand-500" /> Delivery login (2FA)
          </h2>
          {[
            { name: 'email',     label: 'Email',      type: 'email',    ph: 'you@example.com' },
            { name: 'password',  label: 'Password',   type: 'password', ph: '••••••••' },
            { name: 'totp_code', label: 'TOTP code',  type: 'text',     ph: '123456' },
          ].map(({ name, label, type, ph }) => (
            <div key={name} className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">{label}</label>
              <input
                type={type}
                value={loginForm[name]}
                onChange={(e) => setLoginForm((f) => ({ ...f, [name]: e.target.value }))}
                placeholder={ph}
                required
                className="input w-full"
              />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      )}

      {/* Dashboard */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
              <Package size={16} className="text-brand-500" /> Assigned deliveries
            </h2>
            <button onClick={() => fetchDeliveries()} className="btn-ghost text-xs px-3 py-1.5">Refresh</button>
          </div>

          {deliveries.length === 0 ? (
            <div className="card p-10 text-center text-zinc-500 space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-zinc-700" />
              <p>No deliveries assigned yet.</p>
            </div>
          ) : (
            deliveries.map((d) => {
              const orderId = d.order_id ?? d.id
              const current = (d.status ?? '').toLowerCase().replace(/ /g, '_')
              return (
                <div key={orderId} className="card p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-zinc-100">Order #{orderId}</p>
                      {d.delivery_address && (
                        <p className="text-xs text-zinc-500 mt-0.5">{d.delivery_address}</p>
                      )}
                    </div>
                    <span className="badge text-xs px-2 py-0.5 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full">
                      {d.status ?? 'unknown'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ORDER_STATUSES.map((s) => (
                      <button
                        key={s}
                        disabled={s === current || updating === orderId}
                        onClick={() => handleStatusUpdate(orderId, s)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-40 ${
                          s === current
                            ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                        }`}
                      >
                        {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </main>
  )
}
