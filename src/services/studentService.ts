import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Student, StudentInput } from '@/types'

const STORAGE_KEY = 'spp_students'

function readLocal(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Student[]
  } catch {
    return []
  }
}

function writeLocal(records: Student[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // ignore quota errors
  }
}

export async function fetchStudents(): Promise<Student[]> {
  if (!supabase) return readLocal()
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.warn('Supabase fetch failed, falling back to local:', error.message)
    return readLocal()
  }
  return (data || []) as Student[]
}

export async function createStudent(input: StudentInput): Promise<Student> {
  if (!supabase) {
    const student: Student = {
      id: crypto.randomUUID(),
      student_name: input.student_name,
      student_code: input.student_code || '',
      course: input.course || 'General',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const local = readLocal()
    local.unshift(student)
    writeLocal(local)
    return student
  }
  const { data, error } = await supabase
    .from('students')
    .insert({
      student_name: input.student_name,
      student_code: input.student_code || null,
      course: input.course || 'General',
    })
    .select()
    .single()
  if (error) throw error
  return data as Student
}

export async function updateStudent(id: string, input: Partial<StudentInput>): Promise<Student> {
  if (!supabase) {
    const local = readLocal()
    const idx = local.findIndex((s) => s.id === id)
    if (idx === -1) throw new Error('Student not found')
    local[idx] = { ...local[idx], ...input, updated_at: new Date().toISOString() }
    writeLocal(local)
    return local[idx]
  }
  const { data, error } = await supabase
    .from('students')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Student
}

export async function deleteStudent(id: string): Promise<void> {
  if (!supabase) {
    const local = readLocal().filter((s) => s.id !== id)
    writeLocal(local)
    return
  }
  const { error } = await supabase.from('students').delete().eq('id', id)
  if (error) throw error
}

export async function fetchStudentById(id: string): Promise<Student | null> {
  if (!supabase) {
    return readLocal().find((s) => s.id === id) || null
  }
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as Student | null
}

export { isSupabaseConfigured }
