import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Skeleton'
import { Download, BarChart3, LineChart } from 'lucide-react'
import { exportToCSV } from '@/services/datasetService'
import { useToast } from '@/context/ToastContext'
import { trainingData } from '@/data/studentData'
import type { Student, PredictionRecord } from '@/types'

interface PageProps {
  students: Student[]
  predictions: PredictionRecord[]
}

export function AnalyticsPage({ students, predictions }: PageProps) {
  const { addToast } = useToast()

  const scoreDist = useMemo(() => {
    const bins = [
      { range: '0-20', count: 0, fill: 'hsl(0, 84%, 60%)' },
      { range: '21-40', count: 0, fill: 'hsl(25, 90%, 55%)' },
      { range: '41-60', count: 0, fill: 'hsl(38, 92%, 50%)' },
      { range: '61-80', count: 0, fill: 'hsl(172, 70%, 40%)' },
      { range: '81-100', count: 0, fill: 'hsl(142, 71%, 45%)' },
    ]
    for (const r of trainingData) {
      if (r.final_score <= 20) bins[0].count++
      else if (r.final_score <= 40) bins[1].count++
      else if (r.final_score <= 60) bins[2].count++
      else if (r.final_score <= 80) bins[3].count++
      else bins[4].count++
    }
    return bins
  }, [])

  const studyHoursDist = useMemo(() => {
    const bins = [
      { range: '0-2', count: 0 },
      { range: '3-5', count: 0 },
      { range: '6-8', count: 0 },
      { range: '9-12', count: 0 },
    ]
    for (const r of trainingData) {
      if (r.study_hours <= 2) bins[0].count++
      else if (r.study_hours <= 5) bins[1].count++
      else if (r.study_hours <= 8) bins[2].count++
      else bins[3].count++
    }
    return bins
  }, [])

  const attendanceDist = useMemo(() => {
    const bins = [
      { range: '0-50%', count: 0 },
      { range: '51-70%', count: 0 },
      { range: '71-85%', count: 0 },
      { range: '86-100%', count: 0 },
    ]
    for (const r of trainingData) {
      if (r.attendance <= 50) bins[0].count++
      else if (r.attendance <= 70) bins[1].count++
      else if (r.attendance <= 85) bins[2].count++
      else bins[3].count++
    }
    return bins
  }, [])

  const avgByCourse = useMemo(() => {
    const courseMap = new Map<string, { sum: number; count: number }>()
    for (const s of students) {
      const course = s.course || 'General'
      const coursePreds = predictions.filter((p) => p.student_id === s.id)
      if (coursePreds.length > 0) {
        const existing = courseMap.get(course) || { sum: 0, count: 0 }
        courseMap.set(course, {
          sum: existing.sum + coursePreds.reduce((sum, p) => sum + p.predicted_score, 0),
          count: existing.count + coursePreds.length,
        })
      }
    }
    return Array.from(courseMap.entries()).map(([course, { sum, count }]) => ({
      course,
      avgScore: sum / count,
    }))
  }, [students, predictions])

  const predictionTrends = useMemo(() => {
    if (predictions.length === 0) return []
    const sorted = [...predictions].sort((a, b) => a.created_at.localeCompare(b.created_at))
    const byDate = new Map<string, { sum: number; count: number }>()
    for (const p of sorted) {
      const date = p.created_at.split('T')[0]
      const existing = byDate.get(date) || { sum: 0, count: 0 }
      byDate.set(date, { sum: existing.sum + p.predicted_score, count: existing.count + 1 })
    }
    return Array.from(byDate.entries()).map(([date, { sum, count }]) => ({
      date: date.slice(5),
      avgScore: sum / count,
      count,
    }))
  }, [predictions])

  const handleExport = () => {
    if (predictions.length === 0) {
      addToast('warning', 'No data to export')
      return
    }
    exportToCSV(
      predictions.map((p) => ({
        student: p.student?.student_name || 'Anonymous',
        course: p.student?.course || 'N/A',
        study_hours: p.study_hours,
        attendance: p.attendance,
        previous_score: p.previous_score,
        predicted_score: p.predicted_score.toFixed(2),
        created_at: p.created_at,
      })),
      'analytics_report.csv',
    )
    addToast('success', 'Report exported', 'Analytics data exported to CSV')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Distribution analysis and prediction trends</p>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download size={14} /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Final Score Distribution</CardTitle>
            <CardDescription>Training dataset scores by range</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scoreDist} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreDist.map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Study Hours Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Study Hours Distribution</CardTitle>
            <CardDescription>How study hours are spread</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={studyHoursDist} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(230, 55%, 50%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
            <CardDescription>Attendance rates in training data</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendanceDist} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(172, 70%, 40%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Prediction Trends Over Time</CardTitle>
          <CardDescription>Average predicted score by date</CardDescription>
        </CardHeader>
        <CardContent>
          {predictionTrends.length === 0 ? (
            <EmptyState
              icon={<LineChart size={20} />}
              title="No trend data yet"
              description="Prediction trends will appear once predictions are saved to the database."
            />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={predictionTrends} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(230, 55%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(230, 55%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="avgScore"
                  stroke="hsl(230, 55%, 50%)"
                  strokeWidth={2}
                  fill="url(#trendGradient)"
                  name="Avg Predicted Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Avg by Course */}
      <Card>
        <CardHeader>
          <CardTitle>Average Prediction by Course</CardTitle>
          <CardDescription>Comparing predicted scores across courses</CardDescription>
        </CardHeader>
        <CardContent>
          {avgByCourse.length === 0 ? (
            <EmptyState
              icon={<BarChart3 size={20} />}
              title="No course data yet"
              description="Add students with courses and make predictions to see course-level analytics."
            />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={avgByCourse} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="course" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                  formatter={(v: number) => v.toFixed(1)}
                />
                <Bar dataKey="avgScore" radius={[4, 4, 0, 0]} fill="hsl(32, 95%, 50%)" name="Avg Predicted" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            Distribution charts use the 100-record synthetic training dataset (clearly labeled as
            educational data). Trend and course analytics use live data from the connected database.
            Predicted scores are statistical estimates, not observed outcomes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

