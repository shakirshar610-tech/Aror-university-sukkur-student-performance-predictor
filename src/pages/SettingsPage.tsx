import { Sun, Moon, Database, Server, Cpu, Info, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useTheme } from '@/context/ThemeContext'
import { isSupabaseConfigured } from '@/lib/supabase'
import { formatNumber } from '@/lib/utils'
import { university, departments, programs, gradeScale, minAttendanceForExamEligibility, allCourses } from '@/config/university'
import type { TrainedModel } from '@/types'

interface PageProps {
  model: TrainedModel
}

export function SettingsPage({ model }: PageProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the application looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
              <div>
                <p className="text-sm font-medium">Theme</p>
                <p className="text-xs text-muted-foreground">
                  Currently using {theme === 'light' ? 'light' : 'dark'} mode
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="relative w-12 h-6 rounded-full bg-muted border border-border transition-colors"
              style={{ background: theme === 'dark' ? 'hsl(var(--primary))' : undefined }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                style={{ transform: theme === 'dark' ? 'translateX(24px)' : 'none' }}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle>Database Configuration</CardTitle>
          <CardDescription>Connection status and details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-muted-foreground" />
                <span className="text-sm">Supabase Connection</span>
              </div>
              {isSupabaseConfigured ? (
                <Badge variant="success">Connected</Badge>
              ) : (
                <Badge variant="error">Not Configured</Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server size={16} className="text-muted-foreground" />
                <span className="text-sm">Database Tables</span>
              </div>
              <span className="text-sm text-muted-foreground">students, predictions, tasks, notifications, attendance, events, grade_records, study_sessions, quiz_attempts, portfolio_items</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-muted-foreground" />
                <span className="text-sm">RLS Policy</span>
              </div>
              <span className="text-sm text-muted-foreground">Anon + Authenticated (single-tenant)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Info */}
      <Card>
        <CardHeader>
          <CardTitle>Model Configuration</CardTitle>
          <CardDescription>Current machine learning model details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-muted-foreground" />
                <span className="text-sm">Algorithm</span>
              </div>
              <span className="text-sm font-medium">{model.algorithm}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Version</span>
              <span className="text-sm font-medium">v{model.version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Test R² Score</span>
              <span className="text-sm font-medium tabular-nums">{formatNumber(model.metrics.r2, 4)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Test MAE</span>
              <span className="text-sm font-medium tabular-nums">{formatNumber(model.metrics.mae, 2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Test RMSE</span>
              <span className="text-sm font-medium tabular-nums">{formatNumber(model.metrics.rmse, 2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Train/Test Split</span>
              <span className="text-sm font-medium tabular-nums">{model.metrics.trainSize} / {model.metrics.testSize}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backend Status */}
      <Card>
        <CardHeader>
          <CardTitle>Backend Status</CardTitle>
          <CardDescription>Python ML service (optional — not required for predictions)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-3 rounded-md bg-muted/30 text-xs text-muted-foreground space-y-1">
            <p>The Python FastAPI backend source code is included in the <code className="bg-muted px-1 rounded">backend/</code> directory but is not required for the application to function.</p>
            <p>The frontend uses an in-browser TypeScript implementation of the same linear regression algorithm, so predictions work without the backend running.</p>
            <p>See the <code className="bg-muted px-1 rounded">docs/DEPLOYMENT.md</code> file for instructions on running the Python backend locally.</p>
          </div>
        </CardContent>
      </Card>

      {/* University Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>University Configuration</CardTitle>
          <CardDescription>Academic structure and grading policy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">University</span>
              <span className="font-medium text-right">{university.shortName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium text-right">{university.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Departments</span>
              <span className="font-medium">{departments.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Programs</span>
              <span className="font-medium">{programs.filter(p => p.active).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Grade Boundaries</span>
              <span className="font-medium">{gradeScale.length} (A+ to F)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Min Attendance (Exam)</span>
              <span className="font-medium">{minAttendanceForExamEligibility}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verified Curriculum Courses</span>
              <span className="font-medium">{allCourses.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="bg-warning/5 border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-warning" />
            Privacy & Independence Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>{university.independenceNote}</p>
            <p>This tool does not access the official university portal, scrape private student records, or request university credentials. Students enter their own academic information manually.</p>
            <p>All predictions, grades, and academic information displayed are unofficial estimates. Always verify against official university results.</p>
            <p>The app operates in guest mode without authentication. Do not store sensitive information. Role-based access (student, teacher, admin) is planned for a future phase with proper authentication and server-side authorization.</p>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            ASPP (Aror Student Performance Predictor) is an independent academic support tool for
            students of {university.name}. It uses Linear Regression to predict final assessment
            scores based on study hours, attendance, and previous performance. The model is trained
            on synthetic demonstration data and should not be used for official academic decisions
            without validation on representative, authorized data.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
