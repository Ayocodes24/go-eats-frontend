import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

const typeStyles = {
  success: 'bg-green-900/90  border-green-700  text-green-100',
  error:   'bg-red-900/90    border-red-700    text-red-100',
  warning: 'bg-yellow-900/90 border-yellow-700 text-yellow-100',
  info:    'bg-zinc-800/90   border-zinc-600   text-zinc-100',
}
const typeIcons = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
}

function Toast({ toast, onRemove }) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-xl animate-slide-in cursor-pointer ${typeStyles[toast.type]}`}
      onClick={() => onRemove(toast.id)}
    >
      <span className="text-lg leading-none mt-0.5">{typeIcons[toast.type]}</span>
      <p className="text-sm font-medium leading-relaxed flex-1">{toast.message}</p>
    </div>
  )
}

export const useToast = () => useContext(ToastContext)
