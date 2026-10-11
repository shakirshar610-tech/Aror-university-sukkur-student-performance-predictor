import { useState, useEffect, useMemo } from 'react'
import {
  Bell, CheckCheck, Trash2, Search, AlertTriangle, Clock,
  Info, CheckCircle2, X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import {
  fetchNotifications, markNotificationRead, markAllNotificationsRead,
  deleteNotification, clearAllNotifications, type Notification,
} from '@/services/notificationService'
import { formatDate } from '@/lib/utils'

const CATEGORY_CONFIG: Record<string, { icon: typeof Bell; color: string }> = {
  overdue: { icon: AlertTriangle, color: 'hsl(0, 84%, 60%)' },
  deadline: { icon: Clock, color: 'hsl(25, 90%, 55%)' },
  reminder: { icon: Bell, color: 'hsl(230, 55%, 50%)' },
  task: { icon: CheckCircle2, color: 'hsl(142, 71%, 45%)' },
  system: { icon: Info, color: 'hsl(200, 55%, 45%)' },
}

const PRIORITY_VARIANT: Record<string, 'info' | 'warning' | 'error' | 'default'> = {
  low: 'info', medium: 'warning', high: 'error', urgent: 'error',
}

export function NotificationsPage() {
  const { addToast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRead, setFilterRead] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const load = async () => {
    setLoading(true)
    const data = await fetchNotifications()
    setNotifications(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])

  const filtered = useMemo(() => {
    let result = [...notifications]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q))
    }
    if (filterRead === 'unread') result = result.filter(n => !n.read)
    if (filterRead === 'read') result = result.filter(n => n.read)
    if (filterCategory) result = result.filter(n => n.category === filterCategory)
    return result
  }, [notifications, search, filterRead, filterCategory])

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id)
    load()
  }

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return
    await markAllNotificationsRead()
    addToast('success', 'All notifications marked as read')
    load()
  }

  const handleDelete = async (id: string) => {
    await deleteNotification(id)
    load()
  }

  const handleClearAll = async () => {
    await clearAllNotifications()
    addToast('success', 'All notifications cleared')
    load()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Bell size={20} className="text-primary-500" />
            Notifications
            {unreadCount > 0 && <Badge variant="error">{unreadCount} unread</Badge>}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            <CheckCheck size={14} /> Mark all read
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll} disabled={notifications.length === 0}>
            <Trash2 size={14} /> Clear all
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Search notifications..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={16} />} />
        </div>
        <select className="px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground" value={filterRead} onChange={(e) => setFilterRead(e.target.value)}>
          <option value="">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
        <select className="px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {Object.keys(CATEGORY_CONFIG).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {/* Notification list */}
      <Card>
        {loading ? (
          <CardContent className="p-8 text-center text-sm text-muted-foreground">Loading notifications...</CardContent>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Bell size={20} />}
            title="No notifications"
            description={unreadCount === 0 && notifications.length > 0 ? "You're all caught up!" : "Notifications will appear here when you have upcoming deadlines or overdue tasks."}
          />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((n) => {
              const config = CATEGORY_CONFIG[n.category] || CATEGORY_CONFIG.task
              const Icon = config.icon
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 py-3 px-4 hover:bg-muted/20 transition-colors ${!n.read ? 'bg-primary-500/5' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${config.color}15` }}>
                    <Icon size={16} style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!n.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                      <Badge variant={PRIORITY_VARIANT[n.priority] || 'default'}>{n.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{formatDate(n.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.read && (
                      <button onClick={() => handleMarkRead(n.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Mark as read">
                        <CheckCheck size={15} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive" title="Delete">
                      <X size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            Notifications are generated automatically from your task deadlines. Browser push
            notifications and email reminders require additional configuration. In-app
            notifications work without any external setup.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
