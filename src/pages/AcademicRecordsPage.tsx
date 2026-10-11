import { useState } from 'react'
import {
  GraduationCap,
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  Award,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import { formatScore, formatDate } from '@/lib/utils'
import {
  departments,
  programs,
  semesters,
  theoryAssessment,
  practicalAssessment,
  getGradeForPercentage,
} from '@/config/university'

interface AssessmentRecord {
  id: string
  courseCode: string
  courseTitle: string
  semester: number
  assessmentName: string
  maxMarks: number
  obtainedMarks: number
  percentage: number
  grade: string
  date: string
}

const STORAGE_KEY = 'aspp_assessment_records'

function readLocal(): AssessmentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as AssessmentRecord[]
  } catch {
    return []
  }
}

function writeLocal(records: AssessmentRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // ignore
  }
}

export function AcademicRecordsPage() {
  const { addToast } = useToast()
  const [records, setRecords] = useState<AssessmentRecord[]>(() => readLocal())
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AssessmentRecord | null>(null)
  const [filterSemester, setFilterSemester] = useState('')

  // Form state
  const [fCourseCode, setFCourseCode] = useState('')
  const [fCourseTitle, setFCourseTitle] = useState('')
  const [fSemester, setFSemester] = useState(1)
  const [fAssessmentType, setFAssessmentType] = useState<'theory' | 'practical'>('theory')
  const [fAssessmentName, setFAssessmentName] = useState('')
  const [fObtained, setFObtained] = useState('')
  const [fMax, setFMax] = useState('')
  const [fDate, setFDate] = useState('')

  const components = fAssessmentType === 'theory' ? theoryAssessment : practicalAssessment

  const filtered = filterSemester
    ? records.filter((r) => r.semester === parseInt(filterSemester))
    : records

  const handleAdd = () => {
    const obtained = parseFloat(fObtained)
    const max = parseFloat(fMax)
    if (isNaN(obtained) || isNaN(max) || max <= 0) {
      addToast('error', 'Invalid marks', 'Enter valid obtained and maximum marks.')
      return
    }
    if (!fCourseTitle.trim()) {
      addToast('error', 'Course required', 'Enter a course title.')
      return
    }
    const pct = Math.min(100, Math.max(0, (obtained / max) * 100))
    const boundary = getGradeForPercentage(pct)
    const record: AssessmentRecord = {
      id: crypto.randomUUID(),
      courseCode: fCourseCode.trim() || 'N/A',
      courseTitle: fCourseTitle.trim(),
      semester: fSemester,
      assessmentName: fAssessmentName || (fAssessmentType === 'theory' ? 'Theory' : 'Practical'),
      maxMarks: max,
      obtainedMarks: obtained,
      percentage: pct,
      grade: boundary?.letter || 'F',
      date: fDate || new Date().toISOString(),
    }
    const updated = [record, ...records]
    setRecords(updated)
    writeLocal(updated)
    addToast('success', 'Assessment recorded', `${fCourseTitle}: ${obtained}/${max} = ${pct.toFixed(1)}% (Grade ${record.grade})`)
    resetForm()
    setShowModal(false)
  }

  const resetForm = () => {
    setFCourseCode('')
    setFCourseTitle('')
    setFSemester(1)
    setFAssessmentType('theory')
    setFAssessmentName('')
    setFObtained('')
    setFMax('')
    setFDate('')
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    const updated = records.filter((r) => r.id !== deleteTarget.id)
    setRecords(updated)
    writeLocal(updated)
    addToast('success', 'Record deleted')
    setDeleteTarget(null)
  }

  const semesterAvg = (sem: number) => {
    const semRecords = records.filter((r) => r.semester === sem)
    if (semRecords.length === 0) return null
    return semRecords.reduce((s, r) => s + r.percentage, 0) / semRecords.length
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Record your assessment scores to track academic progress across semesters and courses.
        </p>
        <Button size="sm" onClick={() => { resetForm(); setShowModal(true) }}>
          <Plus size={16} />
          Add Assessment
        </Button>
      </div>

      {/* Semester summary cards */}
      {records.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {semesters.map((sem) => {
            const avg = semesterAvg(sem.number)
            return (
              <Card key={sem.number} className={avg === null ? 'opacity-50' : ''}>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">Sem {sem.number}</p>
                  <p className="font-display text-lg font-bold tabular-nums">
                    {avg !== null ? formatScore(avg, 1) : '—'}
                  </p>
                  {avg !== null && (
                    <p className="text-xs text-muted-foreground">
                      {getGradeForPercentage(avg)?.letter || 'F'}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Filter */}
      {records.length > 0 && (
        <div className="flex items-center gap-3">
          <select
            className="px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground"
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
          >
            <option value="">All Semesters</option>
            {semesters.map((s) => (
              <option key={s.number} value={s.number}>{s.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Records table */}
      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<GraduationCap size={20} />}
            title="No assessment records yet"
            description="Add your first assessment score to start tracking your academic progress across courses and semesters."
            action={
              <Button size="sm" onClick={() => setShowModal(true)}>
                <Plus size={14} /> Add Assessment
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Semester</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Assessment</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Marks</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">%</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Grade</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">{r.courseTitle}</p>
                      <p className="text-xs text-muted-foreground">{r.courseCode}</p>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">Sem {r.semester}</td>
                    <td className="py-3 px-4 text-muted-foreground">{r.assessmentName}</td>
                    <td className="text-right py-3 px-4 tabular-nums">
                      {r.obtainedMarks}/{r.maxMarks}
                    </td>
                    <td className="text-right py-3 px-4 tabular-nums font-medium">
                      {formatScore(r.percentage, 1)}%
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant={r.grade === 'F' ? 'error' : 'info'}>{r.grade}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">{formatDate(r.date)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDeleteTarget(r)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 flex gap-2">
          <Award size={16} className="flex-shrink-0 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Assessment records are stored locally in your browser. Grades are calculated using the
            Aror University published grading scale. These are unofficial records for your personal
            tracking — always verify against official university results.
          </p>
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); resetForm() }}
        title="Add Assessment Record"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Course Code"
              placeholder="e.g., AI-101"
              value={fCourseCode}
              onChange={(e) => setFCourseCode(e.target.value)}
            />
            <Input
              label="Course Title"
              placeholder="e.g., Programming Fundamentals"
              value={fCourseTitle}
              onChange={(e) => setFCourseTitle(e.target.value)}
              error={!fCourseTitle.trim() ? 'Required' : undefined}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Semester</label>
              <select
                className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground"
                value={fSemester}
                onChange={(e) => setFSemester(parseInt(e.target.value))}
              >
                {semesters.map((s) => (
                  <option key={s.number} value={s.number}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Assessment Type</label>
              <select
                className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground"
                value={fAssessmentType}
                onChange={(e) => setFAssessmentType(e.target.value as 'theory' | 'practical')}
              >
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Assessment Component</label>
            <select
              className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground"
              value={fAssessmentName}
              onChange={(e) => setFAssessmentName(e.target.value)}
            >
              <option value="">— Select component —</option>
              {components.map((c) => (
                <option key={c.id} value={c.name}>{c.name} ({c.maxMarks} marks)</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Marks Obtained"
              type="number"
              placeholder="e.g., 25"
              value={fObtained}
              onChange={(e) => setFObtained(e.target.value)}
              error={fObtained !== '' && isNaN(parseFloat(fObtained)) ? 'Enter a valid number' : undefined}
            />
            <Input
              label="Maximum Marks"
              type="number"
              placeholder="e.g., 30"
              value={fMax}
              onChange={(e) => setFMax(e.target.value)}
              error={fMax !== '' && (isNaN(parseFloat(fMax)) || parseFloat(fMax) <= 0) ? 'Enter a valid number' : undefined}
            />
          </div>
          <Input
            label="Assessment Date"
            type="date"
            value={fDate ? fDate.split('T')[0] : ''}
            onChange={(e) => setFDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setShowModal(false); resetForm() }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdd}>
              Add Record
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Assessment Record"
        message={`Delete ${deleteTarget?.courseTitle} — ${deleteTarget?.assessmentName}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
