/*
# Create grade_records, study_sessions, quiz_attempts, portfolio_items tables

## Overview
Adds four new tables to support the ASPP enhancement: grade tracking for GPA calculation,
study session logging, quiz practice attempts, and student portfolio items.
Single-tenant app (no auth) so all policies use anon+authenticated.

## New Tables

### 1. grade_records
- Stores per-course assessment marks for grade calculation and GPA simulation.
- Fields: course_code, course_title, credit_hours, semester, assessment_type,
  marks_obtained, marks_max, weight, is_verified, created_at, updated_at.

### 2. study_sessions
- Logs completed study sessions for study time tracking and analytics.
- Fields: course_code, topic, planned_minutes, actual_minutes, session_date,
  completed, notes, created_at, updated_at.

### 3. quiz_attempts
- Stores quiz practice attempts with questions, answers, and scores.
- Fields: topic, question_type, question, options, correct_answer, user_answer,
  is_correct, difficulty, created_at.

### 4. portfolio_items
- Stores portfolio entries: projects, certificates, skills, achievements.
- Fields: title, description, category, date, link, is_private, created_at, updated_at.
*/

-- Grade records table
CREATE TABLE IF NOT EXISTS grade_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text NOT NULL,
  course_title text,
  credit_hours integer NOT NULL DEFAULT 3,
  semester integer NOT NULL DEFAULT 1,
  assessment_type text NOT NULL DEFAULT 'sessional',
  marks_obtained numeric NOT NULL DEFAULT 0,
  marks_max numeric NOT NULL DEFAULT 100,
  weight numeric NOT NULL DEFAULT 30,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE grade_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_grade_records" ON grade_records;
CREATE POLICY "anon_select_grade_records" ON grade_records FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_grade_records" ON grade_records;
CREATE POLICY "anon_insert_grade_records" ON grade_records FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_grade_records" ON grade_records;
CREATE POLICY "anon_update_grade_records" ON grade_records FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_grade_records" ON grade_records;
CREATE POLICY "anon_delete_grade_records" ON grade_records FOR DELETE
  TO anon, authenticated USING (true);

-- Study sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text,
  topic text NOT NULL,
  planned_minutes integer NOT NULL DEFAULT 60,
  actual_minutes integer NOT NULL DEFAULT 0,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_study_sessions" ON study_sessions;
CREATE POLICY "anon_select_study_sessions" ON study_sessions FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_study_sessions" ON study_sessions;
CREATE POLICY "anon_insert_study_sessions" ON study_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_study_sessions" ON study_sessions;
CREATE POLICY "anon_update_study_sessions" ON study_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_study_sessions" ON study_sessions;
CREATE POLICY "anon_delete_study_sessions" ON study_sessions FOR DELETE
  TO anon, authenticated USING (true);

-- Quiz attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  question_type text NOT NULL DEFAULT 'mcq',
  question text NOT NULL,
  options jsonb,
  correct_answer text NOT NULL,
  user_answer text,
  is_correct boolean NOT NULL DEFAULT false,
  difficulty text NOT NULL DEFAULT 'medium',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quiz_attempts" ON quiz_attempts;
CREATE POLICY "anon_select_quiz_attempts" ON quiz_attempts FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_quiz_attempts" ON quiz_attempts;
CREATE POLICY "anon_insert_quiz_attempts" ON quiz_attempts FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_quiz_attempts" ON quiz_attempts;
CREATE POLICY "anon_delete_quiz_attempts" ON quiz_attempts FOR DELETE
  TO anon, authenticated USING (true);

-- Portfolio items table
CREATE TABLE IF NOT EXISTS portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'project',
  date date,
  link text,
  is_private boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_portfolio_items" ON portfolio_items;
CREATE POLICY "anon_select_portfolio_items" ON portfolio_items FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_portfolio_items" ON portfolio_items;
CREATE POLICY "anon_insert_portfolio_items" ON portfolio_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_portfolio_items" ON portfolio_items;
CREATE POLICY "anon_update_portfolio_items" ON portfolio_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_portfolio_items" ON portfolio_items;
CREATE POLICY "anon_delete_portfolio_items" ON portfolio_items FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_grade_records_course ON grade_records(course_code);
CREATE INDEX IF NOT EXISTS idx_grade_records_semester ON grade_records(semester);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_topic ON quiz_attempts(topic);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON portfolio_items(category);
