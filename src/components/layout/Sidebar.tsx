import { GraduationCap, X } from 'lucide-react'
import { navItems } from '@/config/navigation'
import { university } from '@/config/university'
import { cn } from '@/lib/utils'
import type { PageId } from '@/types'

interface SidebarProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ currentPage, onNavigate, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center shadow-md">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-white leading-tight">
                Aror SPP
              </p>
              <p className="text-xs text-sidebar-foreground leading-tight">
                Performance Predictor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-sidebar-foreground hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id)
                  onClose()
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary-600 text-white border-l-3 border-secondary'
                    : 'text-sidebar-foreground hover:text-white hover:bg-sidebar-accent',
                )}
                style={active ? { borderLeftWidth: '3px', borderLeftStyle: 'solid', borderLeftColor: 'hsl(var(--secondary))' } : {}}
              >
                <Icon size={18} className={active ? 'text-white' : 'text-sidebar-foreground'} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/90 font-medium">
            {university.shortName}
          </p>
          <p className="text-xs text-sidebar-foreground/60 mt-0.5">
            Independent academic support tool
          </p>
        </div>
      </aside>
    </>
  )
}
