import { Plus, Minus, ShoppingCart } from 'lucide-react'

export default function MenuItemCard({ item, onAdd, onRemove, quantity = 0 }) {
  const { name, description, price, image_url } = item

  return (
    <div className="card flex gap-4 p-4 hover:border-zinc-600 transition-colors">
      {/* Image */}
      <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-zinc-800">
        {image_url ? (
          <img src={image_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍴</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
        <div>
          <h4 className="font-semibold text-zinc-100 text-sm leading-tight line-clamp-1">{name}</h4>
          {description && (
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{description}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-brand-400 font-bold text-sm">₹{Number(price).toFixed(2)}</span>

          {quantity === 0 ? (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <ShoppingCart size={12} />
              Add
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onRemove}
                className="w-7 h-7 rounded-lg bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center text-zinc-200 transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="text-sm font-bold text-zinc-100 w-5 text-center">{quantity}</span>
              <button
                onClick={onAdd}
                className="w-7 h-7 rounded-lg bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-white transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
