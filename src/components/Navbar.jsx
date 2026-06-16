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

  // Fetch cart count when user is logged in
  useEffect(() => {
    if (!user) { setCartCount(0); return }
    getCart()
      .then((r) => setCartCount(r.data?.items?.length ?? 0))
      .catch(() => {})
  }, [user, location.pathname])

  // WebSocket for real-time notifications
  useWebSocket(token, (msg) => {
    toast.info(msg)
    setNotifCount((n) => n + 1)
  })

  // SSE for announcements (auth required)
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
    { to: '/',        label: 'Restaurants' },
    { to: '/orders',  label: 'My Orders',   auth: true },
    { to: '/delivery', label: 'Delivery',   icon: <Truck size={14} /> },
    { to: '/admin',   label: 'Admin',        icon: <Shield size={14} /> },
  ]

  return (
    <>
      {/* Announcement strip */}
      {announcement && (
        <div className="bg-brand-500/10 border-b border-brand-500/20 px-4 py-2 text-center text-sm text-brand-400 font-medium">
          📢 {announcement}
        </div>
      )}

      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center group-hover:bg-brand-600 transition-colors">
                <UtensilsCrossed size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-zinc-50 tracking-tight">
                GO<span className="text-brand-500">·</span>Eats
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, auth, icon }) =>
                (!auth || user) ? (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === to
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
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Notification bell */}
                  <button
                    className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                    onClick={() => setNotifCount(0)}
                    title="Notifications"
                  >
                    <Bell size={20} />
                    {notifCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {notifCount > 9 ? '9+' : notifCount}
                      </span>
                    )}
                  </button>

                  {/* Cart */}
                  <Link
                    to="/cart"
                    className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                  >
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {/* User info */}
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg">
                    <div className="w-6 h-6 bg-brand-500/20 rounded-full flex items-center justify-center">
                      <User size={14} className="text-brand-400" />
                    </div>
                    <span className="text-sm text-zinc-300 font-medium truncate max-w-[100px]">
                      {user.name || 'User'}
                    </span>
                  </div>

                  <button onClick={handleLogout} className="btn-ghost p-2 rounded-lg" title="Logout">
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login"    className="btn-ghost text-sm">Login</Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign up</Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 space-y-1">
            {navLinks.map(({ to, label, auth }) =>
              (!auth || user) ? (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  {label}
                </Link>
              ) : null
            )}
          </div>
        )}
      </header>
    </>
  )
}
