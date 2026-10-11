import { useState } from 'react'
import {
  CalendarDays,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Target as TargetIcon,
  BookOpen,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import { formatDate } from '@/lib/utils'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

interface StudyTask {
  id: string
  course: string
  title: string
  date: string
  targetHours: number
  completed: boolean
  priority: 'high' | 'medium' | 'low'
}

const STORAGE_KEY = 'aspp_study_tasks'

function readLocal(): StudyTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as StudyTask[]
  } catch {
    return []
  }
}

function writeLocal(tasks: StudyTask[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // ignore
  }
}

export function StudyPlannerPage() {
  const { addToast } = useToast()
  const [tasks, setTasks] = useState<StudyTask[]>(() => readLocal())
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<StudyTask | null>(null)

  // Form
  const [fCourse, setFCourse] = useState('')
  const [fTitle, setFTitle] = useState('')
  const [fDate, setFDate] = useState('')
  const [fHours, setFHours] = useState('2')
  const [fPriority, setFPriority] = useState<'high' | 'medium' | 'low'>('medium')

  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return a.date.localeCompare(b.date)
  })

  const upcoming = sorted.filter((t) => !t.completed)
  const completed = sorted.filter((t) => t.completed)

  const chartData = (() => {
    const byCourse = new Map<string, number>()
    for (const t of tasks) {
      byCourse.set(t.course, (byCourse.get(t.course) || 0) + t.targetHours)
    }
    return Array.from(byCourse.entries()).map(([course, hours]) => ({ course, hours }))
  })()

  const handleAdd = () => {
    if (!fTitle.trim()) {
      addToast('error', 'Title required', 'Enter a study task title.')
      return
    }
    const task: StudyTask = {
      id: crypto.randomUUID(),
      course: fCourse.trim() || 'General',
      title: fTitle.trim(),
      date: fDate || new Date().toISOString(),
      targetHours: parseFloat(fHours) || 2,
      completed: false,
      priority: fPriority,
    }
    const updated = [task, ...tasks]
    setTasks(updated)
    writeLocal(updated)
    addToast('success', 'Study task added', `"${task.title}" scheduled for ${task.course}.`)
    resetForm()
    setShowModal(false)
  }

  const resetForm = () => {
    setFCourse('')
    setFTitle('')
    setFDate('')
    setFHours('2')
    setFPriority('medium')
  }

  const toggleComplete = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    setTasks(updated)
    writeLocal(updated)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    const updated = tasks.filter((t) => t.id !== deleteTarget.id)
    setTasks(updated)
    writeLocal(updated)
    addToast('success', 'Task deleted')
    setDeleteTarget(null)
  }

  const priorityBadge = (p: 'high' | 'medium' | 'low') => {
    if (p === 'high') return <Badge variant="error">High</Badge>
    if (p === 'medium') return <Badge variant="warning">Medium</Badge>
    return <Badge variant="info">Low</Badge>
  }

  const totalHours = tasks.reduce((s, t) => s + t.targetHours, 0)
  const completedHours = tasks.filter((t) => t.completed).reduce((s, t) => s + t.targetHours, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Plan your study sessions, set targets, and track progress across courses.
        </p>
        <Button size="sm" onClick={() => { resetForm(); setShowModal(true) }}>
          <Plus size={16} />
          Add Study Task
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays size={18} className="text-primary-500" />
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </div>
            <p className="font-display text-2xl font-bold tabular-nums">{tasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-secondary" />
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
            <p className="font-display text-2xl font-bold tabular-nums">{upcoming.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} className="text-success" />
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <p className="font-display text-2xl font-bold tabular-nums">{completed.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TargetIcon size={18} className="text-accent" />
              <p className="text-xs text-muted-foreground">Study Hours</p>
            </div>
            <p className="font-display text-2xl font-bold tabular-nums">
              {completedHours}/{totalHours}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hours by course chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Study Hours by Course</CardTitle>
            <CardDescription>Planned study time distribution across your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="course" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]} fill="hsl(230, 55%, 50%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Upcoming tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Study Tasks</CardTitle>
          <CardDescription>Tasks you haven't completed yet, sorted by date</CardDescription>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={20} />}
              title="No upcoming tasks"
              description="Add study tasks to plan your revision schedule and track your progress."
              action={
                <Button size="sm" onClick={() => setShowModal(true)}>
                  <Plus size={14} /> Add Study Task
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {upcoming.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-md border border-border hover:bg-muted/20 transition-colors"
                >
                  <button onClick={() => toggleComplete(t.id)} className="text-muted-foreground hover:text-success">
                    <Circle size={18} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.course} — {t.targetHours}h — {formatDate(t.date)}
                    </p>
                  </div>
                  {priorityBadge(t.priority)}
                  <button
                    onClick={() => setDeleteTarget(t)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed tasks */}
      {completed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completed.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-md border border-border bg-muted/10"
                >
                  <button onClick={() => toggleComplete(t.id)} className="text-success">
                    <CheckCircle2 size={18} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground line-through">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.course} — {t.targetHours}h
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(t)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Modal */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); resetForm() }}
        title="Add Study Task"
      >
        <div className="space-y-4">
          <Input
            label="Course"
            placeholder="e.g., Programming Fundamentals"
            value={fCourse}
            onChange={(e) => setFCourse(e.target.value)}
          />
          <Input
            label="Task Title"
            placeholder="e.g., Review Chapter 3 — Loops"
            value={fTitle}
            onChange={(e) => setFTitle(e.target.value)}
            error={!fTitle.trim() ? 'Required' : undefined}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Date"
              type="date"
              value={fDate ? fDate.split('T')[0] : ''}
              onChange={(e) => setFDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
            />
            <Input
              label="Target Hours"
              type="number"
              min={0.5}
              step={0.5}
              value={fHours}
              onChange={(e) => setFHours(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Priority</label>
            <select
              className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground"
              value={fPriority}
              onChange={(e) => setFPriority(e.target.value as 'high' | 'medium' | 'low')}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setShowModal(false); resetForm() }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdd}>
              Add Task
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Study Task"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
