import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  Bell,
  ClipboardCheck,
  Target,
  CalendarDays,
  FileText,
  Settings,
  BookOpen,
  Calculator,
  Brain,
  FolderOpen,
  Briefcase,
  Building2,
  TrendingUp,
  Database,
  Gauge,
  History,
  GraduationCap,
} from 'lucide-react'
import type { PageId } from '@/types'

export interface NavItem {
  id: PageId
  label: string
  icon: typeof LayoutDashboard
}

export const navItems: NavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'departments', label: 'Departments & Programs', icon: Building2 },
  { id: 'students', label: 'My Courses', icon: Users },
  { id: 'tasks', label: 'Tasks & Assignments', icon: CheckSquare },
  { id: 'calendar', label: 'Academic Calendar', icon: Calendar },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
  { id: 'predict', label: 'Performance Predictor', icon: Target },
  { id: 'grade-calculator', label: 'Grade Calculator', icon: Calculator },
  { id: 'study-planner', label: 'Study Planner', icon: CalendarDays },
  { id: 'quiz-practice', label: 'Quiz Practice', icon: Brain },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'history', label: 'Prediction History', icon: History },
  { id: 'portfolio', label: 'Portfolio', icon: FolderOpen },
  { id: 'career-center', label: 'Career Center', icon: Briefcase },
  { id: 'dataset', label: 'Dataset', icon: Database },
  { id: 'model-performance', label: 'Model Performance', icon: Gauge },
  { id: 'academic-records', label: 'Academic Records', icon: GraduationCap },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'documentation', label: 'Help & Documentation', icon: BookOpen },
]
