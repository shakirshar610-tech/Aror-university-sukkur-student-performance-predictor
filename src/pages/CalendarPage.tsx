import { useState, useEffect, useMemo } from 'react'
import {
  Calendar as CalIcon, ChevronLeft, ChevronRight, Plus, Trash2, Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import { fetchEvents, createEvent, deleteEvent, eventColors, type AcademicEvent } from '@/services/eventService'
import { fetchTasks, type Task } from '@/services/taskService'
import { allCourses } from '@/config/university'
import { formatDate } from '@/lib/utils'

const EVENT_TYPES = [
  { value: 'assignment', label: 'Assignment Deadline' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'exam', label: 'Examination' },
  { value: 'lab', label: 'Lab Session' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'study', label: 'Study Session' },
  { value: 'class', label: 'Class' },
  { value: 'personal', label: 'Personal' },
]

type ViewMode = 'month' | 'week' | 'agenda'

export function CalendarPage() {
  const { addToast } = useToast()
  const [events, setEvents] = useState<AcademicEvent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AcademicEvent | null>(null)
  const [filterType, setFilterType] = useState('')

  // Form
  const [fTitle, setFTitle] = useState('')
  const [fCourseCode, setFCourseCode] = useState('')
  const [fEventType, setFEventType] = useState('study')
  const [fStartDate, setFStartDate] = useState('')
  const [fStartTime, setFStartTime] = useState('')
  const [fEndDate, setFEndDate] = useState('')
  const [fLocation, setFLocation] = useState('')
  const [fAllDay, setFAllDay] = useState(false)
  const [fDescription, setFDescription] = useState('')

  const load = async () => {
    setLoading(true)
    const [evs, tks] = await Promise.all([fetchEvents(), fetchTasks()])
    setEvents(evs)
    setTasks(tks)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Combine events + task deadlines into calendar items
  const allCalendarItems = useMemo(() => {
    const taskEvents: AcademicEvent[] = tasks
      .filter(t => t.deadline && t.status !== 'completed' && t.status !== 'cancelled')
      .map(t => ({
        id: `task-${t.id}`,
        title: t.title,
        description: t.description,
        course_code: t.course_code,
        event_type: t.category === 'exam' ? 'exam' : t.category === 'quiz' ? 'quiz' : 'assignment',
        start_date: t.deadline!,
        end_date: t.deadline,
        all_day: false,
        location: null,
        color: eventColors[t.category] || eventColors.assignment,
        created_by: 'task',
        created_at: '',
        updated_at: '',
      }))
    return [...events, ...taskEvents]
  }, [events, tasks])

  const filteredItems = useMemo(() => {
    if (!filterType) return allCalendarItems
    return allCalendarItems.filter(e => e.event_type === filterType)
  }, [allCalendarItems, filterType])

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startWeekday = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    const cells: (Date | null)[] = []
    for (let i = 0; i < startWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [currentDate])

  const weekData = useMemo(() => {
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [currentDate])

  const agendaItems = useMemo(() => {
    return [...filteredItems]
      .filter(e => new Date(e.start_date) >= new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) &&
                     new Date(e.start_date) <= new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0))
      .sort((a, b) => a.start_date.localeCompare(b.start_date))
  }, [filteredItems, currentDate])

  const eventsForDate = (date: Date) => {
    return filteredItems.filter(e => {
      const evDate = new Date(e.start_date)
      return evDate.getDate() === date.getDate() &&
             evDate.getMonth() === date.getMonth() &&
             evDate.getFullYear() === date.getFullYear()
    })
  }

  const handleAdd = async () => {
    if (!fTitle.trim()) { addToast('error', 'Title required'); return }
    const startDate = fAllDay ? `${fStartDate}T00:00:00` : `${fStartDate}T${fStartTime || '09:00'}:00`
    const endDate = fEndDate ? `${fEndDate}T23:59:59` : startDate
    try {
      await createEvent({
        title: fTitle.trim(),
        description: fDescription.trim() || undefined,
        course_code: fCourseCode || undefined,
        event_type: fEventType,
        start_date: startDate,
        end_date: endDate,
        all_day: fAllDay,
        location: fLocation.trim() || undefined,
        color: eventColors[fEventType] || eventColors.study,
      })
      addToast('success', 'Event added', `"${fTitle}" has been added to your calendar.`)
      resetForm(); setShowModal(false); load()
    } catch (err) {
      addToast('error', 'Failed to add event', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const resetForm = () => {
    setFTitle(''); setFCourseCode(''); setFEventType('study'); setFStartDate('')
    setFStartTime(''); setFEndDate(''); setFLocation(''); setFAllDay(false); setFDescription('')
  }

  const handleDelete = async () => {
    if (!deleteTarget || deleteTarget.created_by === 'task') { setDeleteTarget(null); return }
    try {
      await deleteEvent(deleteTarget.id)
      addToast('success', 'Event deleted')
      setDeleteTarget(null); load()
    } catch (err) {
      addToast('error', 'Failed to delete event')
    }
  }

  const navigateMonth = (delta: number) => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() + delta)
    setCurrentDate(d)
  }

  const navigateWeek = (delta: number) => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + delta * 7)
    setCurrentDate(d)
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const typeLabel = (t: string) => EVENT_TYPES.find(e => e.value === t)?.label || t

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => viewMode === 'month' ? navigateMonth(-1) : navigateWeek(-1)}>
            <ChevronLeft size={16} />
          </Button>
          <h2 className="font-display text-lg font-semibold min-w-[180px] text-center">{monthName}</h2>
          <Button variant="outline" size="sm" onClick={() => viewMode === 'month' ? navigateMonth(1) : navigateWeek(1)}>
            <ChevronRight size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-md border border-border overflow-hidden">
            {(['month', 'week', 'agenda'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === mode ? 'bg-primary-500 text-white' : 'bg-card text-muted-foreground hover:bg-muted'}`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <select className="px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <Button size="sm" onClick={() => { resetForm(); setShowModal(true) }}><Plus size={14} /> Add Event</Button>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        {loading ? (
          <CardContent className="p-8 text-center text-sm text-muted-foreground">Loading calendar...</CardContent>
        ) : viewMode === 'month' ? (
          <div>
            <div className="grid grid-cols-7 border-b border-border">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center py-2 text-xs font-medium text-muted-foreground">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthData.map((date, i) => {
                if (!date) return <div key={i} className="min-h-[80px] sm:min-h-[100px] border-b border-r border-border bg-muted/10" />
                const dayEvents = eventsForDate(date)
                const isToday = date.getTime() === today.getTime()
                return (
                  <div key={i} className={`min-h-[80px] sm:min-h-[100px] border-b border-r border-border p-1.5 ${isToday ? 'bg-primary-500/5' : ''}`}>
                    <p className={`text-xs font-medium mb-1 ${isToday ? 'text-primary-500' : 'text-muted-foreground'}`}>{date.getDate()}</p>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div
                          key={ev.id}
                          className="text-xs rounded px-1 py-0.5 truncate cursor-pointer"
                          style={{ backgroundColor: `${ev.color}20`, color: ev.color }}
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && <p className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : viewMode === 'week' ? (
          <div className="grid grid-cols-7 gap-2">
            {weekData.map((date, i) => {
              const dayEvents = eventsForDate(date)
              const isToday = date.getTime() === today.getTime()
              return (
                <div key={i} className={`min-h-[200px] rounded-md border p-2 ${isToday ? 'border-primary-500 bg-primary-500/5' : 'border-border'}`}>
                  <p className={`text-xs font-medium mb-2 ${isToday ? 'text-primary-500' : 'text-muted-foreground'}`}>
                    {date.toLocaleString('default', { weekday: 'short' })} {date.getDate()}
                  </p>
                  <div className="space-y-1">
                    {dayEvents.map(ev => (
                      <div key={ev.id} className="text-xs rounded px-1.5 py-1" style={{ backgroundColor: `${ev.color}20`, color: ev.color }}>
                        <p className="font-medium truncate">{ev.title}</p>
                        {!ev.all_day && <p className="opacity-70"><Clock size={9} className="inline" /> {new Date(ev.start_date).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Agenda view */
          agendaItems.length === 0 ? (
            <EmptyState icon={<CalIcon size={20} />} title="No events this month" description="Add events or tasks with deadlines to see them in your agenda." />
          ) : (
            <div className="divide-y divide-border">
              {agendaItems.map(ev => (
                <div key={ev.id} className="flex items-start gap-3 py-3 px-4 hover:bg-muted/20 transition-colors">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: ev.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{ev.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="info">{typeLabel(ev.event_type)}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(ev.start_date)}</span>
                      {ev.location && <span className="text-xs text-muted-foreground">@ {ev.location}</span>}
                      {ev.created_by === 'task' && <span className="text-xs text-muted-foreground/60">(from task)</span>}
                    </div>
                  </div>
                  {ev.created_by !== 'task' && ev.created_by === 'student' && (
                    <button onClick={() => setDeleteTarget(ev)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            Events labeled "from task" are automatically generated from your task deadlines.
            Only events you create can be deleted from the calendar. Official examination dates
            require an authorized source and are not shown unless provided.
          </p>
        </CardContent>
      </Card>

      {/* Add Event Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm() }} title="Add Calendar Event">
        <div className="space-y-4">
          <Input label="Title" placeholder="e.g., Study Session — Chapter 5" value={fTitle} onChange={(e) => setFTitle(e.target.value)} error={!fTitle.trim() ? 'Required' : undefined} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Event Type</label>
              <select className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground" value={fEventType} onChange={(e) => setFEventType(e.target.value)}>
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Course (optional)</label>
              <select className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground" value={fCourseCode} onChange={(e) => setFCourseCode(e.target.value)}>
                <option value="">— None —</option>
                {allCourses.map(c => <option key={c.id} value={c.courseCode}>{c.courseCode} — {c.title}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={fStartDate} onChange={(e) => setFStartDate(e.target.value)} />
            {!fAllDay && <Input label="Start Time" type="time" value={fStartTime} onChange={(e) => setFStartTime(e.target.value)} />}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="allDay" checked={fAllDay} onChange={(e) => setFAllDay(e.target.checked)} className="rounded" />
            <label htmlFor="allDay" className="text-sm text-foreground">All day event</label>
          </div>
          {!fAllDay && <Input label="End Date (optional)" type="date" value={fEndDate} onChange={(e) => setFEndDate(e.target.value)} />}
          <Input label="Location (optional)" placeholder="e.g., Room 201, CS Block" value={fLocation} onChange={(e) => setFLocation(e.target.value)} />
          <Input label="Description (optional)" placeholder="Event details or notes" value={fDescription} onChange={(e) => setFDescription(e.target.value)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setShowModal(false); resetForm() }}>Cancel</Button>
            <Button size="sm" onClick={handleAdd}>Add Event</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteTarget !== null} title="Delete Event" message={`Delete "${deleteTarget?.title}"?`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
