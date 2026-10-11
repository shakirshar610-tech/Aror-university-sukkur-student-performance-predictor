# Student Performance Predictor — AI-Powered Academic Analytics

A production-quality machine learning web application that predicts a student's final academic score using Linear Regression. Built with React, TypeScript, FastAPI, Supabase, and scikit-learn.

## Features

- **Overview Dashboard** — Summary cards (total students, predictions, averages, model metrics) and interactive charts
- **Predict Score** — Input form with sliders, validation, prediction result card, feature contribution analysis, and what-if scenario comparison
- **Student Management** — Add, edit, view, delete students with search, filter, sort, and pagination
- **Prediction History** — Searchable, filterable history table with CSV export and detail view
- **Analytics** — Score/study-hours/attendance distributions, prediction trends, course-level averages
- **Dataset Management** — CSV upload, validation, preview, descriptive statistics, template download
- **Model Performance** — Actual vs predicted scatter, residual analysis, feature coefficients, limitations
- **Settings** — Theme toggle, database status, model info, backend connection status
- **Documentation** — In-app docs covering architecture, API, setup, and limitations

## Architecture

```
student-performance-predictor/
├── src/                    # Frontend (React + TypeScript + Vite)
│   ├── components/         # Reusable UI components (Card, Button, Modal, etc.)
│   ├── pages/              # 9 application pages
│   ├── hooks/              # useModel, useData hooks
│   ├── services/           # Supabase data services
│   ├── model/              # TypeScript Linear Regression implementation
│   ├── data/               # Training dataset (100 records)
│   ├── types/              # TypeScript type definitions
│   └── styles/             # Tailwind CSS globals
├── backend/                # Python FastAPI backend
│   ├── app/                # FastAPI app, routes, schemas, services
│   ├── ml/                 # Training pipeline (train.py, predict.py, evaluate.py)
│   └── tests/              # Pytest test suite
├── data/                   # CSV datasets
├── docs/                   # API.md, MODEL.md, DEPLOYMENT.md
└── supabase/               # Database migrations
```

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons |
| Backend | Python, FastAPI, Pydantic, Uvicorn |
| ML | scikit-learn, Pandas, NumPy, Joblib |
| Database | Supabase PostgreSQL |
| Frontend ML | TypeScript OLS implementation (browser-based, mirrors Python model) |

## Quick Start

### Frontend

```bash
npm install
npm run dev      # Development server at http://localhost:5173
npm run build    # Production build
```

The frontend works standalone — it includes a TypeScript implementation of Ordinary Least Squares linear regression that trains in the browser on 100 student records. Predictions, charts, and all UI features work without the Python backend.

### Backend (optional, for production ML)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

python ml/train.py              # Train the model, saves to ml/model.joblib
uvicorn app.main:app --reload --port 8000  # Start API server
```

Swagger docs available at `http://localhost:8000/docs` when running.

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

## Dataset Format

CSV file with these columns:

| Column | Type | Range | Description |
|--------|------|-------|-------------|
| `study_hours` | float | 0–24 | Hours studied per day |
| `attendance` | float | 0–100 | Attendance percentage |
| `previous_score` | float | 0–100 | Previous academic score |
| `final_score` | float | 0–100 | Target: final exam score |

The default dataset (`data/student_data.csv`) contains 100 synthetic records for educational demonstration. A production model should be trained on real, representative data.

## Model Training

The Python training pipeline (`backend/ml/train.py`):

1. Loads `data/student_data.csv` with Pandas
2. Validates required columns and numeric ranges
3. Drops rows with missing values
4. Splits 80/20 (random_state=42 for reproducibility)
5. Trains `sklearn.linear_model.LinearRegression`
6. Evaluates on the held-out test set (MAE, RMSE, R²)
7. Saves model + metadata to `ml/model.joblib` with Joblib

The raw model output is preserved for metric calculation. For display, scores are clamped to 0–100 and the raw value is shown when clamping occurs.

## Environment Variables

### Frontend (`.env`)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Only public values (Supabase URL, anon key) are exposed to the browser. Never put service-role keys in Vite env vars.

### Backend (`backend/.env`)

See `backend/.env.example` for all options including database URL and CORS origins.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | API status and model availability |
| GET | `/api/model/info` | Model metadata and metrics |
| POST | `/api/predict` | Generate prediction from features |
| POST | `/api/dataset/validate` | Validate uploaded CSV |

Full API documentation: `docs/API.md`

## Database (Supabase)

Four tables created via migration:

- **students** — Student profiles (name, code, course)
- **predictions** — Prediction records (inputs, output, model version, timestamp)
- **model_versions** — Trained model metadata (algorithm, metrics, coefficients)
- **dataset_metadata** — Upload tracking (filename, row count, validation status)

Row-level security is enabled with `anon, authenticated` policies (single-tenant, no auth). See the migration file in `supabase/migrations/`.

## Limitations

- The training dataset is **synthetic** and for educational purposes only
- Only **Linear Regression** is implemented — no comparison with other algorithms
- The model uses **three features** — real performance depends on many more factors
- **No authentication** — single-tenant database policies are used
- The **FastAPI backend** source is included but not deployed — the frontend uses an in-browser ML implementation
- A high R² does not guarantee reliable predictions for individual students

## Future Improvements

- Train on real, representative student data
- Compare Linear Regression with Ridge, Lasso, Random Forest, XGBoost
- Add more features (motivation, sleep, socioeconomic factors)
- Implement Supabase Auth for multi-user access
- Deploy the FastAPI backend (Railway, Render, Fly.io)
- Add automated CI/CD pipeline
