import { useState, useEffect, useMemo } from 'react'
import {
  Plus, Trash2, AlertTriangle, TrendingUp, ClipboardCheck,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
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
  fetchAttendance, createAttendance, deleteAttendance,
  summarizeAttendance, projectAttendance,
  type AttendanceRecord,
} from '@/services/attendanceService'
import { allCourses, minAttendanceForExamEligibility } from '@/config/university'
import { formatScore, formatDate } from '@/lib/utils'

export function AttendancePage() {
  const { addToast } = useToast()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AttendanceRecord | null>(null)

  // Form
  const [fCourseCode, setFCourseCode] = useState('')
  const [fClassesHeld, setFClassesHeld] = useState('')
  const [fClassesAttended, setFClassesAttended] = useState('')
  const [fDate, setFDate] = useState('')
  const [fNotes, setFNotes] = useState('')

  const load = async () => {
    setLoading(true)
    const data = await fetchAttendance()
    setRecords(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const summaries = useMemo(() => summarizeAttendance(records), [records])

  const chartData = useMemo(() => {
    return summaries.map(s => ({
      course: s.course_title.length > 15 ? s.course_title.substring(0, 15) + '...' : s.course_title,
      attendance: Math.round(s.percentage * 10) / 10,
      color: s.percentage >= minAttendanceForExamEligibility ? 'hsl(142, 71%, 45%)' : 'hsl(0, 84%, 60%)',
    }))
  }, [summaries])

  const overallAttendance = useMemo(() => {
    const totalHeld = summaries.reduce((s, x) => s + x.totalHeld, 0)
    const totalAttended = summaries.reduce((s, x) => s + x.totalAttended, 0)
    return totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 0
  }, [summaries])

  const belowThreshold = summaries.filter(s => s.percentage < minAttendanceForExamEligibility)

  const handleAdd = async () => {
    const held = parseInt(fClassesHeld)
    const attended = parseInt(fClassesAttended)
    if (isNaN(held) || isNaN(attended)) { addToast('error', 'Invalid input', 'Enter valid class counts.'); return }
    if (held <= 0) { addToast('error', 'Invalid input', 'Classes held must be at least 1.'); return }
    if (attended > held) { addToast('error', 'Invalid input', 'Classes attended cannot exceed classes held.'); return }
    if (!fCourseCode) { addToast('error', 'Course required', 'Select a course.'); return }
    const course = allCourses.find(c => c.courseCode === fCourseCode)
    try {
      await createAttendance({
        course_code: fCourseCode,
        course_title: course?.title,
        classes_held: held,
        classes_attended: attended,
        date: fDate || undefined,
        notes: fNotes.trim() || undefined,
      })
      addToast('success', 'Attendance recorded', `${attended}/${held} classes for ${course?.title || fCourseCode}.`)
      resetForm(); setShowModal(false); load()
    } catch (err) {
      addToast('error', 'Failed to record attendance', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const resetForm = () => {
    setFCourseCode(''); setFClassesHeld(''); setFClassesAttended(''); setFDate(''); setFNotes('')
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteAttendance(deleteTarget.id)
      addToast('success', 'Attendance record deleted')
      setDeleteTarget(null); load()
    } catch (err) {
      addToast('error', 'Failed to delete record')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><ClipboardCheck size={18} className="text-primary-500" /><p className="text-xs text-muted-foreground">Overall Attendance</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{formatScore(overallAttendance, 1)}%</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={18} className="text-secondary" /><p className="text-xs text-muted-foreground">Courses Tracked</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{summaries.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={18} className="text-warning" /><p className="text-xs text-muted-foreground">Min Required</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{minAttendanceForExamEligibility}%</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={18} className="text-destructive" /><p className="text-xs text-muted-foreground">Below Threshold</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{belowThreshold.length}</p>
        </CardContent></Card>
      </div>

      {/* Warning banner */}
      {belowThreshold.length > 0 && (
        <div className="flex gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-destructive" />
          <p className="text-xs text-destructive">
            {belowThreshold.length} course{belowThreshold.length > 1 ? 's' : ''} below {minAttendanceForExamEligibility}% attendance: {' '}
            {belowThreshold.map(c => c.course_title).join(', ')}. You may not be eligible for examinations in these courses.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button size="sm" onClick={() => { resetForm(); setShowModal(true) }}><Plus size={14} /> Record Attendance</Button>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance by Course</CardTitle>
            <CardDescription>Current attendance percentage per course</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="course" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} formatter={(v: number) => `${v.toFixed(1)}%`} />
                <Bar dataKey="attendance" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Per-course summaries */}
      {loading ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading attendance...</CardContent></Card>
      ) : summaries.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ClipboardCheck size={20} />}
            title="No attendance records yet"
            description="Track your class attendance by course to monitor exam eligibility and identify courses that need attention."
            action={<Button size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> Record Attendance</Button>}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {summaries.map((s) => {
            const projection = projectAttendance(s.totalHeld, s.totalAttended, 10, 8)
            const isBelow = s.percentage < minAttendanceForExamEligibility
            return (
              <Card key={s.course_code}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{s.course_title}</CardTitle>
                      <CardDescription>{s.course_code} — {s.totalAttended}/{s.totalHeld} classes attended</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className={`font-display text-2xl font-bold tabular-nums ${isBelow ? 'text-destructive' : 'text-success'}`}>
                        {formatScore(s.percentage, 1)}%
                      </p>
                      {isBelow ? <Badge variant="error">Below {minAttendanceForExamEligibility}%</Badge> : <Badge variant="success">Eligible</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {s.records.map(r => (
                      <div key={r.id} className="flex items-center justify-between py-1.5 px-3 rounded-md bg-muted/20 text-sm">
                        <div>
                          <span className="font-medium tabular-nums">{r.classes_attended}/{r.classes_held}</span>
                          <span className="text-muted-foreground ml-2">{formatDate(r.date)}</span>
                          {r.notes && <span className="text-muted-foreground ml-2">— {r.notes}</span>}
                        </div>
                        <button onClick={() => setDeleteTarget(r)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {isBelow && (
                    <div className="mt-3 p-2.5 rounded-md bg-destructive/10">
                      <p className="text-xs text-destructive">
                        <strong>Projection:</strong> If you attend 8 of the next 10 classes, your attendance would be {formatScore(projection.projectedPercentage, 1)}%.
                        {projection.classesNeeded > 0 && ` You need to attend at least ${projection.classesNeeded} more classes to reach ${minAttendanceForExamEligibility}%.`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            Attendance tracking is manual. This tool does not access official university attendance
            records. Always verify against official sources. Aror University requires a minimum of
            {' '}{minAttendanceForExamEligibility}% attendance to be eligible for examinations.
          </p>
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm() }} title="Record Attendance">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Course</label>
            <select className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground" value={fCourseCode} onChange={(e) => setFCourseCode(e.target.value)}>
              <option value="">— Select course —</option>
              {allCourses.map(c => <option key={c.id} value={c.courseCode}>{c.courseCode} — {c.title}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Classes Held" type="number" min={1} placeholder="e.g., 5" value={fClassesHeld} onChange={(e) => setFClassesHeld(e.target.value)} />
            <Input label="Classes Attended" type="number" min={0} placeholder="e.g., 4" value={fClassesAttended} onChange={(e) => setFClassesAttended(e.target.value)} />
          </div>
          <Input label="Date" type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
          <Input label="Notes (optional)" placeholder="e.g., Missed due to illness" value={fNotes} onChange={(e) => setFNotes(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setShowModal(false); resetForm() }}>Cancel</Button>
            <Button size="sm" onClick={handleAdd}>Record</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteTarget !== null} title="Delete Attendance Record" message="Delete this attendance entry?" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
