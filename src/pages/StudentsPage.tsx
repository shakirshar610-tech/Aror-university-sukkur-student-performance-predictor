import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '@/services/studentService'
import { fetchPredictionsByStudent } from '@/services/predictionService'
import { formatScore, formatDate } from '@/lib/utils'
import { university, departments, programs, allCourses } from '@/config/university'
import type { Student, PredictionRecord } from '@/types'

interface PageProps {
  students: Student[]
  predictions: PredictionRecord[]
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>
}

const ITEMS_PER_PAGE = 8
type SortField = 'name' | 'course' | 'created_at'

export function StudentsPage({ students, predictions, setStudents }: PageProps) {
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null)
  const [studentPredictions, setStudentPredictions] = useState<PredictionRecord[]>([])
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formCourse, setFormCourse] = useState('')

  const courses = useMemo(() => {
    const studentCourses = new Set(students.map((s) => s.course).filter(Boolean))
    const curriculumCourses = allCourses.map(c => c.title)
    return Array.from(new Set([...studentCourses, ...curriculumCourses])).sort()
  }, [students])

  const filtered = useMemo(() => {
    let result = [...students]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.student_name.toLowerCase().includes(q) ||
          (s.student_code || '').toLowerCase().includes(q),
      )
    }
    if (courseFilter) {
      result = result.filter((s) => s.course === courseFilter)
    }
    result.sort((a, b) => {
      let cmp = 0
      if (sortField === 'name') cmp = a.student_name.localeCompare(b.student_name)
      else if (sortField === 'course') cmp = (a.course || '').localeCompare(b.course || '')
      else cmp = a.created_at.localeCompare(b.created_at)
      return sortAsc ? cmp : -cmp
    })
    return result
  }, [students, search, courseFilter, sortField, sortAsc])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const predCountFor = (studentId: string) =>
    predictions.filter((p) => p.student_id === studentId).length

  const handleAdd = async () => {
    if (!formName.trim()) {
      addToast('error', 'Validation Error', 'Student name is required')
      return
    }
    try {
      const created = await createStudent({
        student_name: formName.trim(),
        student_code: formCode.trim(),
        course: formCourse.trim() || 'General',
      })
      setStudents((prev) => [created, ...prev])
      addToast('success', 'Student added', `${created.student_name} has been added`)
      resetForm()
      setShowAddModal(false)
    } catch (err) {
      addToast('error', 'Failed to add student', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleEdit = async () => {
    if (!editingStudent || !formName.trim()) {
      addToast('error', 'Validation Error', 'Student name is required')
      return
    }
    try {
      const updated = await updateStudent(editingStudent.id, {
        student_name: formName.trim(),
        student_code: formCode.trim(),
        course: formCourse.trim() || 'General',
      })
      setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      addToast('success', 'Student updated', `${updated.student_name} has been updated`)
      resetForm()
      setEditingStudent(null)
    } catch (err) {
      addToast('error', 'Failed to update student', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteStudent(deleteTarget.id)
      setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      addToast('success', 'Student deleted', `${deleteTarget.student_name} has been removed`)
      setDeleteTarget(null)
    } catch (err) {
      addToast('error', 'Failed to delete student', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleView = async (student: Student) => {
    setViewingStudent(student)
    const preds = await fetchPredictionsByStudent(student.id)
    setStudentPredictions(preds)
  }

  const resetForm = () => {
    setFormName('')
    setFormCode('')
    setFormCourse('')
  }

  const openEdit = (student: Student) => {
    setEditingStudent(student)
    setFormName(student.student_name)
    setFormCode(student.student_code || '')
    setFormCourse(student.course || '')
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    ) : null

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <select
          className="px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <Button onClick={() => { resetForm(); setShowAddModal(true) }}>
          <Plus size={16} />
          Add Student
        </Button>
      </div>

      {/* Table */}
      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={20} />}
            title="No students found"
            description={search || courseFilter ? "Try adjusting your search or filters." : "Add your first student to get started."}
            action={
              !search && !courseFilter ? (
                <Button size="sm" onClick={() => setShowAddModal(true)}>
                  <Plus size={14} /> Add Student
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer" onClick={() => toggleSort('name')}>
                      <span className="flex items-center gap-1">Name <SortIcon field="name" /></span>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer" onClick={() => toggleSort('course')}>
                      <span className="flex items-center gap-1">Course <SortIcon field="course" /></span>
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Predictions</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer" onClick={() => toggleSort('created_at')}>
                      <span className="flex items-center gap-1">Created <SortIcon field="created_at" /></span>
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((student) => (
                    <tr key={student.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{student.student_name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{student.student_code || '—'}</td>
                      <td className="py-3 px-4">
                        <Badge variant="info">{student.course || 'General'}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums">{predCountFor(student.id)}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{formatDate(student.created_at)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(student)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEdit(student)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(student)}
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
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        open={showAddModal || editingStudent !== null}
        onClose={() => { setShowAddModal(false); setEditingStudent(null); resetForm() }}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
      >
        <div className="space-y-4">
          <Input
            label="Student Name"
            placeholder="e.g., Jane Doe"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            error={!formName.trim() ? 'Name is required' : undefined}
          />
          <Input
            label="Student ID"
            placeholder="e.g., STU001"
            value={formCode}
            onChange={(e) => setFormCode(e.target.value)}
          />
          <Input
            label="Course / Subject"
            placeholder="e.g., Programming Fundamentals"
            value={formCourse}
            onChange={(e) => setFormCourse(e.target.value)}
            hint="Enter your course title or select from the BS AI curriculum"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setShowAddModal(false); setEditingStudent(null); resetForm() }}>
              Cancel
            </Button>
            <Button size="sm" onClick={editingStudent ? handleEdit : handleAdd}>
              {editingStudent ? 'Save Changes' : 'Add Student'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        open={viewingStudent !== null}
        onClose={() => setViewingStudent(null)}
        title="Student Profile"
      >
        {viewingStudent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{viewingStudent.student_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Student ID</p>
                <p className="text-sm font-medium">{viewingStudent.student_code || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Course</p>
                <p className="text-sm font-medium">{viewingStudent.course || 'General'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">{formatDate(viewingStudent.created_at)}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold mb-2">Prediction History ({studentPredictions.length})</p>
              {studentPredictions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No predictions recorded for this student.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                  {studentPredictions.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="text-xs text-muted-foreground">
                        {p.study_hours}h / {p.attendance}% / {p.previous_score} →
                      </div>
                      <span className="font-display text-sm font-bold text-primary-500">
                        {formatScore(p.predicted_score)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteTarget?.student_name}? This will also delete all their prediction records.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
