import { useState, useEffect, useRef } from 'react'
import { Menu, Sun, Moon, Server, AlertCircle, ShieldCheck, Bell } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { Badge } from '@/components/ui/Badge'
import { navItems } from '@/config/navigation'
import { university } from '@/config/university'
import { fetchNotifications, markNotificationRead, type Notification } from '@/services/notificationService'
import { formatDate } from '@/lib/utils'
import type { PageId } from '@/types'

interface TopbarProps {
  currentPage: PageId
  onMenuClick: () => void
  modelStatus: 'trained' | 'unavailable'
  onNavigate: (page: PageId) => void
}

export function Topbar({ currentPage, onMenuClick, modelStatus, onNavigate }: TopbarProps) {
  const { theme, toggleTheme } = useTheme()
  const navItem = navItems.find((n) => n.id === currentPage)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const loadNotifications = async () => {
    const data = await fetchNotifications()
    setNotifications(data)
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) {
      await markNotificationRead(n.id)
      loadNotifications()
    }
    if (n.action_url) {
      onNavigate(n.action_url as PageId)
    }
    setShowDropdown(false)
  }

  const handleBellClick = () => {
    setShowDropdown(!showDropdown)
  }

  return (
    <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-muted"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="font-display text-base font-semibold text-foreground">
              {navItem?.label || 'Dashboard'}
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {university.shortName} — {university.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {modelStatus === 'trained' ? (
            <Badge variant="success" className="hidden sm:inline-flex">
              <Server size={12} />
              Model Trained
            </Badge>
          ) : (
            <Badge variant="warning" className="hidden sm:inline-flex">
              <AlertCircle size={12} />
              Model Unavailable
            </Badge>
          )}
          <Badge variant="info" className="hidden md:inline-flex">
            <ShieldCheck size={12} />
            Guest Mode
          </Badge>

          {/* Notification bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleBellClick}
              className="relative p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto scrollbar-thin bg-card border border-border rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-semibold">Notifications</span>
                  {unreadCount > 0 && <Badge variant="error">{unreadCount} unread</Badge>}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell size={20} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.slice(0, 8).map(n => (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full text-left p-3 hover:bg-muted/20 transition-colors ${!n.read ? 'bg-primary-500/5' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!n.read ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>{n.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                            <p className="text-xs text-muted-foreground/60 mt-0.5">{formatDate(n.created_at)}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => { onNavigate('notifications'); setShowDropdown(false) }}
                  className="w-full text-center text-sm text-primary-500 hover:underline py-2 border-t border-border"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  )
}
