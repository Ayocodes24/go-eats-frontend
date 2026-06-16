import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Plus, Trash2, RefreshCw, Utensils, Store, Zap, ChevronDown } from 'lucide-react'
import {
  getRestaurants, addRestaurant, deleteRestaurant,
  getMenus, addMenuItem, deleteMenuItem,
} from '../api/index'
import { useToast } from '../context/ToastContext'
import { PageSpinner } from '../components/Spinner'

// ─── Curated food images (reliable CDN, no API key needed) ──────────────────
const RESTAURANT_IMAGES = [
  { label: 'Italian / Pizza', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80' },
  { label: 'American / Burgers', url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80' },
  { label: 'Japanese / Sushi', url: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&q=80' },
  { label: 'Indian', url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80' },
  { label: 'Fine Dining', url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' },
  { label: 'Mexican', url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80' },
  { label: 'Chinese', url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80' },
  { label: 'Cafe / Bakery', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80' },
]

const MENU_IMAGES = [
  { label: 'Margherita Pizza', url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80' },
  { label: 'Pepperoni Pizza', url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80' },
  { label: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
  { label: 'Sushi Roll', url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
  { label: 'Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
  { label: 'Pasta', url: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80' },
  { label: 'Tacos', url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80' },
  { label: 'Salad', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80' },
  { label: 'Garlic Bread', url: 'https://images.unsplash.com/photo-1619985813593-a7d08551e6f0?w=400&q=80' },
  { label: 'Noodles', url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80' },
  { label: 'Dessert', url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80' },
  { label: 'Sandwich', url: 'https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=400&q=80' },
]

const CUISINES = ['Indian', 'Italian', 'American', 'Japanese', 'Mexican', 'Chinese', 'Thai', 'Mediterranean', 'Continental', 'Fast Food', 'Cafe']

// ─── Mock seed data ──────────────────────────────────────────────────────────
const SEED_RESTAURANTS = [
  {
    name: 'Pizza Palace', city: 'Mumbai', state: 'Maharashtra', address: '12 Marine Drive',
    description: '[Italian] Authentic Neapolitan pizzas baked in a wood-fired oven',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    menus: [
      { name: 'Margherita Pizza', description: 'Fresh tomato, mozzarella, basil', price: 299, category: 'Pizza', photo: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80' },
      { name: 'Pepperoni Pizza', description: 'Loaded with spicy pepperoni slices', price: 399, category: 'Pizza', photo: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80' },
      { name: 'Garlic Bread', description: 'Toasted bread with herb butter', price: 149, category: 'Sides', photo: 'https://images.unsplash.com/photo-1619985813593-a7d08551e6f0?w=400&q=80' },
      { name: 'Tiramisu', description: 'Classic Italian coffee dessert', price: 199, category: 'Dessert', photo: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80' },
    ],
  },
  {
    name: 'Burger Barn', city: 'New Delhi', state: 'Delhi', address: '45 Connaught Place',
    description: '[American] Smash burgers, hand-cut fries and thick milkshakes',
    image_url: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80',
    menus: [
      { name: 'Classic Smash Burger', description: 'Double patty, American cheese, pickles', price: 299, category: 'Burgers', photo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
      { name: 'Crispy Chicken Burger', description: 'Fried chicken, sriracha mayo, coleslaw', price: 279, category: 'Burgers', photo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80' },
      { name: 'Veggie Burger', description: 'Black bean patty, avocado, lettuce', price: 229, category: 'Burgers', photo: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&q=80' },
      { name: 'Loaded Fries', description: 'Crispy fries with cheese sauce and jalapeños', price: 149, category: 'Sides', photo: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=400&q=80' },
    ],
  },
  {
    name: 'Sushi Station', city: 'Bangalore', state: 'Karnataka', address: '8 Indiranagar 100ft Rd',
    description: '[Japanese] Fresh sushi, sashimi and ramen made by trained Japanese chefs',
    image_url: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&q=80',
    menus: [
      { name: 'California Roll (8 pcs)', description: 'Crab, avocado, cucumber', price: 449, category: 'Rolls', photo: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80' },
      { name: 'Salmon Nigiri (2 pcs)', description: 'Fresh Atlantic salmon over vinegared rice', price: 349, category: 'Nigiri', photo: 'https://images.unsplash.com/photo-1617196034099-0b938caf7308?w=400&q=80' },
      { name: 'Spicy Tuna Roll', description: 'Tuna, sriracha, scallions', price: 499, category: 'Rolls', photo: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&q=80' },
      { name: 'Miso Ramen', description: 'Rich miso broth, chashu pork, soft egg', price: 399, category: 'Ramen', photo: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80' },
    ],
  },
  {
    name: 'Biryani Blues', city: 'Hyderabad', state: 'Telangana', address: '3 Banjara Hills Road',
    description: '[Indian] Slow-cooked dum biryani recipes passed down for generations',
    image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    menus: [
      { name: 'Chicken Dum Biryani', description: 'Marinated chicken, aged basmati, saffron', price: 349, category: 'Biryani', photo: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
      { name: 'Mutton Biryani', description: 'Tender mutton slow-cooked over 4 hours', price: 449, category: 'Biryani', photo: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80' },
      { name: 'Veg Biryani', description: 'Seasonal vegetables, caramelised onions', price: 249, category: 'Biryani', photo: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400&q=80' },
      { name: 'Shahi Paneer', description: 'Cottage cheese in rich cashew gravy', price: 279, category: 'Curry', photo: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80' },
    ],
  },
  {
    name: 'Pasta Paradise', city: 'Chennai', state: 'Tamil Nadu', address: '67 Anna Nagar',
    description: '[Italian] Hand-made pasta with sauces simmered for hours',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    menus: [
      { name: 'Pasta Carbonara', description: 'Egg, pecorino, guanciale, black pepper', price: 349, category: 'Pasta', photo: 'https://images.unsplash.com/photo-1673442000800-17eb5f35e2a7?w=400&q=80' },
      { name: 'Pasta Arrabbiata', description: 'Spicy tomato sauce, garlic, chilli', price: 299, category: 'Pasta', photo: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80' },
      { name: 'Mushroom Risotto', description: 'Arborio rice, porcini, parmesan', price: 379, category: 'Risotto', photo: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80' },
      { name: 'Panna Cotta', description: 'Vanilla cream with berry coulis', price: 179, category: 'Dessert', photo: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80' },
    ],
  },
  {
    name: 'Taco Town', city: 'Pune', state: 'Maharashtra', address: '22 Koregaon Park',
    description: '[Mexican] Street-style tacos, burritos and fresh guacamole',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    menus: [
      { name: 'Chicken Tacos (3 pcs)', description: 'Grilled chicken, pico de gallo, lime crema', price: 279, category: 'Tacos', photo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80' },
      { name: 'Beef Burrito', description: 'Slow-braised beef, rice, beans, guac', price: 349, category: 'Burritos', photo: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80' },
      { name: 'Loaded Nachos', description: 'Tortilla chips, cheese, jalapeños, salsa', price: 249, category: 'Snacks', photo: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&q=80' },
      { name: 'Mango Margarita', description: 'Fresh mango, lime, mint cooler', price: 149, category: 'Drinks', photo: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80' },
    ],
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────
function ImagePicker({ value, onChange, options, label }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      <div className="grid grid-cols-4 gap-2">
        {options.map((img) => (
          <button
            key={img.url}
            type="button"
            onClick={() => onChange(img.url)}
            className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${
              value === img.url ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
            {value === img.url && (
              <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
      <input
        type="url"
        placeholder="Or paste a custom image URL…"
        value={options.some(o => o.url === value) ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 transition-all"
      />
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all'

// ─── Main component ───────────────────────────────────────────────────────────
export default function Admin() {
  const { toast }   = useToast()
  const navigate    = useNavigate()

  // Auth gate
  const [unlocked,  setUnlocked]  = useState(() => sessionStorage.getItem('admin_unlocked') === '1')
  const [adminPass, setAdminPass] = useState('')

  const [tab,            setTab]            = useState('restaurants')
  const [restaurants,    setRestaurants]    = useState([])
  const [menus,          setMenus]          = useState([])
  const [selectedRestId, setSelectedRestId] = useState('')
  const [loading,        setLoading]        = useState(false)
  const [seeding,        setSeeding]        = useState(false)

  const [restForm, setRestForm] = useState({
    name: '', description: '', address: '', city: '', state: '', image_url: '',
    cuisine: '',
  })
  const [menuForm, setMenuForm] = useState({
    name: '', description: '', price: '', category: '', photo: '', available: true,
  })

  const ADMIN_PASSWORD = 'admin@goeats'

  const unlock = (e) => {
    e.preventDefault()
    if (adminPass === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_unlocked', '1')
      setUnlocked(true)
    } else {
      toast.error('Wrong password.')
    }
  }

  const loadRestaurants = useCallback(() => {
    getRestaurants().then((r) => setRestaurants(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }, [])

  const loadMenus = useCallback((restId) => {
    if (!restId) { setMenus([]); return }
    getMenus(restId).then((r) => setMenus(Array.isArray(r.data) ? r.data : [])).catch(() => setMenus([]))
  }, [])

  useEffect(() => { if (unlocked) loadRestaurants() }, [unlocked, loadRestaurants])
  useEffect(() => { loadMenus(selectedRestId) }, [selectedRestId, loadMenus])

  // ── Add restaurant ──────────────────────────────────────
  const handleAddRestaurant = async (e) => {
    e.preventDefault()
    if (!restForm.name.trim()) { toast.error('Name is required.'); return }
    setLoading(true)
    try {
      const cuisine = restForm.cuisine ? `[${restForm.cuisine}] ` : ''
      await addRestaurant({
        name:        restForm.name,
        description: `${cuisine}${restForm.description}`,
        address:     restForm.address,
        city:        restForm.city,
        state:       restForm.state,
        image_url:   restForm.image_url,
      })
      toast.success(`"${restForm.name}" added!`)
      setRestForm({ name: '', description: '', address: '', city: '', state: '', image_url: '', cuisine: '' })
      loadRestaurants()
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Failed to add restaurant.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRestaurant = async (id, name) => {
    try {
      await deleteRestaurant(id)
      toast.success(`"${name}" deleted.`)
      loadRestaurants()
      if (String(selectedRestId) === String(id)) { setSelectedRestId(''); setMenus([]) }
    } catch {
      toast.error('Delete failed.')
    }
  }

  // ── Add menu item ───────────────────────────────────────
  const handleAddMenuItem = async (e) => {
    e.preventDefault()
    if (!selectedRestId) { toast.error('Select a restaurant first.'); return }
    if (!menuForm.name.trim() || !menuForm.price) { toast.error('Name and price are required.'); return }
    setLoading(true)
    try {
      await addMenuItem({
        restaurant_id: parseInt(selectedRestId),
        name:          menuForm.name,
        description:   menuForm.description,
        price:         parseFloat(menuForm.price),
        category:      menuForm.category,
        photo:         menuForm.photo,
        available:     menuForm.available,
      })
      toast.success(`"${menuForm.name}" added!`)
      setMenuForm({ name: '', description: '', price: '', category: '', photo: '', available: true })
      loadMenus(selectedRestId)
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Failed to add menu item.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMenuItem = async (restaurantId, menuId, name) => {
    try {
      await deleteMenuItem(restaurantId, menuId)
      toast.success(`"${name}" removed.`)
      loadMenus(selectedRestId)
    } catch {
      toast.error('Delete failed.')
    }
  }

  // ── Seed all mock data ──────────────────────────────────
  const handleSeedAll = async () => {
    setSeeding(true)
    toast.info('Seeding data… this may take a moment.')
    try {
      for (const r of SEED_RESTAURANTS) {
        const res = await addRestaurant({
          name: r.name, description: r.description, address: r.address,
          city: r.city, state: r.state, image_url: r.image_url,
        })
        // Find the newly created restaurant by refreshing the list
        const listRes = await getRestaurants()
        const all     = Array.isArray(listRes.data) ? listRes.data : []
        const created = [...all].reverse().find((x) => x.name === r.name)
        if (created) {
          for (const m of r.menus) {
            await addMenuItem({ restaurant_id: created.restaurant_id, ...m })
          }
        }
      }
      toast.success('All mock data seeded!')
      loadRestaurants()
    } catch (err) {
      toast.error('Seeding failed: ' + (err.response?.data?.error ?? err.message))
    } finally {
      setSeeding(false)
    }
  }

  // ─── Password gate ────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-2xl mb-4">
              <Shield size={26} className="text-brand-500" />
            </div>
            <h1 className="text-xl font-bold text-zinc-50">Admin Access</h1>
            <p className="text-zinc-500 text-sm mt-1">Enter the admin password to continue</p>
          </div>
          <form onSubmit={unlock} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <input
              type="password"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              placeholder="Admin password"
              autoFocus
              className={inputCls}
            />
            <button type="submit" className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors">
              Unlock
            </button>
            <p className="text-center text-xs text-zinc-600">Hint: admin@goeats</p>
          </form>
        </div>
      </div>
    )
  }

  // ─── Admin Dashboard ─────────────────────────────────────────────────────
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
            <Shield size={22} className="text-brand-500" /> Admin Dashboard
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} in DB</p>
        </div>
        <button
          onClick={handleSeedAll}
          disabled={seeding}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          {seeding
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Zap size={16} />
          }
          {seeding ? 'Seeding…' : 'Seed Mock Data'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
        {[
          { key: 'restaurants', icon: <Store size={15} />, label: 'Restaurants' },
          { key: 'menus',       icon: <Utensils size={15} />, label: 'Menu Items' },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ─── RESTAURANTS TAB ─────────────────────────────── */}
      {tab === 'restaurants' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              <Plus size={15} className="text-brand-500" /> Add Restaurant
            </h2>
            <form onSubmit={handleAddRestaurant} className="space-y-3">
              <Field label="Name *">
                <input value={restForm.name} onChange={(e) => setRestForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Pizza Palace" required className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                  <input value={restForm.city} onChange={(e) => setRestForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="Mumbai" className={inputCls} />
                </Field>
                <Field label="State">
                  <input value={restForm.state} onChange={(e) => setRestForm(f => ({ ...f, state: e.target.value }))}
                    placeholder="Maharashtra" className={inputCls} />
                </Field>
              </div>
              <Field label="Address">
                <input value={restForm.address} onChange={(e) => setRestForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="12 Main St" className={inputCls} />
              </Field>
              <Field label="Cuisine Type">
                <select value={restForm.cuisine} onChange={(e) => setRestForm(f => ({ ...f, cuisine: e.target.value }))}
                  className={inputCls}>
                  <option value="">Select cuisine…</option>
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Description">
                <textarea value={restForm.description} onChange={(e) => setRestForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of the restaurant" rows={2} className={inputCls + ' resize-none'} />
              </Field>
              <ImagePicker
                label="Restaurant Image"
                value={restForm.image_url}
                onChange={(url) => setRestForm(f => ({ ...f, image_url: url }))}
                options={RESTAURANT_IMAGES}
              />
              {restForm.image_url && (
                <img src={restForm.image_url} alt="preview" className="w-full h-32 object-cover rounded-xl border border-zinc-700" />
              )}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                Add Restaurant
              </button>
            </form>
          </div>

          {/* Restaurant list */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-100 text-sm">Existing Restaurants</h2>
              <button onClick={loadRestaurants} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>
            <div className="divide-y divide-zinc-800 max-h-[520px] overflow-y-auto">
              {restaurants.length === 0 ? (
                <p className="p-8 text-center text-zinc-500 text-sm">No restaurants yet. Add one or seed mock data.</p>
              ) : restaurants.map((r) => (
                <div key={r.restaurant_id} className="flex items-center gap-3 p-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                    {r.store_image
                      ? <img src={r.store_image} alt={r.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl opacity-30">🍽️</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-100 text-sm truncate">{r.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{r.city}, {r.state}</p>
                  </div>
                  <span className="text-xs text-zinc-600 shrink-0">#{r.restaurant_id}</span>
                  <button onClick={() => handleDeleteRestaurant(r.restaurant_id, r.name)}
                    className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MENU ITEMS TAB ──────────────────────────────── */}
      {tab === 'menus' && (
        <div className="space-y-5">
          {/* Restaurant selector */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <Field label="Select Restaurant">
              <div className="relative">
                <select
                  value={selectedRestId}
                  onChange={(e) => setSelectedRestId(e.target.value)}
                  className={inputCls + ' appearance-none pr-10'}
                >
                  <option value="">Choose a restaurant…</option>
                  {restaurants.map((r) => (
                    <option key={r.restaurant_id} value={r.restaurant_id}>
                      #{r.restaurant_id} — {r.name} ({r.city})
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </Field>
          </div>

          {selectedRestId && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add menu item form */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h2 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
                  <Plus size={15} className="text-brand-500" /> Add Menu Item
                </h2>
                <form onSubmit={handleAddMenuItem} className="space-y-3">
                  <Field label="Item Name *">
                    <input value={menuForm.name} onChange={(e) => setMenuForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Margherita Pizza" required className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Price (₹) *">
                      <input type="number" step="0.01" min="0"
                        value={menuForm.price} onChange={(e) => setMenuForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="299" required className={inputCls} />
                    </Field>
                    <Field label="Category">
                      <input value={menuForm.category} onChange={(e) => setMenuForm(f => ({ ...f, category: e.target.value }))}
                        placeholder="Pizza" className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea value={menuForm.description} onChange={(e) => setMenuForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Fresh tomato, mozzarella, basil" rows={2} className={inputCls + ' resize-none'} />
                  </Field>
                  <ImagePicker
                    label="Item Image"
                    value={menuForm.photo}
                    onChange={(url) => setMenuForm(f => ({ ...f, photo: url }))}
                    options={MENU_IMAGES}
                  />
                  {menuForm.photo && (
                    <img src={menuForm.photo} alt="preview" className="w-full h-28 object-cover rounded-xl border border-zinc-700" />
                  )}
                  <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                    <input type="checkbox" checked={menuForm.available}
                      onChange={(e) => setMenuForm(f => ({ ...f, available: e.target.checked }))}
                      className="accent-brand-500" />
                    Available
                  </label>
                  <button type="submit" disabled={loading || !selectedRestId}
                    className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                    {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                    Add Item
                  </button>
                </form>
              </div>

              {/* Menu item list */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <h2 className="font-semibold text-zinc-100 text-sm">Menu Items ({menus.length})</h2>
                  <button onClick={() => loadMenus(selectedRestId)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    <RefreshCw size={14} />
                  </button>
                </div>
                <div className="divide-y divide-zinc-800 max-h-[520px] overflow-y-auto">
                  {menus.length === 0 ? (
                    <p className="p-8 text-center text-zinc-500 text-sm">No items yet for this restaurant.</p>
                  ) : menus.map((m) => (
                    <div key={m.menu_id} className="flex items-center gap-3 p-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                        {m.photo
                          ? <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xl opacity-30">🍴</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-100 text-sm truncate">{m.name}</p>
                        <p className="text-xs text-zinc-500">₹{Number(m.price).toFixed(2)} · {m.category}</p>
                      </div>
                      <button onClick={() => handleDeleteMenuItem(m.restaurant_id, m.menu_id, m.name)}
                        className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
