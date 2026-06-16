import { Link } from 'react-router-dom'
import { MapPin, Clock } from 'lucide-react'

const CUISINE_COLORS = {
  Italian:       'bg-red-500/15 text-red-400 border-red-500/20',
  American:      'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Japanese:      'bg-pink-500/15 text-pink-400 border-pink-500/20',
  Indian:        'bg-orange-500/15 text-orange-400 border-orange-500/20',
  Mexican:       'bg-green-500/15 text-green-400 border-green-500/20',
  Chinese:       'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Thai:          'bg-lime-500/15 text-lime-400 border-lime-500/20',
  Mediterranean: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  Continental:   'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  'Fast Food':   'bg-brand-500/15 text-brand-400 border-brand-500/20',
  Cafe:          'bg-stone-400/15 text-stone-300 border-stone-400/20',
}

function parseCuisine(description = '') {
  const match = description.match(/^\[([^\]]+)\]/)
  return match ? match[1] : null
}

function cleanDescription(description = '') {
  return description.replace(/^\[[^\]]+\]\s*/, '')
}

export default function RestaurantCard({ restaurant }) {
  const { restaurant_id, name, store_image, description, city, state } = restaurant
  const location = [city, state].filter(Boolean).join(', ')
  const cuisine  = parseCuisine(description)
  const blurb    = cleanDescription(description)
  const badgeCls = cuisine ? (CUISINE_COLORS[cuisine] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30') : ''

  return (
    <Link
      to={`/restaurants/${restaurant_id}`}
      className="group block bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 hover:shadow-xl hover:shadow-black/30 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-44 bg-zinc-800 overflow-hidden">
        {store_image ? (
          <img
            src={store_image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <span className="text-5xl opacity-20">🍽️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />

        {/* Cuisine badge */}
        {cuisine && (
          <div className={`absolute top-3 left-3 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeCls}`}>
            {cuisine}
          </div>
        )}

        {/* Delivery time */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-zinc-900/80 backdrop-blur-sm text-zinc-300 text-[11px] font-medium px-2 py-1 rounded-full border border-zinc-700/50">
          <Clock size={10} />
          <span>25–35 min</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-zinc-100 text-[15px] leading-tight group-hover:text-brand-400 transition-colors line-clamp-1 mb-1.5">
          {name}
        </h3>

        {blurb && (
          <p className="text-xs text-zinc-500 line-clamp-1 mb-2">{blurb}</p>
        )}

        {location && (
          <div className="flex items-center gap-1 text-zinc-600 text-xs">
            <MapPin size={11} className="shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
