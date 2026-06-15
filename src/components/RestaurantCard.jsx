import { Link } from 'react-router-dom'
import { MapPin, Clock, ChevronRight } from 'lucide-react'

export default function RestaurantCard({ restaurant }) {
  // Backend fields: restaurant_id, name, store_image, description, address, city, state
  const { restaurant_id, name, store_image, description, address, city, state } = restaurant
  const location = [city, state].filter(Boolean).join(', ')

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
            <div className="flex flex-col items-center gap-2 opacity-40">
              <span className="text-5xl">🍽️</span>
            </div>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
        {/* Estimated time badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-zinc-900/80 backdrop-blur-sm text-zinc-300 text-[11px] font-medium px-2 py-1 rounded-full border border-zinc-700/50">
          <Clock size={10} />
          <span>25–35 min</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-zinc-100 text-[15px] leading-tight group-hover:text-brand-400 transition-colors line-clamp-1">
            {name}
          </h3>
          <ChevronRight size={15} className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0 mt-0.5" />
        </div>

        {description && (
          <p className="text-xs text-zinc-500 line-clamp-1 mb-2">{description}</p>
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
