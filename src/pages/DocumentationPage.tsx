import { BookOpen, Code, Database, Server, Cpu, FileText, ExternalLink, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { university } from '@/config/university'

export function DocumentationPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Intro */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary-500" />
            <CardTitle>ASPP Documentation</CardTitle>
          </div>
          <CardDescription>Aror Student Performance Predictor — Complete guide</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ASPP is an AI-powered academic analytics platform designed specifically for students of
            {' '}{university.name}. It uses Linear Regression to predict a student's final assessment
            score based on three features: study hours per day, attendance percentage, and previous
            assessment score. The platform is configured with the university's published semester
            system, grading scale, assessment framework, and BS Artificial Intelligence curriculum.
          </p>
          <div className="mt-4 flex gap-2 p-3 rounded-md bg-warning/10 border border-warning/20">
            <ShieldAlert size={16} className="flex-shrink-0 mt-0.5 text-warning" />
            <p className="text-xs text-warning">
              {university.independenceNote}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* University Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>University Configuration</CardTitle>
          <CardDescription>Academic structure seeded from publicly available information</CardDescription>
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
              <span className="font-medium">14</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Programs</span>
              <span className="font-medium">14 (all active)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">BS AI Courses</span>
              <span className="font-medium">40 across 8 semesters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Grading Scale</span>
              <span className="font-medium">12 grade boundaries (A+ to F)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assessment Frameworks</span>
              <span className="font-medium">Theory (100 marks) + Practical (50 marks)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Semester Structure</span>
              <span className="font-medium">16 weeks, Fall & Spring</span>
            </div>
            <div className="pt-2 border-t border-border">
              <a
                href={university.examRulesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary-500 hover:underline"
              >
                Official Examination Rules <ExternalLink size={12} />
              </a>
              <span className="mx-2 text-muted-foreground">|</span>
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary-500 hover:underline"
              >
                University Website <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Architecture */}
      <Card>
        <CardHeader>
          <CardTitle>Architecture</CardTitle>
          <CardDescription>System overview and component relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex gap-3">
              <Code size={18} className="text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Frontend (React + TypeScript + Vite)</p>
                <p className="text-muted-foreground mt-1">
                  A responsive single-page application built with React, TypeScript, Tailwind CSS,
                  and Recharts. Features a sidebar layout with 9 pages: Overview dashboard, Predict
                  Score, Students, Prediction History, Analytics, Dataset Management, Model
                  Performance, Settings, and Documentation.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Server size={18} className="text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Backend (Python + FastAPI)</p>
                <p className="text-muted-foreground mt-1">
                  A FastAPI application that loads a pre-trained scikit-learn Linear Regression
                  model and serves prediction endpoints. Source code is in the
                  <code className="bg-muted px-1 rounded mx-1">backend/</code>
                  directory with a complete ML training pipeline. See
                  <code className="bg-muted px-1 rounded mx-1">docs/DEPLOYMENT.md</code>
                  for setup instructions.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Database size={18} className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Database (Supabase PostgreSQL)</p>
                <p className="text-muted-foreground mt-1">
                  Four tables: students, predictions, model_versions, and dataset_metadata.
                  Row-level security is enabled with anon+authenticated policies for single-tenant
                  access. The frontend connects directly via the Supabase JS client.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Cpu size={18} className="text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">ML Model (Linear Regression)</p>
                <p className="text-muted-foreground mt-1">
                  The frontend includes a TypeScript implementation of Ordinary Least Squares linear
                  regression that trains in the browser on 100 student records. This mirrors the
                  Python scikit-learn model and ensures predictions work without the backend. The
                  Python backend uses the same algorithm via scikit-learn for production use.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Frontend</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>React 18 + TypeScript</li>
                <li>Vite (build tool)</li>
                <li>Tailwind CSS (styling)</li>
                <li>Recharts (data visualization)</li>
                <li>Lucide React (icons)</li>
                <li>Supabase JS Client</li>
                <li>Aror University academic config module</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Backend</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Python 3.10+</li>
                <li>FastAPI (web framework)</li>
                <li>Scikit-learn (ML)</li>
                <li>Pandas + NumPy (data)</li>
                <li>Joblib (model serialization)</li>
                <li>Pydantic (validation)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dataset */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Format</CardTitle>
          <CardDescription>CSV columns and value ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Column</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Range</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-2 px-3 font-mono">study_hours</td>
                  <td className="py-2 px-3">float</td>
                  <td className="py-2 px-3">0–24</td>
                  <td className="py-2 px-3 text-muted-foreground">Hours studied per day</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 px-3 font-mono">attendance</td>
                  <td className="py-2 px-3">float</td>
                  <td className="py-2 px-3">0–100</td>
                  <td className="py-2 px-3 text-muted-foreground">Attendance percentage</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 px-3 font-mono">previous_score</td>
                  <td className="py-2 px-3">float</td>
                  <td className="py-2 px-3">0–100</td>
                  <td className="py-2 px-3 text-muted-foreground">Previous academic score</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">final_score</td>
                  <td className="py-2 px-3">float</td>
                  <td className="py-2 px-3">0–100</td>
                  <td className="py-2 px-3 text-muted-foreground">Target: final exam score</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            The default dataset contains 100 synthetic records for educational demonstration.
            A production model should be trained on real, representative data.
          </p>
        </CardContent>
      </Card>

      {/* Model Details */}
      <Card>
        <CardHeader>
          <CardTitle>Model Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Algorithm:</strong> Linear Regression (Ordinary Least Squares).
              The model learns weights (coefficients) for each feature by minimizing the sum of squared
              residuals between predicted and actual scores.
            </p>
            <p>
              <strong className="text-foreground">Training:</strong> The dataset is split 80/20 into
              training and test sets using a fixed random seed for reproducibility. The model is trained
              on 80% of the data and evaluated on the held-out 20%.
            </p>
            <p>
              <strong className="text-foreground">Evaluation Metrics:</strong>
            </p>
            <ul className="ml-4 space-y-1">
              <li><strong>MAE</strong> — Mean Absolute Error: average absolute difference between predicted and actual scores.</li>
              <li><strong>RMSE</strong> — Root Mean Squared Error: penalizes larger errors more heavily.</li>
              <li><strong>R²</strong> — Coefficient of Determination: proportion of variance explained by the model (0–1, can be negative).</li>
            </ul>
            <p>
              <strong className="text-foreground">Output Policy:</strong> The raw model output is
              preserved for metric calculation. For user-facing display, predicted scores are clamped
              to 0–100 and the raw value is shown when clamping occurs. This is documented in the
              prediction result panel.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints (FastAPI Backend)</CardTitle>
          <CardDescription>The Python backend exposes these endpoints when running</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { method: 'GET', path: '/api/health', desc: 'API status, model availability, version' },
              { method: 'GET', path: '/api/model/info', desc: 'Model type, features, training date, metrics' },
              { method: 'POST', path: '/api/predict', desc: 'Generate prediction from input features' },
              { method: 'POST', path: '/api/students', desc: 'Create a student record' },
              { method: 'GET', path: '/api/students', desc: 'List students with pagination' },
              { method: 'GET', path: '/api/students/{id}', desc: 'Get student details' },
              { method: 'PATCH', path: '/api/students/{id}', desc: 'Update a student record' },
              { method: 'DELETE', path: '/api/students/{id}', desc: 'Delete a student record' },
              { method: 'GET', path: '/api/predictions', desc: 'Prediction history with filters' },
              { method: 'POST', path: '/api/dataset/validate', desc: 'Validate uploaded CSV dataset' },
              { method: 'GET', path: '/api/analytics/overview', desc: 'Dashboard statistics' },
            ].map((ep) => (
              <div key={ep.path} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <Badge variant={ep.method === 'GET' ? 'info' : ep.method === 'POST' ? 'success' : ep.method === 'DELETE' ? 'error' : 'warning'}>
                  {ep.method}
                </Badge>
                <code className="text-sm font-mono">{ep.path}</code>
                <span className="text-xs text-muted-foreground ml-auto">{ep.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            When the FastAPI backend is running, Swagger docs are available at
            <code className="bg-muted px-1 rounded mx-1">/docs</code>.
          </p>
        </CardContent>
      </Card>

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Guide</CardTitle>
          <CardDescription>Quick start for frontend and backend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Frontend (this app)</p>
              <pre className="bg-muted/50 rounded-md p-3 text-xs font-mono overflow-x-auto scrollbar-thin">{`npm install
npm run dev    # Development server
npm run build  # Production build`}</pre>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Backend (Python FastAPI)</p>
              <pre className="bg-muted/50 rounded-md p-3 text-xs font-mono overflow-x-auto scrollbar-thin">{`cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt

# Train the model
python ml/train.py

# Start the API server
uvicorn app.main:app --reload --port 8000`}</pre>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Environment Variables</p>
              <pre className="bg-muted/50 rounded-md p-3 text-xs font-mono overflow-x-auto scrollbar-thin">{`# Frontend (.env)
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:8000  # Optional: FastAPI backend

# Backend (backend/.env)
DATABASE_URL=your_database_url
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Limitations */}
      <Card className="bg-muted/30 border-dashed">
        <CardHeader>
          <CardTitle>Limitations & Future Improvements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong className="text-foreground">Synthetic data:</strong> The training dataset is synthetic and for educational purposes only. It has not been validated on real Aror University students. A production model should be trained on representative, authorized data.</p>
            <p><strong className="text-foreground">Linear model only:</strong> Only Linear Regression is implemented. Future work could compare Ridge, Lasso, Random Forest, and gradient-boosted models.</p>
            <p><strong className="text-foreground">Three features:</strong> The model uses only study hours, attendance, and previous score. Additional features (motivation, teaching quality, socioeconomic factors) could improve predictions.</p>
            <p><strong className="text-foreground">No authentication:</strong> The app operates in guest mode. Adding Supabase Auth with role-based access (student, teacher, admin) is planned for a future phase. Do not use this tool for official academic decisions.</p>
            <p><strong className="text-foreground">Backend not deployed:</strong> The FastAPI backend source is included but not running. The frontend uses an in-browser ML implementation for predictions. See the deployment guide to run the Python backend.</p>
            <p><strong className="text-foreground">Independent project:</strong> {university.independenceNote}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 flex items-center gap-2">
          <FileText size={16} className="text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Full documentation files are in the
            <code className="bg-muted px-1 rounded mx-1">docs/</code>
            directory: API.md, MODEL.md, and DEPLOYMENT.md. The project README.md contains
            the complete setup guide.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
