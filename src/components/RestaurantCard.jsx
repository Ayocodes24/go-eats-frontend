import { Link } from 'react-router-dom'
import { MapPin, Clock, Star } from 'lucide-react'

const CUISINE_STYLES = {
  Italian:       { bg: 'bg-red-500/20',    text: 'text-red-300',    border: 'border-red-500/30' },
  American:      { bg: 'bg-amber-500/20',  text: 'text-amber-300',  border: 'border-amber-500/30' },
  Japanese:      { bg: 'bg-pink-500/20',   text: 'text-pink-300',   border: 'border-pink-500/30' },
  Indian:        { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30' },
  Mexican:       { bg: 'bg-green-500/20',  text: 'text-green-300',  border: 'border-green-500/30' },
  Chinese:       { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/30' },
  Thai:          { bg: 'bg-lime-500/20',   text: 'text-lime-300',   border: 'border-lime-500/30' },
  Mediterranean: { bg: 'bg-sky-500/20',    text: 'text-sky-300',    border: 'border-sky-500/30' },
  Continental:   { bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  'Fast Food':   { bg: 'bg-brand-500/20',  text: 'text-brand-300',  border: 'border-brand-500/30' },
  Cafe:          { bg: 'bg-stone-500/20',  text: 'text-stone-300',  border: 'border-stone-500/30' },
}

function parseCuisine(desc = '') {
  const m = desc?.match(/^\[([^\]]+)\]/)
  return m ? m[1] : null
}
function cleanDesc(desc = '') { return desc?.replace(/^\[[^\]]+\]\s*/, '') ?? '' }

// deterministic rating 4.0–4.9 based on id
function rating(id) { return (4.0 + ((id * 13 + 7) % 10) / 10).toFixed(1) }
function reviews(id) { return 50 + ((id * 37 + 19) % 450) }
function isValidUrl(s) { return s && (s.startsWith('http://') || s.startsWith('https://')) }

export default function RestaurantCard({ restaurant }) {
  const { restaurant_id, name, store_image, description, city, state } = restaurant
  const location = [city, state].filter(Boolean).join(', ')
  const cuisine  = parseCuisine(description)
  const blurb    = cleanDesc(description)
  const style    = cuisine ? (CUISINE_STYLES[cuisine] ?? { bg: 'bg-zinc-700/40', text: 'text-zinc-300', border: 'border-zinc-600/40' }) : null
  const rat      = rating(restaurant_id)
  const rev      = reviews(restaurant_id)

  return (
    <Link
      to={`/restaurants/${restaurant_id}`}
      className="group block bg-zinc-900/80 border border-zinc-800/80 rounded-2xl overflow-hidden
                 hover:border-zinc-700 hover:-translate-y-1
                 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]
                 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 bg-zinc-800 overflow-hidden">
        {isValidUrl(store_image) ? (
          <img
            src={store_image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-850 to-zinc-900 flex items-center justify-center">
            <span className="text-6xl opacity-10 select-none">🍽️</span>
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />

        {/* Cuisine badge */}
        {style && cuisine && (
          <div className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${style.bg} ${style.text} ${style.border}`}>
            {cuisine}
          </div>
        )}

        {/* Open badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-zinc-900/70 backdrop-blur-sm text-emerald-400 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Open
        </div>

        {/* Delivery time at bottom */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-zinc-900/70 backdrop-blur-sm text-zinc-300 text-[11px] font-medium px-2 py-1 rounded-full border border-zinc-700/50">
          <Clock size={10} />
          <span>25–35 min</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-zinc-100 text-[15px] leading-snug group-hover:text-brand-400 transition-colors line-clamp-1 mb-1">
          {name}
        </h3>

        {/* Rating row */}
        <div className="flex items-center gap-1.5 mb-2">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-[13px] font-semibold text-amber-400">{rat}</span>
          <span className="text-[12px] text-zinc-600">({rev}+)</span>
          <span className="text-zinc-700 mx-0.5">·</span>
          <span className="text-[12px] text-zinc-500">₹₹</span>
        </div>

        {blurb && (
          <p className="text-xs text-zinc-500 line-clamp-1 mb-2 leading-relaxed">{blurb}</p>
        )}

        {location && (
          <div className="flex items-center gap-1 text-zinc-600 text-xs">
            <MapPin size={11} className="shrink-0 text-zinc-700" />
            <span className="line-clamp-1">{location}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
