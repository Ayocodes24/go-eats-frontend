import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Plus, Trash2, RefreshCw, Utensils, Store, Zap, ChevronDown } from 'lucide-react'
import {
  getRestaurants, addRestaurant, deleteRestaurant,
  getMenus, addMenuItem, deleteMenuItem,
} from '../api/index'
import { useToast } from '../context/ToastContext'

// ── AI-generated images via Pollinations.ai (seed-stable, no API key) ───────
const P = (prompt, w, h, seed) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&seed=${seed}&nologo=true`

const RESTAURANT_IMAGES = [
  { label: 'Italian / Pizza',   url: P('rustic italian pizzeria restaurant interior warm lighting brick wall candles', 800, 500, 101) },
  { label: 'American / Burger', url: P('american burger diner retro neon signs vibrant food photography', 800, 500, 202) },
  { label: 'Japanese / Sushi',  url: P('elegant japanese sushi bar minimalist interior dark wood zen', 800, 500, 303) },
  { label: 'Indian Cuisine',    url: P('vibrant indian restaurant colorful spices warm amber lighting food', 800, 500, 404) },
  { label: 'Fine Dining',       url: P('luxury fine dining restaurant elegant candlelight white tablecloth', 800, 500, 505) },
  { label: 'Mexican',           url: P('colorful mexican restaurant festive papel picado tacos warm evening', 800, 500, 606) },
  { label: 'Chinese',           url: P('chinese restaurant red lanterns dim sum traditional decor evening', 800, 500, 707) },
  { label: 'Cafe / Bakery',     url: P('cozy cafe bakery interior warm light coffee pastries', 800, 500, 808) },
]

const MENU_IMAGES = [
  { label: 'Margherita Pizza',  url: P('margherita pizza fresh basil mozzarella tomato wood fired', 400, 300, 11) },
  { label: 'Pepperoni Pizza',   url: P('pepperoni pizza cheesy crispy slice overhead', 400, 300, 12) },
  { label: 'Cheeseburger',      url: P('gourmet cheeseburger brioche bun lettuce tomato close up', 400, 300, 21) },
  { label: 'Chicken Burger',    url: P('crispy fried chicken burger sandwich sesame bun', 400, 300, 22) },
  { label: 'Sushi Roll',        url: P('california roll sushi chopsticks wasabi ginger', 400, 300, 31) },
  { label: 'Salmon Nigiri',     url: P('salmon nigiri sushi fresh fish rice close up', 400, 300, 32) },
  { label: 'Chicken Biryani',   url: P('chicken biryani saffron basmati rice aromatic spices', 400, 300, 41) },
  { label: 'Pasta Carbonara',   url: P('pasta carbonara creamy egg sauce parmesan pepper', 400, 300, 51) },
  { label: 'Chicken Tacos',     url: P('chicken street tacos corn tortilla lime cilantro salsa', 400, 300, 61) },
  { label: 'Garlic Bread',      url: P('garlic bread crispy butter herbs toasted', 400, 300, 71) },
  { label: 'Chocolate Dessert', url: P('chocolate lava cake dessert warm cream berries', 400, 300, 81) },
  { label: 'Mango Drink',       url: P('mango smoothie tropical drink fresh fruit glass', 400, 300, 91) },
]

const CUISINES = ['Indian', 'Italian', 'American', 'Japanese', 'Mexican', 'Chinese', 'Thai', 'Mediterranean', 'Continental', 'Fast Food', 'Cafe']

// ── Seed data (AI-generated images) ─────────────────────────────────────────
const SEED_RESTAURANTS = [
  {
    name: 'Pizza Palace', city: 'Mumbai', state: 'Maharashtra', address: '12 Marine Drive',
    description: '[Italian] Authentic Neapolitan pizzas baked in a wood-fired oven',
    image_url: P('rustic italian pizzeria restaurant interior warm lighting brick wall', 800, 500, 101),
    menus: [
      { name: 'Margherita Pizza',   description: 'Fresh tomato, mozzarella, basil', price: 299, category: 'Pizza',   photo: P('margherita pizza fresh basil mozzarella tomato', 400, 300, 11) },
      { name: 'Pepperoni Pizza',    description: 'Loaded with spicy pepperoni',      price: 399, category: 'Pizza',   photo: P('pepperoni pizza cheesy crispy overhead', 400, 300, 12) },
      { name: 'Garlic Bread',       description: 'Toasted with herb butter',          price: 149, category: 'Sides',   photo: P('garlic bread crispy herb butter toasted', 400, 300, 71) },
      { name: 'Tiramisu',           description: 'Classic Italian coffee dessert',    price: 199, category: 'Dessert', photo: P('tiramisu dessert coffee cream mascarpone', 400, 300, 82) },
    ],
  },
  {
    name: 'Burger Barn', city: 'New Delhi', state: 'Delhi', address: '45 Connaught Place',
    description: '[American] Smash burgers, hand-cut fries and thick milkshakes',
    image_url: P('american burger diner retro neon signs vibrant colorful', 800, 500, 202),
    menus: [
      { name: 'Classic Smash Burger', description: 'Double patty, American cheese, pickles', price: 299, category: 'Burgers', photo: P('gourmet cheeseburger brioche bun lettuce tomato', 400, 300, 21) },
      { name: 'Crispy Chicken Burger', description: 'Fried chicken, sriracha mayo',          price: 279, category: 'Burgers', photo: P('crispy fried chicken burger sesame bun', 400, 300, 22) },
      { name: 'Veggie Burger',         description: 'Black bean patty, avocado, lettuce',    price: 229, category: 'Burgers', photo: P('vegetarian bean patty burger avocado green', 400, 300, 23) },
      { name: 'Loaded Fries',          description: 'Crispy fries, cheese, jalapeños',       price: 149, category: 'Sides',   photo: P('loaded cheese fries jalapeños crispy golden', 400, 300, 24) },
    ],
  },
  {
    name: 'Sushi Station', city: 'Bangalore', state: 'Karnataka', address: '8 Indiranagar 100ft Rd',
    description: '[Japanese] Fresh sushi, sashimi and ramen by trained Japanese chefs',
    image_url: P('elegant japanese sushi bar minimalist dark wood zen interior', 800, 500, 303),
    menus: [
      { name: 'California Roll',  description: 'Crab, avocado, cucumber',           price: 449, category: 'Rolls',  photo: P('california roll sushi chopsticks wasabi ginger', 400, 300, 31) },
      { name: 'Salmon Nigiri',    description: 'Fresh Atlantic salmon, vinegar rice',price: 349, category: 'Nigiri', photo: P('salmon nigiri sushi fresh fish rice close up', 400, 300, 32) },
      { name: 'Spicy Tuna Roll',  description: 'Tuna, sriracha, scallions',         price: 499, category: 'Rolls',  photo: P('spicy tuna roll sushi red chili sauce', 400, 300, 33) },
      { name: 'Miso Ramen',       description: 'Rich broth, chashu pork, soft egg', price: 399, category: 'Ramen',  photo: P('miso ramen noodles chashu pork soft egg bowl', 400, 300, 34) },
    ],
  },
  {
    name: 'Biryani Blues', city: 'Hyderabad', state: 'Telangana', address: '3 Banjara Hills Road',
    description: '[Indian] Slow-cooked dum biryani recipes passed down for generations',
    image_url: P('vibrant indian restaurant colorful spices warm amber lighting', 800, 500, 404),
    menus: [
      { name: 'Chicken Dum Biryani', description: 'Marinated chicken, aged basmati, saffron', price: 349, category: 'Biryani', photo: P('chicken biryani saffron basmati rice aromatic spices', 400, 300, 41) },
      { name: 'Mutton Biryani',      description: 'Tender mutton slow-cooked 4 hours',        price: 449, category: 'Biryani', photo: P('mutton biryani slow cooked aromatic rice dum', 400, 300, 42) },
      { name: 'Veg Biryani',         description: 'Seasonal vegetables, caramelised onions',   price: 249, category: 'Biryani', photo: P('vegetable biryani colorful vegetables rice', 400, 300, 43) },
      { name: 'Shahi Paneer',        description: 'Cottage cheese in cashew gravy',            price: 279, category: 'Curry',   photo: P('shahi paneer creamy cashew curry indian food', 400, 300, 44) },
    ],
  },
  {
    name: 'Pasta Paradise', city: 'Chennai', state: 'Tamil Nadu', address: '67 Anna Nagar',
    description: '[Italian] Hand-made pasta with sauces simmered for hours',
    image_url: P('mediterranean pasta trattoria tuscany cozy restaurant warm light', 800, 500, 505),
    menus: [
      { name: 'Pasta Carbonara',   description: 'Egg, pecorino, guanciale, black pepper',  price: 349, category: 'Pasta',   photo: P('pasta carbonara creamy egg sauce parmesan pepper', 400, 300, 51) },
      { name: 'Pasta Arrabbiata',  description: 'Spicy tomato sauce, garlic, chilli',       price: 299, category: 'Pasta',   photo: P('pasta arrabbiata spicy tomato garlic chilli', 400, 300, 52) },
      { name: 'Mushroom Risotto',  description: 'Arborio rice, porcini, parmesan',          price: 379, category: 'Risotto', photo: P('mushroom risotto porcini parmesan creamy', 400, 300, 53) },
      { name: 'Panna Cotta',       description: 'Vanilla cream with berry coulis',          price: 179, category: 'Dessert', photo: P('panna cotta vanilla cream berry sauce dessert', 400, 300, 54) },
    ],
  },
  {
    name: 'Taco Town', city: 'Pune', state: 'Maharashtra', address: '22 Koregaon Park',
    description: '[Mexican] Street-style tacos, burritos and fresh guacamole',
    image_url: P('colorful mexican restaurant festive papel picado tacos warm evening', 800, 500, 606),
    menus: [
      { name: 'Chicken Tacos',  description: 'Grilled chicken, pico de gallo, lime crema', price: 279, category: 'Tacos',   photo: P('chicken street tacos corn tortilla lime cilantro salsa', 400, 300, 61) },
      { name: 'Beef Burrito',   description: 'Slow-braised beef, rice, beans, guac',       price: 349, category: 'Burritos', photo: P('beef burrito wrapped mexican rice beans', 400, 300, 62) },
      { name: 'Loaded Nachos',  description: 'Tortilla chips, cheese, jalapeños, salsa',   price: 249, category: 'Snacks',   photo: P('loaded nachos cheese jalapeños salsa crispy', 400, 300, 63) },
      { name: 'Mango Agua Fresca', description: 'Fresh mango, lime, mint cooler',          price: 149, category: 'Drinks',   photo: P('mango tropical drink fresh fruit glass lime mint', 400, 300, 91) },
    ],
  },
]

// ── Sub-components ────────────────────────────────────────────────────────────
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
            title={img.label}
            className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${
              value === img.url ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <img
              src={img.url}
              alt={img.label}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            {value === img.url && (
              <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
                <span className="text-white text-base font-bold">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>
      <input
        type="url"
        placeholder="Or paste a custom image URL…"
        value={options.some(o => o.url === value) ? '' : (value || '')}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-zinc-800/60 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60 transition-all'

// ── Main component ────────────────────────────────────────────────────────────
export default function Admin() {
  const { toast }   = useToast()
  const navigate    = useNavigate()

  const [unlocked,  setUnlocked]  = useState(() => sessionStorage.getItem('admin_unlocked') === '1')
  const [adminPass, setAdminPass] = useState('')

  const [tab,            setTab]            = useState('restaurants')
  const [restaurants,    setRestaurants]    = useState([])
  const [menus,          setMenus]          = useState([])
  const [selectedRestId, setSelectedRestId] = useState('')
  const [loading,        setLoading]        = useState(false)
  const [seeding,        setSeeding]        = useState(false)

  const [restForm, setRestForm] = useState({ name: '', description: '', address: '', city: '', state: '', image_url: '', cuisine: '' })
  const [menuForm, setMenuForm] = useState({ name: '', description: '', price: '', category: '', photo: '', available: true })

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

  const handleAddRestaurant = async (e) => {
    e.preventDefault()
    if (!restForm.name.trim()) { toast.error('Name is required.'); return }
    setLoading(true)
    try {
      const prefix = restForm.cuisine ? `[${restForm.cuisine}] ` : ''
      await addRestaurant({ name: restForm.name, description: `${prefix}${restForm.description}`, address: restForm.address, city: restForm.city, state: restForm.state, image_url: restForm.image_url })
      toast.success(`"${restForm.name}" added!`)
      setRestForm({ name: '', description: '', address: '', city: '', state: '', image_url: '', cuisine: '' })
      loadRestaurants()
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Failed to add restaurant.')
    } finally { setLoading(false) }
  }

  const handleDeleteRestaurant = async (id, name) => {
    try {
      await deleteRestaurant(id)
      toast.success(`"${name}" deleted.`)
      loadRestaurants()
      if (String(selectedRestId) === String(id)) { setSelectedRestId(''); setMenus([]) }
    } catch { toast.error('Delete failed.') }
  }

  const handleAddMenuItem = async (e) => {
    e.preventDefault()
    if (!selectedRestId) { toast.error('Select a restaurant first.'); return }
    if (!menuForm.name.trim() || !menuForm.price) { toast.error('Name and price are required.'); return }
    setLoading(true)
    try {
      await addMenuItem({ restaurant_id: parseInt(selectedRestId), name: menuForm.name, description: menuForm.description, price: parseFloat(menuForm.price), category: menuForm.category, photo: menuForm.photo, available: menuForm.available })
      toast.success(`"${menuForm.name}" added!`)
      setMenuForm({ name: '', description: '', price: '', category: '', photo: '', available: true })
      loadMenus(selectedRestId)
    } catch (err) {
      toast.error(err.response?.data?.error ?? 'Failed to add menu item.')
    } finally { setLoading(false) }
  }

  const handleDeleteMenuItem = async (restaurantId, menuId, name) => {
    try {
      await deleteMenuItem(restaurantId, menuId)
      toast.success(`"${name}" removed.`)
      loadMenus(selectedRestId)
    } catch { toast.error('Delete failed.') }
  }

  // Delete all existing restaurants then seed fresh data
  const handleResetAndSeed = async () => {
    setSeeding(true)
    toast.info('Clearing old data and seeding fresh restaurants…')
    try {
      const existing = await getRestaurants()
      const all = Array.isArray(existing.data) ? existing.data : []
      for (const r of all) await deleteRestaurant(r.restaurant_id).catch(() => {})

      for (const r of SEED_RESTAURANTS) {
        await addRestaurant({ name: r.name, description: r.description, address: r.address, city: r.city, state: r.state, image_url: r.image_url })
        const listRes = await getRestaurants()
        const list    = Array.isArray(listRes.data) ? listRes.data : []
        const created = [...list].reverse().find((x) => x.name === r.name)
        if (created) {
          for (const m of r.menus) await addMenuItem({ restaurant_id: created.restaurant_id, ...m })
        }
      }
      toast.success(`Seeded ${SEED_RESTAURANTS.length} restaurants with menus!`)
      loadRestaurants()
    } catch (err) {
      toast.error('Seeding failed: ' + (err.response?.data?.error ?? err.message))
    } finally { setSeeding(false) }
  }

  // ── Password gate ─────────────────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500/20 to-brand-600/10 border border-brand-500/20 rounded-2xl mb-5 shadow-xl shadow-brand-500/10">
              <Shield size={28} className="text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-50">Admin Panel</h1>
            <p className="text-zinc-500 text-sm mt-2">Enter the admin password to manage restaurants</p>
          </div>
          <form onSubmit={unlock} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <input
              type="password"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              placeholder="Admin password"
              autoFocus
              className={inputCls}
            />
            <button type="submit" className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/20 text-sm">
              Unlock Dashboard
            </button>
            <p className="text-center text-xs text-zinc-600 mt-1">Hint: admin@goeats</p>
          </form>
        </div>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2.5">
            <Shield size={22} className="text-brand-500" /> Admin Dashboard
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} in database</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleResetAndSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-brand-500/20"
          >
            {seeding
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Zap size={15} />
            }
            {seeding ? 'Seeding…' : 'Reset & Seed Data'}
          </button>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-zinc-900/80 border border-zinc-800 rounded-xl w-fit">
        {[
          { key: 'restaurants', icon: <Store size={14} />, label: 'Restaurants' },
          { key: 'menus',       icon: <Utensils size={14} />, label: 'Menu Items' },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ── RESTAURANTS TAB ── */}
      {tab === 'restaurants' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
              <Plus size={15} className="text-brand-500" /> Add Restaurant
            </h2>
            <form onSubmit={handleAddRestaurant} className="space-y-3">
              <Field label="Name *">
                <input value={restForm.name} onChange={(e) => setRestForm(f => ({ ...f, name: e.target.value }))} placeholder="Pizza Palace" required className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                  <input value={restForm.city} onChange={(e) => setRestForm(f => ({ ...f, city: e.target.value }))} placeholder="Mumbai" className={inputCls} />
                </Field>
                <Field label="State">
                  <input value={restForm.state} onChange={(e) => setRestForm(f => ({ ...f, state: e.target.value }))} placeholder="Maharashtra" className={inputCls} />
                </Field>
              </div>
              <Field label="Address">
                <input value={restForm.address} onChange={(e) => setRestForm(f => ({ ...f, address: e.target.value }))} placeholder="12 Main St" className={inputCls} />
              </Field>
              <Field label="Cuisine Type">
                <select value={restForm.cuisine} onChange={(e) => setRestForm(f => ({ ...f, cuisine: e.target.value }))} className={inputCls}>
                  <option value="">Select cuisine…</option>
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Description">
                <textarea value={restForm.description} onChange={(e) => setRestForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description…" rows={2} className={inputCls + ' resize-none'} />
              </Field>
              <ImagePicker label="Restaurant Image" value={restForm.image_url} onChange={(url) => setRestForm(f => ({ ...f, image_url: url }))} options={RESTAURANT_IMAGES} />
              {restForm.image_url && <img src={restForm.image_url} alt="preview" className="w-full h-32 object-cover rounded-xl border border-zinc-700" onError={(e) => e.target.style.display='none'} />}
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-500/20">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                Add Restaurant
              </button>
            </form>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-100 text-sm">Current Restaurants</h2>
              <button onClick={loadRestaurants} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-800">
                <RefreshCw size={14} />
              </button>
            </div>
            <div className="divide-y divide-zinc-800/60 max-h-[520px] overflow-y-auto">
              {restaurants.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-zinc-500 text-sm mb-3">No restaurants yet.</p>
                  <button onClick={handleResetAndSeed} disabled={seeding} className="text-brand-400 text-xs hover:underline font-medium">
                    Click "Reset & Seed Data" to add mock data →
                  </button>
                </div>
              ) : restaurants.map((r) => (
                <div key={r.restaurant_id} className="flex items-center gap-3 p-3 hover:bg-zinc-800/30 transition-colors">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/50">
                    {r.store_image && (r.store_image.startsWith('http://') || r.store_image.startsWith('https://'))
                      ? <img src={r.store_image} alt={r.name} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                      : <div className="w-full h-full flex items-center justify-center text-lg opacity-20">🍽️</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-100 text-sm truncate">{r.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{[r.city, r.state].filter(Boolean).join(', ')}</p>
                  </div>
                  <span className="text-xs text-zinc-700 shrink-0 font-mono">#{r.restaurant_id}</span>
                  <button onClick={() => handleDeleteRestaurant(r.restaurant_id, r.name)}
                    className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MENU ITEMS TAB ── */}
      {tab === 'menus' && (
        <div className="space-y-5">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
            <Field label="Select Restaurant">
              <div className="relative">
                <select value={selectedRestId} onChange={(e) => setSelectedRestId(e.target.value)} className={inputCls + ' appearance-none pr-10'}>
                  <option value="">Choose a restaurant…</option>
                  {restaurants.map((r) => (
                    <option key={r.restaurant_id} value={r.restaurant_id}>#{r.restaurant_id} — {r.name} ({r.city})</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </Field>
          </div>

          {selectedRestId && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4">
                <h2 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
                  <Plus size={15} className="text-brand-500" /> Add Menu Item
                </h2>
                <form onSubmit={handleAddMenuItem} className="space-y-3">
                  <Field label="Item Name *">
                    <input value={menuForm.name} onChange={(e) => setMenuForm(f => ({ ...f, name: e.target.value }))} placeholder="Margherita Pizza" required className={inputCls} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Price (₹) *">
                      <input type="number" step="1" min="0" value={menuForm.price} onChange={(e) => setMenuForm(f => ({ ...f, price: e.target.value }))} placeholder="299" required className={inputCls} />
                    </Field>
                    <Field label="Category">
                      <input value={menuForm.category} onChange={(e) => setMenuForm(f => ({ ...f, category: e.target.value }))} placeholder="Pizza" className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea value={menuForm.description} onChange={(e) => setMenuForm(f => ({ ...f, description: e.target.value }))} placeholder="Fresh tomato, mozzarella, basil" rows={2} className={inputCls + ' resize-none'} />
                  </Field>
                  <ImagePicker label="Item Photo" value={menuForm.photo} onChange={(url) => setMenuForm(f => ({ ...f, photo: url }))} options={MENU_IMAGES} />
                  {menuForm.photo && <img src={menuForm.photo} alt="preview" className="w-full h-28 object-cover rounded-xl border border-zinc-700" onError={(e) => e.target.style.display='none'} />}
                  <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                    <input type="checkbox" checked={menuForm.available} onChange={(e) => setMenuForm(f => ({ ...f, available: e.target.checked }))} className="accent-brand-500 rounded" />
                    Available for ordering
                  </label>
                  <button type="submit" disabled={loading || !selectedRestId} className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-500/20">
                    {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                    Add Item
                  </button>
                </form>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <h2 className="font-semibold text-zinc-100 text-sm">Menu Items ({menus.length})</h2>
                  <button onClick={() => loadMenus(selectedRestId)} className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800 transition-all">
                    <RefreshCw size={14} />
                  </button>
                </div>
                <div className="divide-y divide-zinc-800/60 max-h-[520px] overflow-y-auto">
                  {menus.length === 0 ? (
                    <p className="p-8 text-center text-zinc-500 text-sm">No items yet for this restaurant.</p>
                  ) : menus.map((m) => (
                    <div key={m.menu_id} className="flex items-center gap-3 p-3 hover:bg-zinc-800/30 transition-colors">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/50">
                        {m.photo && (m.photo.startsWith('http://') || m.photo.startsWith('https://'))
                          ? <img src={m.photo} alt={m.name} className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                          : <div className="w-full h-full flex items-center justify-center text-lg opacity-20">🍴</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-100 text-sm truncate">{m.name}</p>
                        <p className="text-xs text-zinc-500">₹{Number(m.price).toFixed(0)} · {m.category}</p>
                      </div>
                      <button onClick={() => handleDeleteMenuItem(m.restaurant_id, m.menu_id, m.name)}
                        className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all shrink-0">
                        <Trash2 size={13} />
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
