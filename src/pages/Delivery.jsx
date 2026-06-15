import { useState } from 'react'
import { Truck, KeyRound, RefreshCw } from 'lucide-react'
import { addDeliveryPerson, loginDelivery, updateOrderStatus } from '../api/index'
import { useToast } from '../context/ToastContext'

const ORDER_STATUSES = ['confirmed', 'preparing', 'out_for_delivery', 'delivered']

export default function Delivery() {
  const { toast } = useToast()

  const [tab,      setTab]      = useState('login')  // 'login' | 'register' | 'dashboard'
  const [loading,  setLoading]  = useState(false)
  const [updating, setUpdating] = useState(false)
  const [orderId,  setOrderId]  = useState('')

  const [loginForm, setLoginForm] = useState({ email: '', password: '', totp_code: '' })
  const [regForm,   setRegForm]   = useState({ name: '', email: '', password: '', phone: '' })

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res    = await addDeliveryPerson(regForm)
      const secret = res.data?.totp_secret ?? res.data?.secret ?? ''
      toast.success('Registered successfully!')
      if (secret) toast.info(`Save your TOTP secret: ${secret}`)
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
      const res = await loginDelivery(loginForm)
      const tok = res.data?.token ?? res.data?.access_token
      if (!tok) throw new Error('No token in response')
      // Store delivery token so API interceptor picks it up
      localStorage.setItem('token', tok)
      toast.success('Logged in as delivery person.')
      setTab('dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Login failed. Check your TOTP code.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status) => {
    if (!orderId.trim()) { toast.error('Enter an order ID first.'); return }
    setUpdating(true)
    try {
      // Backend: POST /delivery/update-order  body: { order_id, status }
      await updateOrderStatus(parseInt(orderId), status)
      toast.success(`Order #${orderId} → "${status.replace(/_/g, ' ')}"`)
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Update failed.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
        <Truck size={24} className="text-brand-500" /> Delivery Portal
      </h1>

      {tab !== 'dashboard' && (
        <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t
                  ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Register */}
      {tab === 'register' && (
        <form onSubmit={handleRegister} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-zinc-100">Create delivery account</h2>
          {[
            { name: 'name',     label: 'Full name',  type: 'text',     ph: 'John Doe' },
            { name: 'email',    label: 'Email',       type: 'email',    ph: 'you@example.com' },
            { name: 'password', label: 'Password',    type: 'password', ph: '••••••••' },
            { name: 'phone',    label: 'Phone',       type: 'text',     ph: '+91 9999999999' },
          ].map(({ name, label, type, ph }) => (
            <div key={name} className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">{label}</label>
              <input
                type={type}
                value={regForm[name]}
                onChange={(e) => setRegForm((f) => ({ ...f, [name]: e.target.value }))}
                placeholder={ph}
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
              />
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>
      )}

      {/* Login */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
            <KeyRound size={15} className="text-brand-500" /> Login with 2FA
          </h2>
          {[
            { name: 'email',     label: 'Email',       type: 'email',    ph: 'you@example.com' },
            { name: 'password',  label: 'Password',    type: 'password', ph: '••••••••' },
            { name: 'totp_code', label: 'TOTP code',   type: 'text',     ph: '123456' },
          ].map(({ name, label, type, ph }) => (
            <div key={name} className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">{label}</label>
              <input
                type={type}
                value={loginForm[name]}
                onChange={(e) => setLoginForm((f) => ({ ...f, [name]: e.target.value }))}
                placeholder={ph}
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
              />
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      )}

      {/* Dashboard */}
      {tab === 'dashboard' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-zinc-100 flex items-center gap-2">
              <RefreshCw size={15} className="text-brand-500" /> Update order status
            </h2>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Order ID</label>
              <input
                type="number"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. 42"
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ORDER_STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={updating || !orderId.trim()}
                  onClick={() => handleStatusUpdate(s)}
                  className="py-2.5 px-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:border-brand-500/50 hover:bg-brand-500/10 hover:text-brand-300 text-zinc-400 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('token')
              setTab('login')
              setOrderId('')
              toast.info('Logged out of delivery portal.')
            }}
            className="w-full py-2.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Log out of delivery portal
          </button>
        </div>
      )}
    </main>
  )
}
