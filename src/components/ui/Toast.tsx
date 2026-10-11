import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const icons = {
    success: <CheckCircle2 size={20} className="text-success" />,
    error: <XCircle size={20} className="text-destructive" />,
    info: <Info size={20} className="text-primary-500" />,
    warning: <AlertTriangle size={20} className="text-warning" />,
  }

  const borders = {
    success: 'border-l-success',
    error: 'border-l-destructive',
    info: 'border-l-primary-500',
    warning: 'border-l-warning',
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 p-4 rounded-lg border border-border bg-card shadow-lg border-l-4 animate-slide-up',
            borders[toast.type],
          )}
        >
          <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{toast.message}</p>
            {toast.description && (
              <p className="text-xs text-muted-foreground mt-1">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
