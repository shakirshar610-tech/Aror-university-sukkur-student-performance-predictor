import { supabase } from '@/lib/supabase'

export interface AcademicEvent {
  id: string
  title: string
  description: string | null
  course_code: string | null
  event_type: string
  start_date: string
  end_date: string | null
  all_day: boolean
  location: string | null
  color: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface EventInput {
  title: string
  description?: string
  course_code?: string
  event_type?: string
  start_date: string
  end_date?: string
  all_day?: boolean
  location?: string
  color?: string
}

const STORAGE_KEY = 'aspp_events'

function readLocal(): AcademicEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as AcademicEvent[]
  } catch {
    return []
  }
}

function writeLocal(events: AcademicEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch { /* ignore */ }
}

export async function fetchEvents(): Promise<AcademicEvent[]> {
  if (!supabase) return readLocal()
  const { data, error } = await supabase
    .from('academic_events')
    .select('*')
    .order('start_date', { ascending: true })
  if (error) {
    return readLocal()
  }
  return (data || []) as AcademicEvent[]
}

export async function createEvent(input: EventInput): Promise<AcademicEvent> {
  const payload = {
    title: input.title,
    description: input.description || null,
    course_code: input.course_code || null,
    event_type: input.event_type || 'study',
    start_date: input.start_date,
    end_date: input.end_date || input.start_date,
    all_day: input.all_day ?? false,
    location: input.location || null,
    color: input.color || 'hsl(230, 55%, 50%)',
    created_by: 'student',
  }
  if (!supabase) {
    const event: AcademicEvent = {
      id: crypto.randomUUID(),
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const local = readLocal()
    local.push(event)
    writeLocal(local)
    return event
  }
  const { data, error } = await supabase.from('academic_events').insert(payload).select('*').single()
  if (error) throw error
  return data as AcademicEvent
}

export async function deleteEvent(id: string): Promise<void> {
  if (!supabase) {
    writeLocal(readLocal().filter((e) => e.id !== id))
    return
  }
  const { error } = await supabase.from('academic_events').delete().eq('id', id)
  if (error) throw error
}

export const eventColors: Record<string, string> = {
  assignment: 'hsl(25, 90%, 55%)',
  quiz: 'hsl(38, 92%, 50%)',
  exam: 'hsl(0, 84%, 60%)',
  lab: 'hsl(172, 70%, 40%)',
  presentation: 'hsl(280, 60%, 55%)',
  study: 'hsl(230, 55%, 50%)',
  class: 'hsl(200, 55%, 45%)',
  personal: 'hsl(142, 71%, 45%)',
  announcement: 'hsl(32, 95%, 50%)',
}
