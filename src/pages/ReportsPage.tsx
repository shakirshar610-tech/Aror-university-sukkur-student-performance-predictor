import { useState, useMemo } from 'react'
import {
  FileText, Download, TrendingUp, Clock, Target, CheckCircle2,
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/context/ToastContext'
import type { TrainedModel, Student, PredictionRecord } from '@/types'
import { fetchTasks, type Task } from '@/services/taskService'
import { fetchAttendance, summarizeAttendance, type AttendanceRecord } from '@/services/attendanceService'
import { useEffect } from 'react'
import { formatScore, formatDate } from '@/lib/utils'
import { minAttendanceForExamEligibility } from '@/config/university'

interface PageProps {
  model: TrainedModel
  students: Student[]
  predictions: PredictionRecord[]
}

export function ReportsPage({ model, students, predictions }: PageProps) {
  const { addToast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])

  useEffect(() => {
    fetchTasks().then(setTasks)
    fetchAttendance().then(setAttendance)
  }, [])

  const attendanceSummaries = useMemo(() => summarizeAttendance(attendance), [attendance])

  const taskStats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed').length
    const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed' && t.status !== 'cancelled').length
    const completionRate = tasks.length > 0 ? (completed / tasks.length) * 100 : 0
    return { total: tasks.length, completed, overdue, completionRate }
  }, [tasks])

  const predictionTrend = useMemo(() => {
    return [...predictions].reverse().slice(-10).map((p, i) => ({
      index: i + 1,
      predicted: p.predicted_score,
      previous: p.previous_score,
    }))
  }, [predictions])

  const overallAttendance = useMemo(() => {
    const totalHeld = attendanceSummaries.reduce((s, x) => s + x.totalHeld, 0)
    const totalAttended = attendanceSummaries.reduce((s, x) => s + x.totalAttended, 0)
    return totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 0
  }, [attendanceSummaries])

  const handleExportCSV = () => {
    const rows: string[] = []
    rows.push('Category,Course,Detail,Value,Date')

    for (const p of predictions) {
      rows.push(`Prediction,,Predicted Score,${p.predicted_score.toFixed(1)},${formatDate(p.created_at)}`)
      rows.push(`Prediction,,Previous Score,${p.previous_score.toFixed(1)},${formatDate(p.created_at)}`)
      rows.push(`Prediction,,Study Hours,${p.study_hours},${formatDate(p.created_at)}`)
      rows.push(`Prediction,,Attendance,${p.attendance}%,${formatDate(p.created_at)}`)
    }
    for (const s of attendanceSummaries) {
      rows.push(`Attendance,${s.course_title},Attendance %,${s.percentage.toFixed(1)}%,`)
      rows.push(`Attendance,${s.course_title},Classes Attended,${s.totalAttended},`)
      rows.push(`Attendance,${s.course_title},Classes Held,${s.totalHeld},`)
    }
    for (const t of tasks) {
      rows.push(`Task,${t.course_title || ''},${t.title},${t.status},${t.deadline ? formatDate(t.deadline) : ''}`)
    }

    const csv = rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aspp_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast('success', 'Report exported', 'Your academic summary has been downloaded as a CSV file.')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <FileText size={20} className="text-primary-500" />
            Academic Reports
          </h2>
          <p className="text-sm text-muted-foreground">Review and export your academic performance summary</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleExportCSV} disabled={predictions.length === 0 && tasks.length === 0 && attendance.length === 0}>
          <Download size={14} /> Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><Target size={18} className="text-primary-500" /><p className="text-xs text-muted-foreground">Predictions</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{predictions.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-success" /><p className="text-xs text-muted-foreground">Task Completion</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{formatScore(taskStats.completionRate, 0)}%</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><Clock size={18} className="text-secondary" /><p className="text-xs text-muted-foreground">Avg Attendance</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{formatScore(overallAttendance, 1)}%</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={18} className="text-accent" /><p className="text-xs text-muted-foreground">Model R²</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{model.metrics.r2.toFixed(3)}</p>
        </CardContent></Card>
      </div>

      {/* Prediction trend */}
      {predictionTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prediction History Trend</CardTitle>
            <CardDescription>Predicted vs previous scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={predictionTrend} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="index" tick={{ fontSize: 12 }} label={{ value: 'Prediction #', position: 'bottom', offset: -5, fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                <Line type="monotone" dataKey="predicted" stroke="hsl(230, 55%, 50%)" strokeWidth={2} dot={{ r: 4 }} name="Predicted" />
                <Line type="monotone" dataKey="previous" stroke="hsl(172, 70%, 40%)" strokeWidth={2} dot={{ r: 4 }} name="Previous" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Attendance summary table */}
      {attendanceSummaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
            <CardDescription>Per-course attendance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Course</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Attended</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Held</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">%</th>
                    <th className="text-center py-2 px-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceSummaries.map(s => (
                    <tr key={s.course_code} className="border-b border-border last:border-0">
                      <td className="py-2 px-3 font-medium">{s.course_title}</td>
                      <td className="text-right py-2 px-3 tabular-nums">{s.totalAttended}</td>
                      <td className="text-right py-2 px-3 tabular-nums">{s.totalHeld}</td>
                      <td className="text-right py-2 px-3 tabular-nums font-medium">{formatScore(s.percentage, 1)}%</td>
                      <td className="text-center py-2 px-3">
                        <Badge variant={s.percentage >= minAttendanceForExamEligibility ? 'success' : 'error'}>
                          {s.percentage >= minAttendanceForExamEligibility ? 'Eligible' : `Below ${minAttendanceForExamEligibility}%`}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task summary */}
      {tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Task Summary</CardTitle>
            <CardDescription>Assignment and deadline completion overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-md bg-muted/30">
                <p className="font-display text-xl font-bold tabular-nums">{taskStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </div>
              <div className="text-center p-3 rounded-md bg-success/10">
                <p className="font-display text-xl font-bold tabular-nums text-success">{taskStats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-3 rounded-md bg-destructive/10">
                <p className="font-display text-xl font-bold tabular-nums text-destructive">{taskStats.overdue}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {predictions.length === 0 && tasks.length === 0 && attendance.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText size={24} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No data to report yet. Start by creating tasks, recording attendance, or running predictions.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            All data in this report is self-entered and unofficial. Predicted scores are statistical
            estimates, not official university results. Always verify academic information against
            official university sources.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
