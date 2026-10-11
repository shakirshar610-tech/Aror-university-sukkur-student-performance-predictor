import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { PredictionRecord } from '@/types'

const STORAGE_KEY = 'aspp_predictions'

function readLocal(): PredictionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PredictionRecord[]
  } catch {
    return []
  }
}

function writeLocal(records: PredictionRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // ignore quota errors
  }
}

export async function fetchPredictions(): Promise<PredictionRecord[]> {
  if (!supabase) return readLocal()
  const { data, error } = await supabase
    .from('predictions')
    .select('*, student:students(*)')
    .order('created_at', { ascending: false })
  if (error) {
    console.warn('Supabase fetch failed, falling back to local:', error.message)
    return readLocal()
  }
  return (data || []) as PredictionRecord[]
}

export async function createPrediction(input: {
  student_id: string | null
  study_hours: number
  attendance: number
  previous_score: number
  predicted_score: number
  model_version: string
}): Promise<PredictionRecord> {
  if (!supabase) {
    const record: PredictionRecord = {
      id: crypto.randomUUID(),
      student_id: input.student_id,
      study_hours: input.study_hours,
      attendance: input.attendance,
      previous_score: input.previous_score,
      predicted_score: input.predicted_score,
      model_version: input.model_version,
      created_at: new Date().toISOString(),
      student: null,
    }
    const local = readLocal()
    local.unshift(record)
    writeLocal(local)
    return record
  }
  const { data, error } = await supabase
    .from('predictions')
    .insert({
      student_id: input.student_id,
      study_hours: input.study_hours,
      attendance: input.attendance,
      previous_score: input.previous_score,
      predicted_score: input.predicted_score,
      model_version: input.model_version,
    })
    .select('*, student:students(*)')
    .single()
  if (error) throw error
  return data as PredictionRecord
}

export async function deletePrediction(id: string): Promise<void> {
  if (!supabase) {
    const local = readLocal().filter((r) => r.id !== id)
    writeLocal(local)
    return
  }
  const { error } = await supabase.from('predictions').delete().eq('id', id)
  if (error) throw error
}

export async function fetchPredictionsByStudent(studentId: string): Promise<PredictionRecord[]> {
  if (!supabase) {
    return readLocal().filter((p) => p.student_id === studentId)
  }
  const { data, error } = await supabase
    .from('predictions')
    .select('*, student:students(*)')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  if (error) {
    return readLocal().filter((p) => p.student_id === studentId)
  }
  return (data || []) as PredictionRecord[]
}

export { isSupabaseConfigured }
