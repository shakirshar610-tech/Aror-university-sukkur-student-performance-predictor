/*
# Create core tables for Student Performance Predictor

## Overview
Creates the four core tables needed by the academic analytics platform:
- students: Student profiles with optional metadata
- predictions: Every prediction made, with inputs and result
- model_versions: Trained model metadata and metrics
- dataset_metadata: Upload tracking for CSV datasets

## Tables

### students
- id (uuid PK)
- student_name (text, not null)
- student_code (text, unique identifier for the student)
- course (text, course or subject name)
- created_at, updated_at (timestamps)

### predictions
- id (uuid PK)
- student_id (uuid, nullable FK to students, cascade delete)
- study_hours (numeric)
- attendance (numeric)
- previous_score (numeric)
- predicted_score (numeric)
- model_version (text)
- created_at (timestamp)

### model_versions
- id (uuid PK)
- version (text, unique)
- algorithm (text)
- training_dataset_identifier (text)
- training_date (timestamp)
- feature_schema (jsonb)
- mae (numeric)
- rmse (numeric)
- r2_score (numeric)
- train_size (integer)
- test_size (integer)
- coefficients (jsonb)
- created_at (timestamp)

### dataset_metadata
- id (uuid PK)
- filename (text)
- row_count (integer)
- validation_status (text)
- uploaded_at (timestamp)

## Security
- RLS enabled on all tables.
- Single-tenant app with no auth: policies use TO anon, authenticated.
- All CRUD operations allowed for anon + authenticated (data is intentionally shared).
*/

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  student_code text,
  course text DEFAULT 'General',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE
  TO anon, authenticated USING (true);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  study_hours numeric NOT NULL,
  attendance numeric NOT NULL,
  previous_score numeric NOT NULL,
  predicted_score numeric NOT NULL,
  model_version text NOT NULL DEFAULT '1.0.0',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_predictions" ON predictions;
CREATE POLICY "anon_select_predictions" ON predictions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_predictions" ON predictions;
CREATE POLICY "anon_insert_predictions" ON predictions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_predictions" ON predictions;
CREATE POLICY "anon_delete_predictions" ON predictions FOR DELETE
  TO anon, authenticated USING (true);

-- Model versions table
CREATE TABLE IF NOT EXISTS model_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text UNIQUE NOT NULL,
  algorithm text NOT NULL,
  training_dataset_identifier text NOT NULL DEFAULT 'student_data.csv',
  training_date timestamptz DEFAULT now(),
  feature_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  mae numeric,
  rmse numeric,
  r2_score numeric,
  train_size integer,
  test_size integer,
  coefficients jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE model_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_model_versions" ON model_versions;
CREATE POLICY "anon_select_model_versions" ON model_versions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_model_versions" ON model_versions;
CREATE POLICY "anon_insert_model_versions" ON model_versions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Dataset metadata table
CREATE TABLE IF NOT EXISTS dataset_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  row_count integer NOT NULL DEFAULT 0,
  validation_status text NOT NULL DEFAULT 'pending',
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE dataset_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_dataset_metadata" ON dataset_metadata;
CREATE POLICY "anon_select_dataset_metadata" ON dataset_metadata FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_dataset_metadata" ON dataset_metadata;
CREATE POLICY "anon_insert_dataset_metadata" ON dataset_metadata FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_predictions_student_id ON predictions(student_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
CREATE INDEX IF NOT EXISTS idx_students_student_code ON students(student_code);