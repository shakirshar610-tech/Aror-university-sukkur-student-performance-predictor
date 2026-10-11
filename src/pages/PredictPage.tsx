import { useState, useMemo } from 'react'
import {
  Target,
  RotateCcw,
  Info,
  TrendingUp,
  Clock,
  Cpu,
  Plus,
  Trash2,
  Calculator,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Slider } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/context/ToastContext'
import { predict as predictFn, validateInput, getGrade } from '@/model/linearRegression'
import { createPrediction } from '@/services/predictionService'
import { createStudent } from '@/services/studentService'
import { formatScore, formatNumber, formatDate } from '@/lib/utils'
import {
  university,
  departments,
  programs,
  semesters,
  getProgramsByDepartment,
  getCoursesByProgramAndSemester,
  theoryAssessment,
  practicalAssessment,
  calculateAttendancePercentage,
  normalizeToPercentage,
  minAttendanceForExamEligibility,
} from '@/config/university'
import type { TrainedModel, Student, PredictionRecord } from '@/types'

interface PageProps {
  model: TrainedModel
  students: Student[]
  predictions: PredictionRecord[]
  setPredictions: React.Dispatch<React.SetStateAction<PredictionRecord[]>>
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>
}

interface WhatIfScenario {
  id: number
  label: string
  study_hours: number
  attendance: number
  previous_score: number
  predicted: number
}

