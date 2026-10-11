import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { ToastContainer } from '@/components/ui/Toast'
import { useModel } from '@/hooks/useModel'
import { useData } from '@/hooks/useData'
import type { PageId } from '@/types'

import { OverviewPage } from '@/pages/OverviewPage'
import { PredictPage } from '@/pages/PredictPage'
import { StudentsPage } from '@/pages/StudentsPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { DatasetPage } from '@/pages/DatasetPage'
import { ModelPerformancePage } from '@/pages/ModelPerformancePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { DocumentationPage } from '@/pages/DocumentationPage'
import { AcademicRecordsPage } from '@/pages/AcademicRecordsPage'
import { StudyPlannerPage } from '@/pages/StudyPlannerPage'
import { TasksPage } from '@/pages/TasksPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { AttendancePage } from '@/pages/AttendancePage'
import { ReportsPage } from '@/pages/ReportsPage'
import { GradeCalculatorPage } from '@/pages/GradeCalculatorPage'
import { QuizPracticePage } from '@/pages/QuizPracticePage'
import { PortfolioPage } from '@/pages/PortfolioPage'
import { CareerCenterPage } from '@/pages/CareerCenterPage'
import { DepartmentsPage } from '@/pages/DepartmentsPage'

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { model, featureImportance, predict, getGrade } = useModel()
  const { students, predictions, loading, error, refresh, setStudents, setPredictions } =
    useData(model)

  useEffect(() => {
    document.title = `${navLabel(currentPage)} — ASPP`
  }, [currentPage])

  const pageProps = {
    model,
    featureImportance,
    predict,
    getGrade,
    students,
    predictions,
    loading,
    error,
    refresh,
    setStudents,
    setPredictions,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          currentPage={currentPage}
          onMenuClick={() => setSidebarOpen(true)}
          modelStatus="trained"
          onNavigate={setCurrentPage}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {currentPage === 'overview' && <OverviewPage {...pageProps} onNavigate={setCurrentPage} />}
          {currentPage === 'predict' && <PredictPage {...pageProps} />}
          {currentPage === 'departments' && <DepartmentsPage />}
          {currentPage === 'students' && <StudentsPage {...pageProps} />}
          {currentPage === 'tasks' && <TasksPage />}
          {currentPage === 'calendar' && <CalendarPage />}
          {currentPage === 'notifications' && <NotificationsPage />}
          {currentPage === 'attendance' && <AttendancePage />}
          {currentPage === 'study-planner' && <StudyPlannerPage />}
          {currentPage === 'academic-records' && <AcademicRecordsPage />}
          {currentPage === 'reports' && <ReportsPage model={model} students={students} predictions={predictions} />}
          {currentPage === 'grade-calculator' && <GradeCalculatorPage />}
          {currentPage === 'quiz-practice' && <QuizPracticePage />}
          {currentPage === 'portfolio' && <PortfolioPage />}
          {currentPage === 'career-center' && <CareerCenterPage />}
          {currentPage === 'history' && <HistoryPage {...pageProps} />}
          {currentPage === 'analytics' && <AnalyticsPage {...pageProps} />}
          {currentPage === 'dataset' && <DatasetPage />}
          {currentPage === 'model-performance' && <ModelPerformancePage model={model} featureImportance={featureImportance} />}
          {currentPage === 'settings' && <SettingsPage model={model} />}
          {currentPage === 'documentation' && <DocumentationPage />}
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}

function navLabel(page: PageId): string {
  const labels: Record<PageId, string> = {
    overview: 'Dashboard',
    predict: 'Performance Predictor',
    students: 'My Courses',
    tasks: 'Tasks & Assignments',
    calendar: 'Academic Calendar',
    notifications: 'Notifications',
    attendance: 'Attendance',
    'study-planner': 'Study Planner',
    'academic-records': 'Academic Records',
    reports: 'Reports',
    'grade-calculator': 'Grade Calculator',
    'quiz-practice': 'Quiz Practice',
    portfolio: 'Portfolio',
    'career-center': 'Career Center',
    departments: 'Departments & Programs',
    history: 'Prediction History',
    analytics: 'Analytics',
    dataset: 'Dataset',
    'model-performance': 'Model Performance',
    settings: 'Settings',
    documentation: 'Help & Documentation',
  }
  return labels[page]
}
