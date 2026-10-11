import type { StudentRecord } from '../types'

// Training dataset: 100 student records with realistic feature/target relationships.
// Features: study_hours (0-12), attendance (0-100), previous_score (0-100)
// Target: final_score (0-100)
// This is synthetic educational data for demonstrating linear regression.

export const trainingData: StudentRecord[] = [
  { study_hours: 2.0, attendance: 60, previous_score: 55, final_score: 52 },
  { study_hours: 3.0, attendance: 70, previous_score: 60, final_score: 58 },
  { study_hours: 4.0, attendance: 75, previous_score: 65, final_score: 64 },
  { study_hours: 5.0, attendance: 80, previous_score: 70, final_score: 70 },
  { study_hours: 6.0, attendance: 85, previous_score: 72, final_score: 75 },
  { study_hours: 7.0, attendance: 88, previous_score: 75, final_score: 80 },
  { study_hours: 8.0, attendance: 90, previous_score: 78, final_score: 85 },
  { study_hours: 9.0, attendance: 92, previous_score: 82, final_score: 90 },
  { study_hours: 10.0, attendance: 95, previous_score: 85, final_score: 93 },
  { study_hours: 1.0, attendance: 50, previous_score: 45, final_score: 42 },
  { study_hours: 2.5, attendance: 65, previous_score: 58, final_score: 55 },
  { study_hours: 3.5, attendance: 72, previous_score: 62, final_score: 61 },
  { study_hours: 4.5, attendance: 78, previous_score: 68, final_score: 67 },
  { study_hours: 5.5, attendance: 82, previous_score: 71, final_score: 73 },
  { study_hours: 6.5, attendance: 86, previous_score: 74, final_score: 78 },
  { study_hours: 7.5, attendance: 89, previous_score: 77, final_score: 83 },
  { study_hours: 8.5, attendance: 91, previous_score: 80, final_score: 88 },
  { study_hours: 9.5, attendance: 94, previous_score: 83, final_score: 91 },
  { study_hours: 1.5, attendance: 55, previous_score: 48, final_score: 46 },
  { study_hours: 2.0, attendance: 68, previous_score: 56, final_score: 54 },
  { study_hours: 3.0, attendance: 74, previous_score: 63, final_score: 60 },
  { study_hours: 4.0, attendance: 77, previous_score: 66, final_score: 66 },
  { study_hours: 5.0, attendance: 81, previous_score: 69, final_score: 71 },
  { study_hours: 6.0, attendance: 84, previous_score: 73, final_score: 76 },
  { study_hours: 7.0, attendance: 87, previous_score: 76, final_score: 81 },
  { study_hours: 8.0, attendance: 90, previous_score: 79, final_score: 86 },
  { study_hours: 9.0, attendance: 93, previous_score: 81, final_score: 89 },
  { study_hours: 10.0, attendance: 96, previous_score: 88, final_score: 95 },
  { study_hours: 0.5, attendance: 45, previous_score: 40, final_score: 38 },
  { study_hours: 1.0, attendance: 52, previous_score: 50, final_score: 45 },
  { study_hours: 2.0, attendance: 62, previous_score: 54, final_score: 53 },
  { study_hours: 3.0, attendance: 71, previous_score: 61, final_score: 59 },
  { study_hours: 4.0, attendance: 76, previous_score: 67, final_score: 65 },
  { study_hours: 5.0, attendance: 83, previous_score: 70, final_score: 72 },
  { study_hours: 6.0, attendance: 87, previous_score: 75, final_score: 77 },
  { study_hours: 7.0, attendance: 90, previous_score: 78, final_score: 82 },
  { study_hours: 8.0, attendance: 92, previous_score: 81, final_score: 87 },
  { study_hours: 9.0, attendance: 95, previous_score: 84, final_score: 92 },
  { study_hours: 3.0, attendance: 80, previous_score: 58, final_score: 62 },
  { study_hours: 5.0, attendance: 65, previous_score: 72, final_score: 67 },
  { study_hours: 7.0, attendance: 78, previous_score: 68, final_score: 74 },
  { study_hours: 4.0, attendance: 90, previous_score: 60, final_score: 68 },
  { study_hours: 6.0, attendance: 70, previous_score: 75, final_score: 72 },
  { study_hours: 8.0, attendance: 85, previous_score: 73, final_score: 82 },
  { study_hours: 2.0, attendance: 88, previous_score: 52, final_score: 56 },
  { study_hours: 5.0, attendance: 92, previous_score: 66, final_score: 74 },
  { study_hours: 9.0, attendance: 80, previous_score: 86, final_score: 85 },
  { study_hours: 1.0, attendance: 75, previous_score: 48, final_score: 48 },
  { study_hours: 6.0, attendance: 95, previous_score: 70, final_score: 80 },
  { study_hours: 3.0, attendance: 58, previous_score: 64, final_score: 57 },
  { study_hours: 7.0, attendance: 82, previous_score: 71, final_score: 76 },
  { study_hours: 4.0, attendance: 68, previous_score: 62, final_score: 61 },
  { study_hours: 8.0, attendance: 88, previous_score: 76, final_score: 85 },
  { study_hours: 5.0, attendance: 73, previous_score: 68, final_score: 69 },
  { study_hours: 10.0, attendance: 90, previous_score: 80, final_score: 91 },
  { study_hours: 2.0, attendance: 78, previous_score: 50, final_score: 53 },
  { study_hours: 6.0, attendance: 91, previous_score: 72, final_score: 79 },
  { study_hours: 4.0, attendance: 84, previous_score: 64, final_score: 69 },
  { study_hours: 9.0, attendance: 87, previous_score: 82, final_score: 88 },
  { study_hours: 7.0, attendance: 76, previous_score: 74, final_score: 77 },
  { study_hours: 5.0, attendance: 89, previous_score: 67, final_score: 73 },
  { study_hours: 3.5, attendance: 73, previous_score: 65, final_score: 63 },
  { study_hours: 6.5, attendance: 88, previous_score: 76, final_score: 80 },
  { study_hours: 1.5, attendance: 60, previous_score: 52, final_score: 47 },
  { study_hours: 8.5, attendance: 93, previous_score: 82, final_score: 89 },
  { study_hours: 4.5, attendance: 79, previous_score: 69, final_score: 68 },
  { study_hours: 2.5, attendance: 66, previous_score: 57, final_score: 56 },
  { study_hours: 9.5, attendance: 91, previous_score: 85, final_score: 92 },
  { study_hours: 7.5, attendance: 84, previous_score: 78, final_score: 84 },
  { study_hours: 5.5, attendance: 80, previous_score: 71, final_score: 74 },
  { study_hours: 3.0, attendance: 85, previous_score: 59, final_score: 64 },
  { study_hours: 6.0, attendance: 72, previous_score: 73, final_score: 73 },
  { study_hours: 8.0, attendance: 89, previous_score: 77, final_score: 86 },
  { study_hours: 1.0, attendance: 48, previous_score: 42, final_score: 40 },
  { study_hours: 4.0, attendance: 81, previous_score: 63, final_score: 67 },
  { study_hours: 10.0, attendance: 97, previous_score: 90, final_score: 96 },
  { study_hours: 2.0, attendance: 70, previous_score: 54, final_score: 51 },
  { study_hours: 7.0, attendance: 83, previous_score: 72, final_score: 78 },
  { study_hours: 5.0, attendance: 76, previous_score: 68, final_score: 70 },
  { study_hours: 9.0, attendance: 90, previous_score: 83, final_score: 90 },
  { study_hours: 3.0, attendance: 63, previous_score: 60, final_score: 58 },
  { study_hours: 6.0, attendance: 86, previous_score: 74, final_score: 78 },
  { study_hours: 8.0, attendance: 91, previous_score: 79, final_score: 87 },
  { study_hours: 4.5, attendance: 75, previous_score: 66, final_score: 66 },
  { study_hours: 1.5, attendance: 58, previous_score: 49, final_score: 46 },
  { study_hours: 7.5, attendance: 87, previous_score: 76, final_score: 83 },
  { study_hours: 5.5, attendance: 82, previous_score: 70, final_score: 73 },
  { study_hours: 2.5, attendance: 67, previous_score: 56, final_score: 55 },
  { study_hours: 9.5, attendance: 93, previous_score: 84, final_score: 91 },
  { study_hours: 3.5, attendance: 77, previous_score: 62, final_score: 62 },
  { study_hours: 6.5, attendance: 85, previous_score: 75, final_score: 79 },
  { study_hours: 0.5, attendance: 40, previous_score: 35, final_score: 33 },
  { study_hours: 8.5, attendance: 94, previous_score: 81, final_score: 89 },
  { study_hours: 4.0, attendance: 69, previous_score: 61, final_score: 62 },
  { study_hours: 7.0, attendance: 81, previous_score: 73, final_score: 77 },
  { study_hours: 5.0, attendance: 78, previous_score: 69, final_score: 71 },
  { study_hours: 10.0, attendance: 98, previous_score: 92, final_score: 97 },
  { study_hours: 2.0, attendance: 64, previous_score: 53, final_score: 52 },
  { study_hours: 6.0, attendance: 83, previous_score: 72, final_score: 76 },
  { study_hours: 3.0, attendance: 73, previous_score: 61, final_score: 60 },
  { study_hours: 9.0, attendance: 89, previous_score: 82, final_score: 89 },
  { study_hours: 4.5, attendance: 80, previous_score: 67, final_score: 68 },
  { study_hours: 7.5, attendance: 86, previous_score: 77, final_score: 82 },
]

