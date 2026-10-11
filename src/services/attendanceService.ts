import { supabase } from '@/lib/supabase'

export interface AttendanceRecord {
  id: string
  course_code: string
  course_title: string | null
  semester: number
  classes_held: number
  classes_attended: number
  date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AttendanceInput {
  course_code: string
  course_title?: string
  semester?: number
  classes_held: number
  classes_attended: number
  date?: string
  notes?: string
}

const STORAGE_KEY = 'aspp_attendance'

function readLocal(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as AttendanceRecord[]
  } catch {
    return []
  }
}

function writeLocal(records: AttendanceRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch { /* ignore */ }
}

export async function fetchAttendance(): Promise<AttendanceRecord[]> {
  if (!supabase) return readLocal()
  const { data, error } = await supabase
    .from('attendance_records')
    .select('*')
    .order('date', { ascending: false })
  if (error) {
    return readLocal()
  }
  return (data || []) as AttendanceRecord[]
}

export async function createAttendance(input: AttendanceInput): Promise<AttendanceRecord> {
  const payload = {
    course_code: input.course_code,
    course_title: input.course_title || null,
    semester: input.semester || 1,
    classes_held: input.classes_held,
    classes_attended: input.classes_attended,
    date: input.date || new Date().toISOString().split('T')[0],
    notes: input.notes || null,
  }
  if (!supabase) {
    const record: AttendanceRecord = {
      id: crypto.randomUUID(),
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const local = readLocal()
    local.unshift(record)
    writeLocal(local)
    return record
  }
  const { data, error } = await supabase.from('attendance_records').insert(payload).select('*').single()
  if (error) throw error
  return data as AttendanceRecord
}

export async function updateAttendance(id: string, updates: Partial<AttendanceInput>): Promise<AttendanceRecord> {
  if (!supabase) {
    const local = readLocal()
    const idx = local.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Record not found')
    local[idx] = { ...local[idx], ...updates, updated_at: new Date().toISOString() }
    writeLocal(local)
    return local[idx]
  }
  const { data, error } = await supabase.from('attendance_records').update(updates).eq('id', id).select('*').single()
  if (error) throw error
  return data as AttendanceRecord
}

export async function deleteAttendance(id: string): Promise<void> {
  if (!supabase) {
    writeLocal(readLocal().filter((r) => r.id !== id))
    return
  }
  const { error } = await supabase.from('attendance_records').delete().eq('id', id)
  if (error) throw error
}

export interface CourseAttendanceSummary {
  course_code: string
  course_title: string
  totalHeld: number
  totalAttended: number
  percentage: number
  records: AttendanceRecord[]
}

export function summarizeAttendance(records: AttendanceRecord[]): CourseAttendanceSummary[] {
  const byCourse = new Map<string, AttendanceRecord[]>()
  for (const r of records) {
    const key = r.course_code
    if (!byCourse.has(key)) byCourse.set(key, [])
    byCourse.get(key)!.push(r)
  }
  const summaries: CourseAttendanceSummary[] = []
  for (const [code, recs] of byCourse) {
    const held = recs.reduce((s, r) => s + r.classes_held, 0)
    const attended = recs.reduce((s, r) => s + r.classes_attended, 0)
    summaries.push({
      course_code: code,
      course_title: recs[0].course_title || code,
      totalHeld: held,
      totalAttended: attended,
      percentage: held > 0 ? (attended / held) * 100 : 0,
      records: recs.sort((a, b) => b.date.localeCompare(a.date)),
    })
  }
  return summaries.sort((a, b) => b.percentage - a.percentage)
}

export function projectAttendance(
  currentHeld: number,
  currentAttended: number,
  futureClasses: number,
  willAttend: number,
): { projectedPercentage: number; classesNeeded: number } {
  const totalHeld = currentHeld + futureClasses
  const totalAttended = currentAttended + willAttend
  const projected = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 0
  const target = 75
  let classesNeeded = 0
  if (projected < target && currentHeld > 0) {
    const needed = Math.ceil((target * (currentHeld + futureClasses) - currentAttended - willAttend) / 100)
    classesNeeded = Math.max(0, needed)
  }
  return { projectedPercentage: projected, classesNeeded }
}
