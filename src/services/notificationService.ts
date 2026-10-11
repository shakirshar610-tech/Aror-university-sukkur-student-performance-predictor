import { supabase } from '@/lib/supabase'
import type { Task } from './taskService'
import { isOverdue, getDaysUntilDeadline } from './taskService'

export interface Notification {
  id: string
  title: string
  message: string
  category: string
  priority: string
  task_id: string | null
  read: boolean
  read_at: string | null
  action_url: string | null
  created_at: string
}

const STORAGE_KEY = 'aspp_notifications'

function readLocal(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Notification[]
  } catch {
    return []
  }
}

function writeLocal(notifs: Notification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs))
  } catch { /* ignore */ }
}

export async function fetchNotifications(): Promise<Notification[]> {
  if (!supabase) return readLocal()
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    return readLocal()
  }
  return (data || []) as Notification[]
}

export async function markNotificationRead(id: string): Promise<void> {
  if (!supabase) {
    const local = readLocal()
    const idx = local.findIndex((n) => n.id === id)
    if (idx !== -1) {
      local[idx].read = true
      local[idx].read_at = new Date().toISOString()
      writeLocal(local)
    }
    return
  }
  await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).eq('id', id)
}

export async function markAllNotificationsRead(): Promise<void> {
  if (!supabase) {
    const local = readLocal().map((n) => ({ ...n, read: true, read_at: n.read_at || new Date().toISOString() }))
    writeLocal(local)
    return
  }
  await supabase.from('notifications').update({ read: true, read_at: new Date().toISOString() }).eq('read', false)
}

export async function deleteNotification(id: string): Promise<void> {
  if (!supabase) {
    writeLocal(readLocal().filter((n) => n.id !== id))
    return
  }
  await supabase.from('notifications').delete().eq('id', id)
}

export async function clearAllNotifications(): Promise<void> {
  if (!supabase) {
    writeLocal([])
    return
  }
  await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
}

export async function generateNotificationsFromTasks(tasks: Task[]): Promise<void> {
  const existing = await fetchNotifications()
  const existingTaskIds = new Set(existing.map((n) => n.task_id).filter(Boolean))
  const newNotifs: Omit<Notification, 'id' | 'created_at'>[] = []

  for (const task of tasks) {
    if (task.status === 'completed' || task.status === 'cancelled') continue
    if (existingTaskIds.has(task.id)) continue

    const days = getDaysUntilDeadline(task.deadline)
    if (days === null) continue

    if (isOverdue(task)) {
      newNotifs.push({
        title: 'Overdue Task Alert',
        message: `Your ${task.title}${task.course_title ? ` for ${task.course_title}` : ''} is overdue. Review the submission instructions and update your task status.`,
        category: 'overdue',
        priority: 'urgent',
        task_id: task.id,
        read: false,
        read_at: null,
        action_url: 'tasks',
      })
    } else if (days <= 1) {
      newNotifs.push({
        title: 'Deadline Approaching',
        message: `Your ${task.title}${task.course_title ? ` for ${task.course_title}` : ''} is due ${days === 0 ? 'today' : 'tomorrow'}. Make sure to submit before the deadline.`,
        category: 'deadline',
        priority: 'high',
        task_id: task.id,
        read: false,
        read_at: null,
        action_url: 'tasks',
      })
    } else if (days <= 3) {
      newNotifs.push({
        title: 'Deadline in 3 Days',
        message: `Your ${task.title}${task.course_title ? ` for ${task.course_title}` : ''} is due in ${days} days. Start preparing now.`,
        category: 'reminder',
        priority: 'medium',
        task_id: task.id,
        read: false,
        read_at: null,
        action_url: 'tasks',
      })
    } else if (days <= 7) {
      newNotifs.push({
        title: 'Upcoming Task',
        message: `Your ${task.title}${task.course_title ? ` for ${task.course_title}` : ''} is due in ${days} days.`,
        category: 'reminder',
        priority: 'low',
        task_id: task.id,
        read: false,
        read_at: null,
        action_url: 'tasks',
      })
    }
  }

  if (newNotifs.length === 0) return

  if (!supabase) {
    const local = readLocal()
    for (const n of newNotifs) {
      local.unshift({ ...n, id: crypto.randomUUID(), created_at: new Date().toISOString() })
    }
    writeLocal(local)
    return
  }
  await supabase.from('notifications').insert(newNotifs)
}