export function PredictPage({ model, students, predictions, setPredictions, setStudents }: PageProps) {
  const { addToast } = useToast()
  const [studentName, setStudentName] = useState('')
  const [studentCode, setStudentCode] = useState('')
  const [batch, setBatch] = useState('')
  const [section, setSection] = useState('')
  const [departmentId, setDepartmentId] = useState('ai')
  const [programId, setProgramId] = useState('bs-ai')
  const [semesterNum, setSemesterNum] = useState(1)
  const [courseCode, setCourseCode] = useState('')
  const [courseTitle, setCourseTitle] = useState('')
  const [assessmentType, setAssessmentType] = useState<'theory' | 'practical'>('theory')
  const [studyHours, setStudyHours] = useState(5)
  const [attendance, setAttendance] = useState(80)
  const [previousScore, setPreviousScore] = useState(70)
  const [result, setResult] = useState<ReturnType<typeof predictFn> | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [whatIfScenarios, setWhatIfScenarios] = useState<WhatIfScenario[]>([])

  // Attendance calculator state (AOR University formula)
  const [classesAttended, setClassesAttended] = useState('')
  const [totalClasses, setTotalClasses] = useState('')

  // Marks normalization
  const [useMarksInput, setUseMarksInput] = useState(false)
  const [marksObtained, setMarksObtained] = useState('')
  const [marksMax, setMarksMax] = useState('')

  const calcAttendance = useMemo(() => {
    const attended = parseFloat(classesAttended)
    const total = parseFloat(totalClasses)
    if (isNaN(attended) || isNaN(total) || total <= 0) return null
    return calculateAttendancePercentage(attended, total)
  }, [classesAttended, totalClasses])

  const availablePrograms = useMemo(() => getProgramsByDepartment(departmentId), [departmentId])
  const availableCourses = useMemo(
    () => getCoursesByProgramAndSemester(programId, semesterNum),
    [programId, semesterNum],
  )
  const assessmentComponents = useMemo(
    () => (assessmentType === 'theory' ? theoryAssessment : practicalAssessment),
    [assessmentType],
  )

  const errors = useMemo(() => {
    return validateInput({
      study_hours: studyHours,
      attendance,
      previous_score: previousScore,
    })
  }, [studyHours, attendance, previousScore])

  const grade = result ? getGrade(result.predicted_score) : null

  const applyCalculatedAttendance = () => {
    if (calcAttendance === null) {
      addToast('error', 'Invalid input', 'Enter valid class counts to calculate attendance.')
      return
    }
    setAttendance(Math.round(calcAttendance))
    addToast(
      'success',
      'Attendance applied',
      `Attendance set to ${Math.round(calcAttendance)}% using the formula (Classes Attended / Total Classes) x 100.`,
    )
  }

  const applyNormalizedMarks = () => {
    const obtained = parseFloat(marksObtained)
    const max = parseFloat(marksMax)
    if (isNaN(obtained) || isNaN(max) || max <= 0) {
      addToast('error', 'Invalid marks', 'Enter valid obtained and maximum marks.')
      return
    }
    const pct = normalizeToPercentage(obtained, max)
    setPreviousScore(Math.round(pct))
    addToast('success', 'Score normalized', `${obtained}/${max} = ${pct.toFixed(1)}% applied as previous score.`)
  }

  const handleDepartmentChange = (id: string) => {
    setDepartmentId(id)
    const progs = getProgramsByDepartment(id)
    if (progs.length > 0) {
      setProgramId(progs[0].id)
    }
    setCourseCode('')
    setCourseTitle('')
  }

  const handleCourseSelect = (code: string) => {
    const course = availableCourses.find((c) => c.courseCode === code)
    if (course) {
      setCourseCode(course.courseCode)
      setCourseTitle(course.title)
      setAssessmentType(course.type)
    }
  }

  const handlePredict = async () => {
    if (errors.length > 0) {
      addToast('error', 'Validation Error', errors[0])
      return
    }

    setSubmitting(true)
    try {
      const pred = predictFn(model, {
        study_hours: studyHours,
        attendance,
        previous_score: previousScore,
      })
      setResult(pred)

      // If student name is provided, create/link a student record
      let studentId: string | null = null
      if (studentName.trim()) {
        try {
          const existing = students.find(
            (s) =>
              s.student_name.toLowerCase() === studentName.trim().toLowerCase() &&
              (s.student_code || '') === (studentCode.trim() || ''),
          )
          if (existing) {
            studentId = existing.id
          } else {
            const created = await createStudent({
              student_name: studentName.trim(),
              student_code: studentCode.trim(),
              course: courseTitle || 'General',
            })
            studentId = created.id
            setStudents((prev) => [created, ...prev])
          }
        } catch {
          // Student creation is optional — continue with anonymous prediction
        }
      }

      // Save prediction to database (fall back to local record if DB unavailable)
      let saved: PredictionRecord
      try {
        saved = await createPrediction({
          student_id: studentId,
          study_hours: studyHours,
          attendance,
          previous_score: previousScore,
          predicted_score: pred.predicted_score,
          model_version: model.version,
        })
      } catch {
        saved = {
          id: crypto.randomUUID(),
          student_id: studentId,
          study_hours: studyHours,
          attendance,
          previous_score: previousScore,
          predicted_score: pred.predicted_score,
          model_version: model.version,
          created_at: pred.timestamp,
          student: null,
        }
      }
      setPredictions((prev) => [saved, ...prev])
      addToast(
        'success',
        'Prediction generated',
        `Predicted final score: ${formatScore(pred.predicted_score)}/100${grade ? ` (Grade ${grade.letter})` : ''}`,
      )
    } catch (err) {
      addToast('error', 'Prediction failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setStudentName('')
    setStudentCode('')
    setBatch('')
    setSection('')
    setStudyHours(5)
    setAttendance(80)
    setPreviousScore(70)
    setResult(null)
    setClassesAttended('')
    setTotalClasses('')
    setMarksObtained('')
    setMarksMax('')
  }

  const addWhatIf = () => {
    const newScenario: WhatIfScenario = {
      id: Date.now(),
      label: `Scenario ${whatIfScenarios.length + 1}`,
      study_hours: studyHours,
      attendance,
      previous_score: previousScore,
      predicted: predictFn(model, {
        study_hours: studyHours,
        attendance,
        previous_score: previousScore,
      }).predicted_score,
    }
    setWhatIfScenarios((prev) => [...prev, newScenario])
  }

  const removeWhatIf = (id: number) => {
    setWhatIfScenarios((prev) => prev.filter((s) => s.id !== id))
  }

  const contributionData = result
    ? [
        { name: 'Base', value: result.contributions.bias, fill: 'hsl(220, 20%, 50%)' },
        { name: 'Study Hours', value: result.contributions.study_hours, fill: 'hsl(230, 55%, 50%)' },
        { name: 'Attendance', value: result.contributions.attendance, fill: 'hsl(172, 70%, 40%)' },
        { name: 'Prev Score', value: result.contributions.previous_score, fill: 'hsl(32, 95%, 50%)' },
      ]
    : []

  const whatIfChart = whatIfScenarios.map((s) => ({
    name: s.label,
    predicted: s.predicted,
    studyHours: s.study_hours,
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Independence notice */}
      <div className="flex gap-2 p-3 rounded-md bg-warning/10 border border-warning/20">
        <ShieldAlert size={16} className="flex-shrink-0 mt-0.5 text-warning" />
        <p className="text-xs text-warning">
          {university.independenceNote} Predictions are statistical estimates, not official university results.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Information & Prediction Inputs</CardTitle>
            <CardDescription>
              Select your academic context and enter study data to predict your final assessment score
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Student info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Student Name (optional)"
                placeholder="e.g., Ahmed Khan"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
              <Input
                label="Roll Number (optional)"
                placeholder="e.g., F26-001"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Batch (optional)"
                placeholder="e.g., F26"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
              />
              <Input
                label="Section (optional)"
                placeholder="e.g., A"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
            </div>

            {/* Academic context */}
            <div className="border-t border-border pt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Department</label>
                <select
                  className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground"
                  value={departmentId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Degree Program</label>
                <select
                  className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground"
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                >
                  {availablePrograms.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Semester</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground"
                    value={semesterNum}
                    onChange={(e) => setSemesterNum(parseInt(e.target.value))}
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
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value as 'theory' | 'practical')}
                  >
                    <option value="theory">Theory</option>
                    <option value="practical">Practical</option>
                  </select>
                </div>
              </div>

              {availableCourses.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Course (from curriculum)</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground"
                    value={courseCode}
                    onChange={(e) => handleCourseSelect(e.target.value)}
                  >
                    <option value="">— Select a course —</option>
                    {availableCourses.map((c) => (
                      <option key={c.id} value={c.courseCode}>
                        {c.courseCode} — {c.title} ({c.creditHours} cr)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Input
                label="Course Title (if not listed above)"
                placeholder="e.g., Programming Fundamentals"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />
            </div>

            {/* Assessment framework info */}
            <div className="p-3 rounded-md bg-muted/30 border border-border">
              <p className="text-xs font-medium text-foreground mb-1.5">
                {assessmentType === 'theory' ? 'Theory' : 'Practical'} Assessment Framework (Aror University):
              </p>
              <div className="grid grid-cols-3 gap-2">
                {assessmentComponents.map((a) => (
                  <div key={a.id} className="text-center p-1.5 rounded bg-card border border-border">
                    <p className="text-xs text-muted-foreground">{a.name}</p>
                    <p className="text-sm font-semibold tabular-nums">{a.maxMarks} marks</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prediction sliders */}
            <div className="border-t border-border pt-5 space-y-5">
              <Slider
                label="Study Hours Per Day"
                value={studyHours}
                min={0}
                max={24}
                step={0.5}
                unit=" hrs"
                onChange={setStudyHours}
                hint="Typical: 2-8 hrs"
              />
              <div>
                <Slider
                  label="Attendance Percentage"
                  value={attendance}
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                  onChange={setAttendance}
                  hint={`Min for exam: ${minAttendanceForExamEligibility}%`}
                />
                {attendance < minAttendanceForExamEligibility && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
                    <AlertTriangle size={12} />
                    Below {minAttendanceForExamEligibility}% — may not be eligible for examinations
                  </div>
                )}
              </div>
              <Slider
                label="Previous Assessment Score"
                value={previousScore}
                min={0}
                max={100}
                step={1}
                unit=""
                onChange={setPreviousScore}
                hint="0-100"
              />
            </div>

            {/* Marks normalization toggle */}
            <div className="border-t border-border pt-4">
              <button
                onClick={() => setUseMarksInput(!useMarksInput)}
                className="text-sm text-primary-500 hover:underline font-medium"
              >
                {useMarksInput ? 'Hide marks input' : 'Enter marks instead of percentage'}
              </button>
              {useMarksInput && (
                <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                  <Input
                    label="Marks Obtained"
                    type="number"
                    placeholder="e.g., 45"
                    value={marksObtained}
                    onChange={(e) => setMarksObtained(e.target.value)}
                  />
                  <Input
                    label="Maximum Marks"
                    type="number"
                    placeholder="e.g., 60"
                    value={marksMax}
                    onChange={(e) => setMarksMax(e.target.value)}
                  />
                  <Button variant="outline" size="sm" onClick={applyNormalizedMarks} className="mb-5">
                    Normalize
                  </Button>
                </div>
              )}
            </div>

            {errors.length > 0 && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <ul className="text-sm text-destructive space-y-1">
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handlePredict}
                disabled={submitting || errors.length > 0}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <Target size={16} />
                    Predict Final Score
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw size={16} />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Result Panel */}
        <Card className={result ? 'border-primary-200 shadow-md' : ''}>
          <CardHeader>
            <CardTitle>Prediction Result</CardTitle>
            <CardDescription>
              The model's estimated final assessment score based on your inputs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Target size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Select your academic context, adjust the inputs, and click "Predict Final Score" to see the result.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Score display */}
                <div className="text-center py-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Predicted Final Assessment Score
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-display text-5xl font-bold text-foreground tabular-nums animate-scale-in">
                      {formatScore(result.predicted_score)}
                    </span>
                    <span className="text-xl text-muted-foreground">/ 100</span>
                  </div>
                  {grade && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <Badge variant="success">
                        <span style={{ color: grade.color }}>
                          Grade {grade.letter} — {grade.label}
                        </span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Grade Point: {grade.gradePoint.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Raw score note */}
                {result.raw_predicted_score !== result.predicted_score && (
                  <div className="p-2.5 rounded-md bg-warning/10 border border-warning/20">
                    <p className="text-xs text-warning">
                      Raw model output: {formatNumber(result.raw_predicted_score, 2)}.
                      Score clamped to 0-100 for display.
                    </p>
                  </div>
                )}

                {/* Input summary */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-md bg-muted/50">
                    <p className="text-xs text-muted-foreground">Study Hours</p>
                    <p className="font-display text-sm font-semibold">{studyHours} hrs</p>
                  </div>
                  <div className="text-center p-2 rounded-md bg-muted/50">
                    <p className="text-xs text-muted-foreground">Attendance</p>
                    <p className="font-display text-sm font-semibold">{attendance}%</p>
                  </div>
                  <div className="text-center p-2 rounded-md bg-muted/50">
                    <p className="text-xs text-muted-foreground">Previous Score</p>
                    <p className="font-display text-sm font-semibold">{previousScore}</p>
                  </div>
                </div>

                {/* Course context */}
                {(courseTitle || courseCode) && (
                  <div className="p-2.5 rounded-md bg-muted/30">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Course:</span>{' '}
                      {courseCode && `${courseCode} — `}
                      {courseTitle || 'N/A'}
                      {semesterNum > 0 && ` | Semester ${semesterNum}`}
                      {assessmentType && ` | ${assessmentType === 'theory' ? 'Theory' : 'Practical'}`}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
                  <span className="flex items-center gap-1">
                    <Cpu size={12} /> Model v{result.model_version}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {formatDate(result.timestamp)}
                  </span>
                </div>

                {/* Disclaimer */}
                <div className="flex gap-2 p-3 rounded-md bg-muted/30">
                  <Info size={14} className="flex-shrink-0 mt-0.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    This is an unofficial statistical estimate based on patterns in training data, not a
                    guaranteed result or official university grade. Linear regression captures
                    correlations, not causation.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AOR University Attendance Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator size={18} className="text-primary-500" />
            Attendance Calculator (Aror University Formula)
          </CardTitle>
          <CardDescription>
            Calculate your attendance percentage using the standard formula, then apply it
            directly to your prediction inputs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <Input
              label="Classes Attended"
              type="number"
              min={0}
              placeholder="e.g., 180"
              value={classesAttended}
              onChange={(e) => setClassesAttended(e.target.value)}
              hint="Number of classes you attended"
            />
            <Input
              label="Total Classes Held"
              type="number"
              min={1}
              placeholder="e.g., 220"
              value={totalClasses}
              onChange={(e) => setTotalClasses(e.target.value)}
              hint="Total number of classes conducted"
            />
            <div className="space-y-2">
              <Button variant="outline" size="sm" onClick={applyCalculatedAttendance} className="w-full">
                Apply to Prediction
              </Button>
              {calcAttendance !== null && (
                <p className="text-center text-sm font-medium text-primary-500 tabular-nums">
                  Attendance: {formatScore(calcAttendance, 1)}%
                  {calcAttendance < minAttendanceForExamEligibility && (
                    <span className="block text-xs text-destructive mt-0.5">
                      Below {minAttendanceForExamEligibility}% exam eligibility threshold
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 p-3 rounded-md bg-muted/30">
            <p className="text-xs text-muted-foreground">
              <strong>Formula:</strong> Attendance % = (Classes Attended / Total Classes) x 100.
              For example, if you attended 180 out of 220 classes, your attendance is
              (180 / 220) x 100 = 81.8%. Aror University requires a minimum of{' '}
              {minAttendanceForExamEligibility}% attendance to be eligible for examinations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feature Contribution */}
      {result && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle>Feature Contribution Analysis</CardTitle>
            <CardDescription>
              How each input feature contributes to the predicted score.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                {contributionData.map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: c.fill }} />
                      <span className="text-sm text-foreground">{c.name}</span>
                    </div>
                    <span className="font-display text-sm font-semibold tabular-nums">
                      {c.value >= 0 ? '+' : ''}{formatNumber(c.value, 2)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-sm font-medium text-foreground">Total Predicted Score</span>
                  <span className="font-display text-base font-bold text-primary-500">
                    {formatScore(result.predicted_score)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  Model equation: score = {formatNumber(model.weights.bias, 2)} +
                  ({formatNumber(model.weights.study_hours, 3)} x study_hours) +
                  ({formatNumber(model.weights.attendance, 3)} x attendance) +
                  ({formatNumber(model.weights.previous_score, 3)} x previous_score)
                </p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={contributionData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                    formatter={(v: number) => v.toFixed(2)}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {contributionData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* What-If Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>What-If Analysis</CardTitle>
              <CardDescription>
                Compare different scenarios. These reflect the model's statistical estimates, not
                guaranteed causal improvements.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addWhatIf}>
              <Plus size={14} />
              Add Current as Scenario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {whatIfScenarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <TrendingUp size={20} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Add scenarios to compare how different inputs affect the predicted score.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Label</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Study Hours</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Attendance</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Previous Score</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Predicted</th>
                      <th className="py-2 px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {whatIfScenarios.map((s) => (
                      <tr key={s.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-2 px-3 font-medium">{s.label}</td>
                        <td className="text-right py-2 px-3 tabular-nums">{s.study_hours}h</td>
                        <td className="text-right py-2 px-3 tabular-nums">{s.attendance}%</td>
                        <td className="text-right py-2 px-3 tabular-nums">{s.previous_score}</td>
                        <td className="text-right py-2 px-3 font-display font-bold text-primary-500 tabular-nums">
                          {formatScore(s.predicted)}
                        </td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => removeWhatIf(s.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={whatIfChart} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                    formatter={(v: number) => v.toFixed(1)}
                  />
                  <Bar dataKey="predicted" radius={[4, 4, 0, 0]} fill="hsl(230, 55%, 50%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
