import { useState, useMemo, useEffect } from 'react'
import {
  Plus, Trash2, Edit2, CheckCircle2, Circle, Clock, AlertTriangle,
  CheckSquare, Search, Calendar as CalIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import {
  fetchTasks, createTask, updateTask, deleteTask,
  isOverdue, getDaysUntilDeadline, type Task, type TaskInput,
} from '@/services/taskService'
import { generateNotificationsFromTasks } from '@/services/notificationService'
import { allCourses } from '@/config/university'
import { formatDate } from '@/lib/utils'

const CATEGORIES = [
  { value: 'assignment', label: 'Assignment' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'exam', label: 'Examination' },
  { value: 'lab', label: 'Lab Report' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'project', label: 'Project' },
  { value: 'other', label: 'Other' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low', variant: 'info' as const },
  { value: 'medium', label: 'Medium', variant: 'warning' as const },
  { value: 'high', label: 'High', variant: 'error' as const },
  { value: 'urgent', label: 'Urgent', variant: 'error' as const },
]

const STATUSES = ['upcoming', 'in-progress', 'submitted', 'completed', 'overdue', 'cancelled']

export function TasksPage() {
  const { addToast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  // Form state
  const [fTitle, setFTitle] = useState('')
  const [fDescription, setFDescription] = useState('')
  const [fCourseCode, setFCourseCode] = useState('')
  const [fCategory, setFCategory] = useState('assignment')
  const [fDeadline, setFDeadline] = useState('')
  const [fPriority, setFPriority] = useState('medium')
  const [fMarksMax, setFMarksMax] = useState('')
  const [fMarksObtained, setFMarksObtained] = useState('')

  const load = async () => {
    setLoading(true)
    const data = await fetchTasks()
    setTasks(data)
    // Auto-generate notifications from tasks
    await generateNotificationsFromTasks(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let result = [...tasks]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        (t.course_title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q),
      )
    }
    if (filterStatus) result = result.filter((t) => t.status === filterStatus)
    if (filterCategory) result = result.filter((t) => t.category === filterCategory)
    return result.sort((a, b) => {
      const aOver = isOverdue(a) ? 0 : 1
      const bOver = isOverdue(b) ? 0 : 1
      if (aOver !== bOver) return aOver - bOver
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return a.deadline.localeCompare(b.deadline)
    })
  }, [tasks, search, filterStatus, filterCategory])

  const stats = useMemo(() => {
    const upcoming = tasks.filter((t) => t.status === 'upcoming' || (t.status === 'in-progress')).length
    const overdue = tasks.filter((t) => isOverdue(t)).length
    const completed = tasks.filter((t) => t.status === 'completed').length
    return { total: tasks.length, upcoming, overdue, completed }
  }, [tasks])

  const resetForm = () => {
    setFTitle(''); setFDescription(''); setFCourseCode(''); setFCategory('assignment')
    setFDeadline(''); setFPriority('medium'); setFMarksMax(''); setFMarksObtained('')
  }

  const handleAdd = async () => {
    if (!fTitle.trim()) { addToast('error', 'Title required', 'Enter a task title.'); return }
    const input: TaskInput = {
      title: fTitle.trim(),
      description: fDescription.trim() || undefined,
      course_code: fCourseCode || undefined,
      course_title: allCourses.find(c => c.courseCode === fCourseCode)?.title || undefined,
      category: fCategory,
      deadline: fDeadline ? new Date(fDeadline).toISOString() : undefined,
      priority: fPriority,
      marks_max: fMarksMax ? parseFloat(fMarksMax) : undefined,
      marks_obtained: fMarksObtained ? parseFloat(fMarksObtained) : undefined,
    }
    try {
      await createTask(input)
      addToast('success', 'Task created', `"${input.title}" has been added.`)
      resetForm(); setShowModal(false); load()
    } catch (err) {
      addToast('error', 'Failed to create task', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleEdit = async () => {
    if (!editingTask || !fTitle.trim()) return
    const input: TaskInput = {
      title: fTitle.trim(),
      description: fDescription.trim() || undefined,
      course_code: fCourseCode || undefined,
      category: fCategory,
      deadline: fDeadline ? new Date(fDeadline).toISOString() : undefined,
      priority: fPriority,
      marks_max: fMarksMax ? parseFloat(fMarksMax) : undefined,
      marks_obtained: fMarksObtained ? parseFloat(fMarksObtained) : undefined,
    }
    try {
      await updateTask(editingTask.id, input)
      addToast('success', 'Task updated')
      resetForm(); setEditingTask(null); load()
    } catch (err) {
      addToast('error', 'Failed to update task', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteTask(deleteTarget.id)
      addToast('success', 'Task deleted')
      setDeleteTarget(null); load()
    } catch (err) {
      addToast('error', 'Failed to delete task', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'upcoming' : 'completed'
    const updates: Partial<TaskInput> = {
      status: newStatus,
      ...(newStatus === 'completed' && task.marks_obtained != null ? { marks_obtained: task.marks_obtained } : {}),
    }
    try {
      await updateTask(task.id, updates)
      load()
    } catch (err) {
      addToast('error', 'Failed to update status')
    }
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setFTitle(task.title)
    setFDescription(task.description || '')
    setFCourseCode(task.course_code || '')
    setFCategory(task.category)
    setFDeadline(task.deadline ? task.deadline.split('T')[0] : '')
    setFPriority(task.priority)
    setFMarksMax(task.marks_max?.toString() || '')
    setFMarksObtained(task.marks_obtained?.toString() || '')
  }

  const priorityBadge = (p: string) => {
    const pri = PRIORITIES.find(x => x.value === p)
    return pri ? <Badge variant={pri.variant}>{pri.label}</Badge> : null
  }

  const categoryLabel = (c: string) => CATEGORIES.find(x => x.value === c)?.label || c

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><CheckSquare size={18} className="text-primary-500" /><p className="text-xs text-muted-foreground">Total Tasks</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{stats.total}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><Clock size={18} className="text-warning" /><p className="text-xs text-muted-foreground">Upcoming</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{stats.upcoming}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle size={18} className="text-destructive" /><p className="text-xs text-muted-foreground">Overdue</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{stats.overdue}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-success" /><p className="text-xs text-muted-foreground">Completed</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{stats.completed}</p>
        </CardContent></Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={16} />} />
        </div>
        <select className="px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</option>)}
        </select>
        <select className="px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <Button onClick={() => { resetForm(); setShowModal(true) }}><Plus size={16} /> Add Task</Button>
      </div>

      {/* Task list */}
      <Card>
        {loading ? (
          <CardContent className="p-8 text-center text-sm text-muted-foreground">Loading tasks...</CardContent>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CheckSquare size={20} />}
            title="No tasks found"
            description={search || filterStatus || filterCategory ? "Try adjusting your filters." : "Add your first assignment, quiz, or exam to start tracking deadlines."}
            action={!search && !filterStatus && !filterCategory ? <Button size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> Add Task</Button> : undefined}
          />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((task) => {
              const days = getDaysUntilDeadline(task.deadline)
              const overdue = isOverdue(task)
              return (
                <div key={task.id} className="flex items-start gap-3 py-3 px-4 hover:bg-muted/20 transition-colors">
                  <button onClick={() => toggleStatus(task)} className={`mt-0.5 ${task.status === 'completed' ? 'text-success' : 'text-muted-foreground hover:text-success'}`}>
                    {task.status === 'completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{task.title}</p>
                    {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {task.course_title && <Badge variant="info">{task.course_title}</Badge>}
                      <Badge variant="default">{categoryLabel(task.category)}</Badge>
                      {priorityBadge(task.priority)}
                      {task.deadline && (
                        <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-destructive' : days !== null && days <= 3 ? 'text-warning' : 'text-muted-foreground'}`}>
                          <CalIcon size={11} />
                          {overdue ? 'Overdue' : days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `Due in ${days} days`}
                          <span className="opacity-60">· {formatDate(task.deadline)}</span>
                        </span>
                      )}
                      {task.marks_max !== null && task.marks_max !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          Marks: {task.marks_obtained ?? '?'}/{task.marks_max}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(task)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit"><Edit2 size={15} /></button>
                    <button onClick={() => setDeleteTarget(task)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal open={showModal || editingTask !== null} onClose={() => { setShowModal(false); setEditingTask(null); resetForm() }} title={editingTask ? 'Edit Task' : 'Add New Task'}>
        <div className="space-y-4">
          <Input label="Title" placeholder="e.g., Assignment 1 — Loops and Arrays" value={fTitle} onChange={(e) => setFTitle(e.target.value)} error={!fTitle.trim() ? 'Required' : undefined} />
          <Input label="Description (optional)" placeholder="Task details, instructions, or notes" value={fDescription} onChange={(e) => setFDescription(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Course</label>
              <select className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground" value={fCourseCode} onChange={(e) => setFCourseCode(e.target.value)}>
                <option value="">— None —</option>
                {allCourses.map(c => <option key={c.id} value={c.courseCode}>{c.courseCode} — {c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
              <select className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground" value={fCategory} onChange={(e) => setFCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Deadline" type="datetime-local" value={fDeadline} onChange={(e) => setFDeadline(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Priority</label>
              <select className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground" value={fPriority} onChange={(e) => setFPriority(e.target.value)}>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Max Marks (optional)" type="number" placeholder="e.g., 30" value={fMarksMax} onChange={(e) => setFMarksMax(e.target.value)} />
            <Input label="Marks Obtained (optional)" type="number" placeholder="e.g., 25" value={fMarksObtained} onChange={(e) => setFMarksObtained(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setShowModal(false); setEditingTask(null); resetForm() }}>Cancel</Button>
            <Button size="sm" onClick={editingTask ? handleEdit : handleAdd}>{editingTask ? 'Save Changes' : 'Add Task'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteTarget !== null} title="Delete Task" message={`Delete "${deleteTarget?.title}"? This cannot be undone.`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
