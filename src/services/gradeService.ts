import { supabase } from '@/lib/supabase'
import { getGradeForPercentage, type GradeBoundary } from '@/config/university'

export interface GradeRecord {
  id: string
  course_code: string
  course_title: string | null
  credit_hours: number
  semester: number
  assessment_type: string
  marks_obtained: number
  marks_max: number
  weight: number
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface GradeInput {
  course_code: string
  course_title?: string
  credit_hours?: number
  semester?: number
  assessment_type?: string
  marks_obtained: number
  marks_max: number
  weight?: number
  is_verified?: boolean
}

const STORAGE_KEY = 'aspp_grade_records'

function readLocal(): GradeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as GradeRecord[]
  } catch {
    return []
  }
}

function writeLocal(records: GradeRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch { /* ignore */ }
}

export async function fetchGradeRecords(): Promise<GradeRecord[]> {
  if (!supabase) return readLocal()
  const { data, error } = await supabase
    .from('grade_records')
    .select('*')
    .order('semester', { ascending: true })
  if (error) return readLocal()
  return (data || []) as GradeRecord[]
}

export async function createGradeRecord(input: GradeInput): Promise<GradeRecord> {
  const payload = {
    course_code: input.course_code,
    course_title: input.course_title || null,
    credit_hours: input.credit_hours ?? 3,
    semester: input.semester ?? 1,
    assessment_type: input.assessment_type || 'sessional',
    marks_obtained: input.marks_obtained,
    marks_max: input.marks_max,
    weight: input.weight ?? 30,
    is_verified: input.is_verified ?? false,
  }
  if (!supabase) {
    const record: GradeRecord = {
      id: crypto.randomUUID(),
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const local = readLocal()
    local.push(record)
    writeLocal(local)
    return record
  }
  const { data, error } = await supabase.from('grade_records').insert(payload).select('*').single()
  if (error) throw error
  return data as GradeRecord
}

export async function updateGradeRecord(id: string, updates: Partial<GradeInput>): Promise<GradeRecord> {
  if (!supabase) {
    const local = readLocal()
    const idx = local.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Record not found')
    local[idx] = { ...local[idx], ...updates, updated_at: new Date().toISOString() }
    writeLocal(local)
    return local[idx]
  }
  const { data, error } = await supabase.from('grade_records').update(updates).eq('id', id).select('*').single()
  if (error) throw error
  return data as GradeRecord
}

export async function deleteGradeRecord(id: string): Promise<void> {
  if (!supabase) {
    writeLocal(readLocal().filter((r) => r.id !== id))
    return
  }
  const { error } = await supabase.from('grade_records').delete().eq('id', id)
  if (error) throw error
}

export interface CourseGradeSummary {
  course_code: string
  course_title: string
  credit_hours: number
  semester: number
  weightedPercentage: number
  grade: GradeBoundary | null
  is_verified: boolean
  records: GradeRecord[]
}

export function summarizeGrades(records: GradeRecord[]): CourseGradeSummary[] {
  const byCourse = new Map<string, GradeRecord[]>()
  for (const r of records) {
    if (!byCourse.has(r.course_code)) byCourse.set(r.course_code, [])
    byCourse.get(r.course_code)!.push(r)
  }
  const summaries: CourseGradeSummary[] = []
  for (const [code, recs] of byCourse) {
    const totalWeight = recs.reduce((s, r) => s + r.weight, 0)
    const weightedSum = recs.reduce((s, r) => {
      const pct = (r.marks_obtained / r.marks_max) * 100
      return s + pct * r.weight
    }, 0)
    const weightedPct = totalWeight > 0 ? weightedSum / totalWeight : 0
    summaries.push({
      course_code: code,
      course_title: recs[0].course_title || code,
      credit_hours: recs[0].credit_hours,
      semester: recs[0].semester,
      weightedPercentage: weightedPct,
      grade: getGradeForPercentage(weightedPct),
      is_verified: recs.every((r) => r.is_verified),
      records: recs.sort((a, b) => a.assessment_type.localeCompare(b.assessment_type)),
    })
  }
  return summaries.sort((a, b) => a.semester - b.semester)
}

export interface GPAResult {
  semester: number
  gpa: number
  totalCredits: number
  qualityPoints: number
  courses: CourseGradeSummary[]
}

export function calculateSemesterGPA(records: GradeRecord[], semester: number): GPAResult | null {
  const semRecords = records.filter((r) => r.semester === semester)
  if (semRecords.length === 0) return null
  const summaries = summarizeGrades(semRecords)
  let totalCredits = 0
  let qualityPoints = 0
  for (const s of summaries) {
    if (s.grade && s.grade.letter !== 'F') {
      totalCredits += s.credit_hours
      qualityPoints += s.grade.gradePoint * s.credit_hours
    }
  }
  return {
    semester,
    gpa: totalCredits > 0 ? qualityPoints / totalCredits : 0,
    totalCredits,
    qualityPoints,
    courses: summaries,
  }
}

export function calculateCGPA(records: GradeRecord[]): number {
  const summaries = summarizeGrades(records)
  let totalCredits = 0
  let qualityPoints = 0
  for (const s of summaries) {
    if (s.grade && s.grade.letter !== 'F') {
      totalCredits += s.credit_hours
      qualityPoints += s.grade.gradePoint * s.credit_hours
    }
  }
  return totalCredits > 0 ? qualityPoints / totalCredits : 0
}

export function calculateRequiredFinalScore(
  currentPercentage: number,
  finalWeight: number,
  targetPercentage: number,
): number | null {
  const currentWeight = 100 - finalWeight
  if (finalWeight <= 0) return null
  const required = (targetPercentage * 100 - currentPercentage * currentWeight) / finalWeight
  return Math.min(100, Math.max(0, required))
}
