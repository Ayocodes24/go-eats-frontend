import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Bell, LogOut, User, Truck, UtensilsCrossed, Menu, X, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useWebSocket } from '../hooks/useWebSocket'
import { getCart } from '../api/index'

export default function Navbar() {
  const { user, token, logout } = useAuth()
  const { toast } = useToast()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [cartCount,    setCartCount]    = useState(0)
  const [notifCount,   setNotifCount]   = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const [mobileOpen,   setMobileOpen]   = useState(false)

  useEffect(() => {
    if (!user) { setCartCount(0); return }
    getCart()
      .then((r) => setCartCount(r.data?.items?.length ?? 0))
      .catch(() => {})
  }, [user, location.pathname])

  useWebSocket(token, (msg) => {
    toast.info(msg)
    setNotifCount((n) => n + 1)
  })

  useEffect(() => {
    if (!token) return
    let ctrl = new AbortController()
    ;(async () => {
      try {
        const res = await fetch('/api/announcements/events', {
          headers: { Authorization: `Bearer ${token}` },
          signal: ctrl.signal,
        })
        const reader = res.body.getReader()
        const dec    = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const text = dec.decode(value)
          const match = text.match(/data:\s*(.+)/)
          if (match) setAnnouncement(match[1].trim())
        }
      } catch { /* aborted or SSE unavailable */ }
    })()
    return () => ctrl.abort()
  }, [token])

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.info('Logged out.')
  }

  const navLinks = [
    { to: '/',         label: 'Restaurants' },
    { to: '/orders',   label: 'My Orders',  auth: true },
    { to: '/delivery', label: 'Delivery',   icon: <Truck size={13} /> },
    { to: '/admin',    label: 'Admin',      icon: <Shield size={13} /> },
  ]

  const isActive = (to) => location.pathname === to

  return (
    <>
      {announcement && (
        <div className="bg-gradient-to-r from-brand-600/20 via-brand-500/15 to-brand-600/20 border-b border-brand-500/20 px-4 py-2 text-center text-sm text-brand-300 font-medium">
          📢 {announcement}
        </div>
      )}

      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-shadow">
                <UtensilsCrossed size={18} className="text-white" />
              </div>
              <span className="text-[1.15rem] font-bold tracking-tight">
                <span className="text-zinc-100">GO</span>
                <span className="text-brand-400">·</span>
                <span className="text-zinc-100">Eats</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map(({ to, label, auth, icon }) =>
                (!auth || user) ? (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive(to)
                        ? 'bg-zinc-800 text-zinc-50'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                    }`}
                  >
                    {icon}{label}
                  </Link>
                ) : null
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-1.5">
              {user ? (
                <>
                  <button
                    className="relative p-2.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
                    onClick={() => setNotifCount(0)}
                  >
                    <Bell size={19} />
                    {notifCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {notifCount > 9 ? '9+' : notifCount}
                      </span>
                    )}
                  </button>

                  <Link
                    to="/cart"
                    className="relative p-2.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
                  >
                    <ShoppingCart size={19} />
                    {cartCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl ml-1">
                    <div className="w-6 h-6 bg-gradient-to-br from-brand-400/30 to-brand-600/20 rounded-full flex items-center justify-center border border-brand-500/20">
                      <User size={13} className="text-brand-400" />
                    </div>
                    <span className="text-sm text-zinc-300 font-medium truncate max-w-[100px]">
                      {user.name || 'User'}
                    </span>
                  </div>

                  <button onClick={handleLogout} className="p-2.5 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all" title="Logout">
                    <LogOut size={17} />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login"    className="text-sm font-medium text-zinc-400 hover:text-zinc-100 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-all">Login</Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign up</Link>
                </div>
              )}

              <button
                className="md:hidden p-2.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-zinc-800/60 bg-zinc-950/95 backdrop-blur-xl px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, auth, icon }) =>
              (!auth || user) ? (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive(to) ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                  }`}
                >
                  {icon}{label}
                </Link>
              ) : null
            )}
          </div>
        )}
      </header>
    </>
  )
}
