import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Toast } from '@/types'

interface ToastContextValue {
  toasts: Toast[]
  addToast: (type: Toast['type'], message: string, description?: string) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

let toastCounter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (type: Toast['type'], message: string, description?: string) => {
      const id = `toast-${++toastCounter}`
      setToasts((prev) => [...prev, { id, type, message, description }])
      setTimeout(() => removeToast(id), 4000)
    },
    [removeToast],
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
