# Deployment Guide

## Frontend Deployment

### Vercel / Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist/` directory.

3. Set environment variables in the hosting dashboard:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon key

### Environment Variables

Only public values should be in Vite environment variables (prefixed with `VITE_`):

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |

**Never** put service-role keys, database passwords, or API secrets in frontend env vars.

## Backend Deployment

### Railway / Render / Fly.io

1. Set the working directory to `backend/`

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Train the model:
```bash
python ml/train.py
```

4. Start the server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

5. Set environment variables in the hosting dashboard (see `backend/.env.example`)

### Docker (optional)

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
RUN python ml/train.py
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Database (Supabase) Configuration

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. The migration in `supabase/migrations/` creates all four tables with RLS policies
3. Run the migration via the Supabase SQL editor or MCP tools
4. Get your project URL and anon key from Settings > API
5. Set them as environment variables for both frontend and backend

### RLS Policies

All tables use `TO anon, authenticated` policies (single-tenant, no auth):
- SELECT, INSERT, UPDATE, DELETE allowed for all roles
- This is appropriate for a demo/single-tenant app
- For multi-user apps, add authentication and scope policies to `authenticated` with ownership checks

## Full Stack Local Development

1. Start the frontend:
```bash
npm run dev
```

2. In a separate terminal, start the backend:
```bash
cd backend
source venv/bin/activate
python ml/train.py          # Only needed once
uvicorn app.main:app --reload --port 8000
```

3. The frontend runs at `http://localhost:5173` and works standalone with in-browser ML.
4. The backend runs at `http://localhost:8000` with Swagger docs at `/docs`.

## Security Checklist

- [ ] No secrets in frontend env vars
- [ ] Service-role key only in backend
- [ ] CORS origins configured correctly
- [ ] RLS enabled on all tables
- [ ] File upload size limits enforced (5 MB)
- [ ] Input validation on all API endpoints
- [ ] No PII in synthetic demo data
