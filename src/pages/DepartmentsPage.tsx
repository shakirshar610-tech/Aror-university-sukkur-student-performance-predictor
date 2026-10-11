import { useState, useMemo } from 'react'
import {
  Building2, ChevronLeft, Search, GraduationCap, Clock,
  BookOpen, CheckCircle2, AlertCircle, FileText, Layers,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/Skeleton'
import {
  departments, programs, allCourses, semesters,
  getProgramsByDepartment, getCoursesByProgramAndSemester,
  theoryAssessment, practicalAssessment,
  type Department, type Program, type Course,
} from '@/config/university'

type View = 'list' | 'detail'

export function DepartmentsPage() {
  const [view, setView] = useState<View>('list')
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterDegree, setFilterDegree] = useState('')
  const [expandedSemesters, setExpandedSemesters] = useState<Set<number>>(new Set([1]))
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const selectedDept = useMemo(
    () => departments.find((d) => d.id === selectedDeptId) || null,
    [selectedDeptId],
  )

  const deptPrograms = useMemo(
    () => selectedDept ? getProgramsByDepartment(selectedDept.id) : [],
    [selectedDept],
  )

  const filteredDepartments = useMemo(() => {
    let result = [...departments]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((d) =>
        d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q),
      )
    }
    if (filterDegree) {
      result = result.filter((d) => {
        const progs = getProgramsByDepartment(d.id)
        return progs.some((p) => p.degreeType === filterDegree)
      })
    }
    return result
  }, [search, filterDegree])

  const degreeTypes = useMemo(() => {
    const types = new Set(programs.map((p) => p.degreeType))
    return Array.from(types)
  }, [])

  const getCourseCount = (deptId: string) => {
    const progs = getProgramsByDepartment(deptId)
    return progs.reduce((sum, p) => sum + allCourses.filter((c) => c.programId === p.id).length, 0)
  }

  const hasCurriculum = (deptId: string) => {
    const progs = getProgramsByDepartment(deptId)
    return progs.some((p) => allCourses.some((c) => c.programId === p.id))
  }

  const toggleSemester = (sem: number) => {
    setExpandedSemesters((prev) => {
      const next = new Set(prev)
      if (next.has(sem)) next.delete(sem)
      else next.add(sem)
      return next
    })
  }

  // Department list view
  if (view === 'list') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Building2 size={20} className="text-primary-500" />
            Departments & Programs
          </h2>
          <p className="text-sm text-muted-foreground">
            Browse all departments and programs at Aror University. Click a department to view its curriculum.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={16} />}
            />
          </div>
          <select
            className="px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground"
            value={filterDegree}
            onChange={(e) => setFilterDegree(e.target.value)}
          >
            <option value="">All Degrees</option>
            {degreeTypes.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {filteredDepartments.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Building2 size={20} />}
              title="No departments found"
              description="Try adjusting your search or filter."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDepartments.map((dept) => {
              const progs = getProgramsByDepartment(dept.id)
              const courseCount = getCourseCount(dept.id)
              const hasCur = hasCurriculum(dept.id)
              return (
                <Card
                  key={dept.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => {
                    setSelectedDeptId(dept.id)
                    setView('detail')
                    setExpandedSemesters(new Set([1]))
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                        <Building2 size={20} className="text-primary-500" />
                      </div>
                      <Badge variant="info">{dept.code}</Badge>
                    </div>
                    <h3 className="font-medium text-sm text-foreground mb-1">{dept.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{dept.description}</p>
                    <div className="space-y-1.5">
                      {progs.map((p) => (
                        <div key={p.id} className="flex items-center gap-2 text-xs">
                          <GraduationCap size={12} className="text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground">{p.name}</span>
                          <span className="text-muted-foreground">({p.durationSemesters} sem)</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <BookOpen size={12} /> {courseCount} courses
                      </span>
                      {hasCur ? (
                        <Badge variant="success" className="text-[10px]">
                          <CheckCircle2 size={10} /> Curriculum available
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px]">
                          <AlertCircle size={10} /> Curriculum pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-primary-500 mt-2 group-hover:underline">
                      View Department →
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              Department and program information is based on publicly available university sources.
              Curriculum data is only shown when verified. Programs without listed courses are
              marked as "Curriculum pending" — this does not mean the program is inactive, only
              that its detailed course list has not been verified.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Department detail view
  if (!selectedDept) {
    setView('list')
    return null
  }

  const program = deptPrograms[0]
  const programCourses = program ? allCourses.filter((c) => c.programId === program.id) : []


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setView('list')}>
          <ChevronLeft size={16} /> All Departments
        </Button>
      </div>

      {/* Department header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <Building2 size={28} className="text-primary-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-xl font-bold text-foreground">{selectedDept.name}</h2>
                <Badge variant="info">{selectedDept.code}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{selectedDept.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deptPrograms.map((prog) => {
          const pCourses = allCourses.filter((c) => c.programId === prog.id)
          const pCredits = pCourses.reduce((s, c) => s + c.creditHours, 0)
          return (
            <Card key={prog.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap size={18} className="text-secondary" />
                  {prog.name}
                </CardTitle>
                <CardDescription>{prog.code} — {prog.degreeType} degree</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium">{prog.durationSemesters} semesters</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={prog.active ? 'success' : 'warning'}>
                      {prog.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Courses</p>
                    <p className="font-medium">{pCourses.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Credit Hours</p>
                    <p className="font-medium">{pCredits}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Semester-wise curriculum */}
      {program && programCourses.length > 0 ? (
        <div>
          <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
            <Layers size={18} className="text-primary-500" />
            {program.name} — Semester-wise Curriculum
          </h3>
          <div className="space-y-3">
            {semesters.slice(0, program.durationSemesters).map((sem) => {
              const semCourses = getCoursesByProgramAndSemester(program.id, sem.number)
              const semCredits = semCourses.reduce((s, c) => s + c.creditHours, 0)
              const isExpanded = expandedSemesters.has(sem.number)
              return (
                <Card key={sem.number}>
                  <button
                    onClick={() => toggleSemester(sem.number)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-secondary">{sem.number}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">Semester {sem.number}</p>
                        <p className="text-xs text-muted-foreground">
                          {semCourses.length} courses · {semCredits} credit hours · {sem.type === 'fall' ? 'Fall' : 'Spring'}
                        </p>
                      </div>
                    </div>
                    <ChevronLeft
                      size={18}
                      className={`text-muted-foreground transition-transform ${isExpanded ? '-rotate-90' : ''}`}
                    />
                  </button>
                  {isExpanded && (
                    <CardContent className="pt-0 pb-3">
                      <div className="space-y-2 mt-2">
                        {semCourses.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            No verified courses available for this semester yet.
                          </p>
                        ) : (
                          semCourses.map((course) => (
                            <div
                              key={course.id}
                              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary-300 hover:bg-muted/20 transition-colors cursor-pointer"
                              onClick={() => setSelectedCourse(course)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-sm text-foreground">{course.title}</span>
                                  <Badge variant="default" className="text-[10px]">{course.courseCode}</Badge>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1"><Clock size={11} /> {course.creditHours} credits</span>
                                  <Badge variant="info" className="text-[10px]">{course.type === 'theory' ? 'Theory' : 'Practical'}</Badge>
                                  <span className="text-muted-foreground/70">{course.category}</span>
                                </div>
                              </div>
                              <BookOpen size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<AlertCircle size={20} />}
            title="Curriculum pending verification"
            description={`The detailed semester-wise course list for ${selectedDept.name} has not been verified yet. This does not mean the program is inactive — only that its official curriculum document has not been added to the system. Please check the official university website for current curriculum information.`}
          />
        </Card>
      )}

      {/* Assessment framework */}
      {program && programCourses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Theory Assessment Framework</CardTitle>
              <CardDescription>Standard assessment components for theory courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {theoryAssessment.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-1.5 px-3 rounded-md bg-muted/20 text-sm">
                    <div>
                      <span className="font-medium">{a.name}</span>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                    </div>
                    <Badge variant="info">{a.weight}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Practical Assessment Framework</CardTitle>
              <CardDescription>Standard assessment components for practical courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {practicalAssessment.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-1.5 px-3 rounded-md bg-muted/20 text-sm">
                    <div>
                      <span className="font-medium">{a.name}</span>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                    </div>
                    <Badge variant="info">{a.weight}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Learning outcomes notice */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <FileText size={14} className="flex-shrink-0 mt-0.5 text-muted-foreground" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Program Learning Outcomes (PLOs), Course Learning Outcomes (CLOs), and Student Learning Outcomes (SLOs):</strong>
              </p>
              <p>
                Official learning outcomes have not yet been verified for this program. Outcome
                mapping will be displayed when an authorized curriculum document is available.
                Please consult the official university curriculum documentation for verified PLOs,
                CLOs, and SLOs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course detail modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="bg-card border border-border rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto scrollbar-thin"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg font-bold">{selectedCourse.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="info">{selectedCourse.courseCode}</Badge>
                    <Badge variant="default">{selectedCourse.type === 'theory' ? 'Theory' : 'Practical'}</Badge>
                  </div>
                </div>
                <button onClick={() => setSelectedCourse(null)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                  <ChevronLeft size={18} className="rotate-90" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-md bg-muted/20">
                  <p className="text-xs text-muted-foreground">Credit Hours</p>
                  <p className="font-medium text-sm">{selectedCourse.creditHours}</p>
                </div>
                <div className="p-3 rounded-md bg-muted/20">
                  <p className="text-xs text-muted-foreground">Semester</p>
                  <p className="font-medium text-sm">{selectedCourse.semester}</p>
                </div>
                <div className="p-3 rounded-md bg-muted/20">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="font-medium text-sm">{selectedCourse.category}</p>
                </div>
                <div className="p-3 rounded-md bg-muted/20">
                  <p className="text-xs text-muted-foreground">Program</p>
                  <p className="font-medium text-sm">{program?.name || '—'}</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-1">Assessment Components</p>
                <div className="space-y-1.5">
                  {(selectedCourse.type === 'theory' ? theoryAssessment : practicalAssessment).map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-md bg-muted/20">
                      <span>{a.name}</span>
                      <Badge variant="info">{a.weight}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-md bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  Official course description, CLOs, and prerequisites are not yet verified for
                  this course. Please consult the official university curriculum document for
                  detailed information.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