export const csvHeaders = 'study_hours,attendance,previous_score,final_score'

export function dataToCSV(data: StudentRecord[]): string {
  const rows = data.map(
    (r) => `${r.study_hours},${r.attendance},${r.previous_score},${r.final_score}`,
  )
  return [csvHeaders, ...rows].join('\n')
}

export function parseCSV(text: string): StudentRecord[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headerLine = lines[0].trim().toLowerCase()
  const headers = headerLine.split(',').map((h) => h.trim())

  const studyIdx = headers.findIndex((h) => h === 'study_hours')
  const attIdx = headers.findIndex((h) => h === 'attendance')
  const prevIdx = headers.findIndex((h) => h === 'previous_score')
  const finalIdx = headers.findIndex((h) => h === 'final_score')

  if (studyIdx === -1 || attIdx === -1 || prevIdx === -1 || finalIdx === -1) {
    throw new Error('CSV must contain columns: study_hours, attendance, previous_score, final_score')
  }

  const records: StudentRecord[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim())
    if (cols.length < headers.length) continue
    const study = parseFloat(cols[studyIdx])
    const att = parseFloat(cols[attIdx])
    const prev = parseFloat(cols[prevIdx])
    const final = parseFloat(cols[finalIdx])
    if (isNaN(study) || isNaN(att) || isNaN(prev) || isNaN(final)) continue
    records.push({
      study_hours: study,
      attendance: att,
      previous_score: prev,
      final_score: final,
    })
  }
  return records
}
