import { useState, useEffect, useMemo } from 'react'
import {
  Calculator, Plus, Trash2, TrendingUp, Award, Target, Info,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import {
  fetchGradeRecords, createGradeRecord, deleteGradeRecord,
  summarizeGrades, calculateSemesterGPA, calculateCGPA, calculateRequiredFinalScore,
  type GradeRecord,
} from '@/services/gradeService'
import { allCourses, gradeScale, theoryAssessment, type GradeBoundary } from '@/config/university'
import { formatScore } from '@/lib/utils'

const ASSESSMENT_TYPES = [
  { value: 'sessional', label: 'Sessional', weight: 30 },
  { value: 'midterm', label: 'Midterm', weight: 30 },
  { value: 'final', label: 'Final', weight: 40 },
]

export function GradeCalculatorPage() {
  const { addToast } = useToast()
  const [records, setRecords] = useState<GradeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GradeRecord | null>(null)
  const [selectedSemester, setSelectedSemester] = useState(1)

  // Form
  const [fCourseCode, setFCourseCode] = useState('')
  const [fAssessmentType, setFAssessmentType] = useState('sessional')
  const [fMarksObtained, setFMarksObtained] = useState('')
  const [fMarksMax, setFMarksMax] = useState('')
  const [fSemester, setFSemester] = useState('1')
  const [fCreditHours, setFCreditHours] = useState('3')

  // Simulator
  const [simCurrentPct, setSimCurrentPct] = useState('65')
  const [simFinalWeight, setSimFinalWeight] = useState('40')
  const [simTargetPct, setSimTargetPct] = useState('80')

  const load = async () => {
    setLoading(true)
    const data = await fetchGradeRecords()
    setRecords(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const summaries = useMemo(() => summarizeGrades(records), [records])
  const semesterSummaries = useMemo(
    () => summaries.filter((s) => s.semester === selectedSemester),
    [summaries, selectedSemester],
  )

  const cgpa = useMemo(() => calculateCGPA(records), [records])
  const semesterGPA = useMemo(() => calculateSemesterGPA(records, selectedSemester), [records, selectedSemester])

  const availableSemesters = useMemo(() => {
    const set = new Set(records.map((r) => r.semester))
    return Array.from(set).sort((a, b) => a - b)
  }, [records])

  const chartData = useMemo(() => {
    return semesterSummaries.map((s) => ({
      course: s.course_title.length > 12 ? s.course_title.substring(0, 12) + '...' : s.course_title,
      percentage: Math.round(s.weightedPercentage * 10) / 10,
      color: s.weightedPercentage >= 60 ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)',
    }))
  }, [semesterSummaries])

  const requiredFinalScore = useMemo(() => {
    const current = parseFloat(simCurrentPct)
    const weight = parseFloat(simFinalWeight)
    const target = parseFloat(simTargetPct)
    if (isNaN(current) || isNaN(weight) || isNaN(target)) return null
    return calculateRequiredFinalScore(current, weight, target)
  }, [simCurrentPct, simFinalWeight, simTargetPct])

  const handleAdd = async () => {
    const obtained = parseFloat(fMarksObtained)
    const max = parseFloat(fMarksMax)
    if (isNaN(obtained) || isNaN(max)) { addToast('error', 'Invalid marks', 'Enter valid numbers.'); return }
    if (max <= 0) { addToast('error', 'Invalid max marks', 'Max marks must be greater than 0.'); return }
    if (obtained > max) { addToast('error', 'Invalid marks', 'Obtained marks cannot exceed max marks.'); return }
    if (!fCourseCode) { addToast('error', 'Course required'); return }
    const course = allCourses.find((c) => c.courseCode === fCourseCode)
    const aType = ASSESSMENT_TYPES.find((a) => a.value === fAssessmentType)
    try {
      await createGradeRecord({
        course_code: fCourseCode,
        course_title: course?.title,
        credit_hours: parseInt(fCreditHours) || 3,
        semester: parseInt(fSemester) || 1,
        assessment_type: fAssessmentType,
        marks_obtained: obtained,
        marks_max: max,
        weight: aType?.weight || 30,
      })
      addToast('success', 'Grade recorded', `${obtained}/${max} for ${course?.title || fCourseCode}.`)
      resetForm(); setShowModal(false); load()
    } catch (err) {
      addToast('error', 'Failed to record grade', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const resetForm = () => {
    setFCourseCode(''); setFAssessmentType('sessional'); setFMarksObtained('')
    setFMarksMax(''); setFSemester('1'); setFCreditHours('3')
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteGradeRecord(deleteTarget.id)
      addToast('success', 'Grade record deleted')
      setDeleteTarget(null); load()
    } catch (err) {
      addToast('error', 'Failed to delete record')
    }
  }

  const gradeBadge = (grade: GradeBoundary | null) => {
    if (!grade) return null
    const variant = grade.letter === 'F' ? 'error' : grade.gradePoint >= 3.5 ? 'success' : grade.gradePoint >= 2.5 ? 'warning' : 'info'
    return <Badge variant={variant}>{grade.letter} ({grade.gradePoint.toFixed(2)})</Badge>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* CGPA + Semester GPA */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><Award size={18} className="text-primary-500" /><p className="text-xs text-muted-foreground">CGPA</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{formatScore(cgpa, 2)}</p>
          <p className="text-xs text-muted-foreground mt-1">out of 4.00</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><Target size={18} className="text-secondary" /><p className="text-xs text-muted-foreground">Semester {selectedSemester} GPA</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{semesterGPA ? formatScore(semesterGPA.gpa, 2) : '—'}</p>
          <p className="text-xs text-muted-foreground mt-1">{semesterGPA ? `${semesterGPA.totalCredits} credits` : 'No data'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={18} className="text-accent" /><p className="text-xs text-muted-foreground">Courses Tracked</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{summaries.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><Calculator size={18} className="text-warning" /><p className="text-xs text-muted-foreground">Grade Records</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{records.length}</p>
        </CardContent></Card>
      </div>

      {/* Simulator */}
      <Card>
        <CardHeader>
          <CardTitle>Final Exam Score Simulator</CardTitle>
          <CardDescription>Calculate what final exam score you need to reach your target grade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Input label="Current Overall %" type="number" value={simCurrentPct} onChange={(e) => setSimCurrentPct(e.target.value)} />
            <Input label="Final Exam Weight %" type="number" value={simFinalWeight} onChange={(e) => setSimFinalWeight(e.target.value)} />
            <Input label="Target Overall %" type="number" value={simTargetPct} onChange={(e) => setSimTargetPct(e.target.value)} />
          </div>
          {requiredFinalScore !== null && (
            <div className="p-4 rounded-lg bg-primary-500/10 border border-primary-500/20">
              <p className="text-sm">
                You need to score <span className="font-bold text-primary-500 text-lg">{formatScore(requiredFinalScore, 1)}%</span>{' '}
                on your final exam to achieve a target of {simTargetPct}% overall.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Formula: Required = (Target × 100 − Current × (100 − FinalWeight)) ÷ FinalWeight
              </p>
              {requiredFinalScore >= 90 && (
                <p className="text-xs text-warning mt-2">This is a very high target — consider adjusting your goal or study plan.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Semester selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {availableSemesters.length > 0 ? availableSemesters.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSemester(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedSemester === s ? 'bg-primary-500 text-white' : 'bg-card border border-border text-muted-foreground hover:bg-muted'}`}
            >
              Semester {s}
            </button>
          )) : (
            <p className="text-sm text-muted-foreground">No grades recorded yet.</p>
          )}
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowModal(true) }}><Plus size={14} /> Add Grade</Button>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Semester {selectedSemester} — Course Performance</CardTitle>
            <CardDescription>Weighted percentage by course</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="course" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} formatter={(v: number) => `${v.toFixed(1)}%`} />
                <ReferenceLine y={60} stroke="hsl(0, 84%, 60%)" strokeDasharray="5 5" label={{ value: 'Pass (60%)', fontSize: 10, fill: 'hsl(0, 84%, 60%)' }} />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Grade records */}
      {loading ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading grades...</CardContent></Card>
      ) : semesterSummaries.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Calculator size={20} />}
            title="No grades for this semester"
            description="Add your assessment marks to calculate your GPA and simulate final exam scenarios."
            action={<Button size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> Add Grade</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {semesterSummaries.map((s) => (
            <Card key={s.course_code}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{s.course_title}</CardTitle>
                    <CardDescription>{s.course_code} — {s.credit_hours} credit hours</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold tabular-nums">{formatScore(s.weightedPercentage, 1)}%</p>
                    {gradeBadge(s.grade)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {s.records.map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-1.5 px-3 rounded-md bg-muted/20 text-sm">
                      <div>
                        <span className="font-medium capitalize">{r.assessment_type}</span>
                        <span className="text-muted-foreground ml-2 tabular-nums">{r.marks_obtained}/{r.marks_max}</span>
                        <span className="text-muted-foreground/70 ml-2">({r.weight}% weight)</span>
                        {!r.is_verified && <Badge variant="info" className="ml-2 text-[10px]">Student-entered</Badge>}
                      </div>
                      <button onClick={() => setDeleteTarget(r)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Grading scale reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Grading Scale</CardTitle>
          <CardDescription>Aror University published grade boundaries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {gradeScale.map(g => (
              <div key={g.letter} className="flex items-center gap-2 p-2 rounded-md bg-muted/20">
                <span className="font-display font-bold text-sm w-8">{g.letter}</span>
                <div>
                  <p className="text-xs tabular-nums">{g.minPercent}-{g.maxPercent}%</p>
                  <p className="text-xs text-muted-foreground tabular-nums">{g.gradePoint.toFixed(2)} GP</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Info size={14} className="flex-shrink-0 mt-0.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Grade calculations use the published Aror University grading policy. All marks are
              student-entered and unofficial unless marked as verified. Theoretical assessment
              components: Sessional (30%), Midterm (30%), Final (40%). Always verify against
              official university results.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm() }} title="Add Grade Record">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Course</label>
            <select className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground" value={fCourseCode} onChange={(e) => setFCourseCode(e.target.value)}>
              <option value="">— Select course —</option>
              {allCourses.map(c => <option key={c.id} value={c.courseCode}>{c.courseCode} — {c.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Assessment Type</label>
              <select className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground" value={fAssessmentType} onChange={(e) => setFAssessmentType(e.target.value)}>
                {ASSESSMENT_TYPES.map(a => <option key={a.value} value={a.value}>{a.label} ({a.weight}%)</option>)}
              </select>
            </div>
            <Input label="Semester" type="number" min={1} max={8} value={fSemester} onChange={(e) => setFSemester(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Marks Obtained" type="number" placeholder="e.g., 25" value={fMarksObtained} onChange={(e) => setFMarksObtained(e.target.value)} />
            <Input label="Max Marks" type="number" placeholder="e.g., 30" value={fMarksMax} onChange={(e) => setFMarksMax(e.target.value)} />
          </div>
          <Input label="Credit Hours" type="number" min={1} max={6} value={fCreditHours} onChange={(e) => setFCreditHours(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setShowModal(false); resetForm() }}>Cancel</Button>
            <Button size="sm" onClick={handleAdd}>Add Grade</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteTarget !== null} title="Delete Grade Record" message="Delete this grade entry?" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
