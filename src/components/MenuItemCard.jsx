import { Plus, Minus, ShoppingCart } from 'lucide-react'

function isValidUrl(s) { return s && (s.startsWith('http://') || s.startsWith('https://')) }

export default function MenuItemCard({ item, onAdd, onRemove, quantity = 0 }) {
  const { name, description, photo, price, category } = item

  return (
    <div className="group flex gap-4 p-4 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl hover:border-zinc-700/80 hover:bg-zinc-900 transition-all duration-200">
      {/* Image */}
      <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-zinc-800 relative">
        {isValidUrl(photo) ? (
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-700">
            <span className="text-3xl opacity-20">🍴</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        <div>
          <div className="flex items-start gap-2 mb-0.5">
            <h4 className="font-semibold text-zinc-100 text-sm leading-snug line-clamp-1 flex-1">{name}</h4>
            {category && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 shrink-0 font-medium">
                {category}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{description}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-brand-400 font-bold text-[15px]">₹{Number(price).toFixed(0)}</span>

          {quantity === 0 ? (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-md shadow-brand-500/20 hover:shadow-brand-500/30"
            >
              <ShoppingCart size={12} />
              Add
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onRemove}
                className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-300 transition-all"
              >
                <Minus size={13} />
              </button>
              <span className="text-sm font-bold text-zinc-100 w-5 text-center tabular-nums">{quantity}</span>
              <button
                onClick={onAdd}
                className="w-8 h-8 rounded-xl bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-white transition-all shadow-md shadow-brand-500/20"
              >
                <Plus size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
