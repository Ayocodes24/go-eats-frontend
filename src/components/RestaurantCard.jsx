import { Link } from 'react-router-dom'
import { Star, Clock, MapPin } from 'lucide-react'

export default function RestaurantCard({ restaurant }) {
  const { id, name, address, cuisine_type, rating, image_url } = restaurant

  return (
    <Link to={`/restaurants/${id}`} className="card group block overflow-hidden hover:border-zinc-600 transition-all duration-200 hover:shadow-xl hover:shadow-black/20">
      {/* Image */}
      <div className="relative h-44 bg-zinc-800 overflow-hidden">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        {cuisine_type && (
          <span className="absolute top-3 left-3 badge bg-brand-500/90 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            {cuisine_type}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-zinc-100 text-base leading-tight group-hover:text-brand-400 transition-colors line-clamp-1">
          {name}
        </h3>

        {address && (
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
            <MapPin size={11} className="shrink-0" />
            <span className="line-clamp-1">{address}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          {rating != null ? (
            <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
              <Star size={12} fill="currentColor" />
              <span>{Number(rating).toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-xs text-zinc-600">No ratings yet</span>
          )}
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Clock size={11} />
            <span>25–35 min</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
