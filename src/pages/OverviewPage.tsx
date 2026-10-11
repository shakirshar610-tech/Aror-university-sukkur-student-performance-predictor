import { useMemo } from 'react'
import {
  Users,
  Target,
  TrendingUp,
  Gauge,
  Ruler,
  Activity,
  RefreshCw,
  ShieldAlert,
  CheckSquare,
  Calendar as CalIcon,
  ClipboardCheck,
  Plus,
} from 'lucide-react'
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SkeletonCard, EmptyState } from '@/components/ui/Skeleton'
import { trainingData } from '@/data/studentData'
import { predict } from '@/model/linearRegression'
import { formatScore, formatNumber } from '@/lib/utils'
import { university, programs, departments, allCourses } from '@/config/university'
import type { TrainedModel, Student, PredictionRecord, PageId } from '@/types'

interface PageProps {
  model: TrainedModel
  students: Student[]
  predictions: PredictionRecord[]
  loading: boolean
  error: string | null
  refresh: () => void
  onNavigate: (page: PageId) => void
}

export function OverviewPage({ model, students, predictions, loading, error, refresh, onNavigate }: PageProps) {
  const stats = useMemo(() => {
    const avgPrev = predictions.length > 0
      ? predictions.reduce((s, p) => s + p.previous_score, 0) / predictions.length
      : 0
    const avgPred = predictions.length > 0
      ? predictions.reduce((s, p) => s + p.predicted_score, 0) / predictions.length
      : 0
    return {
      totalStudents: students.length,
      totalPredictions: predictions.length,
      avgPrevScore: avgPrev,
      avgPredScore: avgPred,
      r2: model.metrics.r2,
      mae: model.metrics.mae,
    }
  }, [students, predictions, model])

  // Previous Score vs Predicted scatter
  const prevVsPred = useMemo(() => {
    return trainingData.map((r) => ({
      x: r.previous_score,
      y: model ? formatScoreToNum(predict(model, { study_hours: r.study_hours, attendance: r.attendance, previous_score: r.previous_score })) : 0,
    }))
  }, [model])

  const studyHoursVsPred = useMemo(() => {
    return trainingData.map((r) => ({
      x: r.study_hours,
      y: model ? formatScoreToNum(predict(model, { study_hours: r.study_hours, attendance: r.attendance, previous_score: r.previous_score })) : 0,
    }))
  }, [model])

  const attendanceVsPred = useMemo(() => {
    return trainingData.map((r) => ({
      x: r.attendance,
      y: model ? formatScoreToNum(predict(model, { study_hours: r.study_hours, attendance: r.attendance, previous_score: r.previous_score })) : 0,
    }))
  }, [model])

  const scoreDistribution = useMemo(() => {
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

  const recentPredictions = useMemo(() => predictions.slice(0, 5), [predictions])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  const summaryCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'hsl(230, 55%, 50%)' },
    { label: 'Total Predictions', value: stats.totalPredictions, icon: Target, color: 'hsl(172, 70%, 40%)' },
    { label: 'Avg Previous Score', value: stats.totalPredictions > 0 ? formatScore(stats.avgPrevScore) : '—', icon: TrendingUp, color: 'hsl(32, 95%, 50%)' },
    { label: 'Avg Predicted Score', value: stats.totalPredictions > 0 ? formatScore(stats.avgPredScore) : '—', icon: Activity, color: 'hsl(230, 55%, 50%)' },
    { label: 'Model R² Score', value: formatNumber(model.metrics.r2, 4), icon: Gauge, color: 'hsl(142, 71%, 45%)' },
    { label: 'Model MAE', value: formatNumber(model.metrics.mae, 2), icon: Ruler, color: 'hsl(38, 92%, 50%)' },
  ]

  const academicCards = [
    { label: 'Departments', value: departments.length, sub: 'Configured' },
    { label: 'Programs', value: programs.filter(p => p.active).length, sub: 'Active' },
    { label: 'Curriculum Courses', value: allCourses.length, sub: '3 programs verified' },
    { label: 'Grading Scale', value: 12, sub: 'Grade boundaries' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-foreground">
            {university.shortName}
          </p>
          <p className="text-sm text-muted-foreground">{university.tagline}</p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      {/* Privacy notice */}
      <div className="flex gap-2 p-3 rounded-md bg-warning/10 border border-warning/20">
        <ShieldAlert size={16} className="flex-shrink-0 mt-0.5 text-warning" />
        <p className="text-xs text-warning">
          {university.independenceNote} All predictions and grades shown here are unofficial estimates.
        </p>
      </div>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent>
            <p className="text-sm text-destructive">Error loading data: {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Academic Configuration Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {academicCards.map((card) => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <p className="font-display text-2xl font-bold text-foreground tabular-nums">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
              <p className="text-xs text-muted-foreground/70">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${card.color}15` }}
                >
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <p className="font-display text-2xl font-bold text-foreground tabular-nums">
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Add Task', icon: Plus, page: 'tasks' as PageId, color: 'hsl(230, 55%, 50%)' },
          { label: 'View Calendar', icon: CalIcon, page: 'calendar' as PageId, color: 'hsl(172, 70%, 40%)' },
          { label: 'Record Attendance', icon: ClipboardCheck, page: 'attendance' as PageId, color: 'hsl(32, 95%, 50%)' },
          { label: 'Run Prediction', icon: Target, page: 'predict' as PageId, color: 'hsl(142, 71%, 45%)' },
          { label: 'View Reports', icon: CheckSquare, page: 'reports' as PageId, color: 'hsl(280, 60%, 55%)' },
        ].map(action => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              onClick={() => onNavigate(action.page)}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:shadow-md hover:border-primary-300 transition-all text-center"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${action.color}15` }}>
                <Icon size={20} style={{ color: action.color }} />
              </div>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </button>
          )
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Previous Score vs. Predicted Final Score</CardTitle>
            <CardDescription>How previous academic performance relates to predicted outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Previous Score"
                  domain={[0, 100]}
                  label={{ value: 'Previous Score', position: 'bottom', offset: -5, fontSize: 12 }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Predicted Score"
                  domain={[0, 100]}
                  label={{ value: 'Predicted', angle: -90, position: 'insideLeft', fontSize: 12 }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                  formatter={(v: number, name: string) => [v.toFixed(1), name === 'x' ? 'Previous' : 'Predicted']}
                />
                <Scatter data={prevVsPred} fill="hsl(230, 55%, 50%)" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Study Hours vs. Predicted Score</CardTitle>
            <CardDescription>Relationship between daily study hours and predicted performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Study Hours"
                  domain={[0, 12]}
                  label={{ value: 'Study Hours/Day', position: 'bottom', offset: -5, fontSize: 12 }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Predicted Score"
                  domain={[0, 100]}
                  label={{ value: 'Predicted', angle: -90, position: 'insideLeft', fontSize: 12 }}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                  formatter={(v: number, name: string) => [v.toFixed(1), name === 'x' ? 'Hours' : 'Predicted']}
                />
                <Scatter data={studyHoursVsPred} fill="hsl(172, 70%, 40%)" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Attendance vs. Predicted</CardTitle>
            <CardDescription>Attendance percentage vs predicted score</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" dataKey="x" name="Attendance" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis type="number" dataKey="y" name="Predicted" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                  formatter={(v: number) => v.toFixed(1)}
                />
                <Scatter data={attendanceVsPred} fill="hsl(32, 95%, 50%)" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Distribution of final scores in training data</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {scoreDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Predictions</CardTitle>
            <CardDescription>Latest prediction activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPredictions.length === 0 ? (
              <EmptyState
                icon={<Activity size={20} />}
                title="No predictions yet"
                description="Predictions will appear here once you start using the predict tool."
              />
            ) : (
              <div className="space-y-2">
                {recentPredictions.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {p.student?.student_name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.study_hours}h / {p.attendance}% / {p.previous_score}
                      </p>
                    </div>
                    <span className="font-display text-sm font-bold text-primary-500 tabular-nums">
                      {formatScore(p.predicted_score)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            Dashboard charts use the 100-record synthetic training dataset for demonstration — not real
            Aror University student data. Summary cards show live data from your session. This is an
            independent academic support tool — the model estimates statistical relationships and does
            not guarantee outcomes. Always verify academic results against official university sources.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function formatScoreToNum(r: { predicted_score: number }): number {
  return r.predicted_score
}
