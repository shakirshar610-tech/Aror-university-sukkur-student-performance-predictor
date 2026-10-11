import { supabase } from '@/lib/supabase'

export interface Task {
  id: string
  title: string
  description: string | null
  course_code: string | null
  course_title: string | null
  category: string
  deadline: string | null
  priority: string
  status: string
  marks_obtained: number | null
  marks_max: number | null
  weight: number | null
  reminder_enabled: boolean
  reminder_intervals: number[]
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface TaskInput {
  title: string
  description?: string
  course_code?: string
  course_title?: string
  category?: string
  deadline?: string
  priority?: string
  status?: string
  marks_obtained?: number
  marks_max?: number
  weight?: number
  reminder_enabled?: boolean
  reminder_intervals?: number[]
}

const STORAGE_KEY = 'aspp_tasks'

function readLocal(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Task[]
  } catch {
    return []
  }
}

function writeLocal(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch { /* ignore */ }
}

export async function fetchTasks(): Promise<Task[]> {
  if (!supabase) return readLocal()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('deadline', { ascending: true, nullsFirst: false })
  if (error) {
    console.warn('Supabase fetch failed, using local:', error.message)
    return readLocal()
  }
  return (data || []) as Task[]
}

export async function createTask(input: TaskInput): Promise<Task> {
  const payload = {
    title: input.title,
    description: input.description || null,
    course_code: input.course_code || null,
    course_title: input.course_title || null,
    category: input.category || 'assignment',
    deadline: input.deadline || null,
    priority: input.priority || 'medium',
    status: input.status || 'upcoming',
    marks_obtained: input.marks_obtained ?? null,
    marks_max: input.marks_max ?? null,
    weight: input.weight ?? null,
    reminder_enabled: input.reminder_enabled ?? true,
    reminder_intervals: input.reminder_intervals || [7, 3, 1],
  }
  if (!supabase) {
    const task: Task = {
      id: crypto.randomUUID(),
      ...payload,
      reminder_intervals: payload.reminder_intervals as number[],
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const local = readLocal()
    local.push(task)
    writeLocal(local)
    return task
  }
  const { data, error } = await supabase.from('tasks').insert(payload).select('*').single()
  if (error) throw error
  return data as Task
}

export async function updateTask(id: string, updates: Partial<TaskInput>): Promise<Task> {
  if (!supabase) {
    const local = readLocal()
    const idx = local.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('Task not found')
    local[idx] = { ...local[idx], ...updates, updated_at: new Date().toISOString() }
    writeLocal(local)
    return local[idx]
  }
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select('*').single()
  if (error) throw error
  return data as Task
}

export async function deleteTask(id: string): Promise<void> {
  if (!supabase) {
    const local = readLocal().filter((t) => t.id !== id)
    writeLocal(local)
    return
  }
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export function isOverdue(task: Task): boolean {
  if (!task.deadline || task.status === 'completed' || task.status === 'cancelled') return false
  return new Date(task.deadline) < new Date()
}

export function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(deadline)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
