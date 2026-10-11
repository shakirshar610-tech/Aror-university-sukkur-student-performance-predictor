/*
# Create tasks, notifications, attendance_records, academic_events tables

## Overview
Adds four new tables to support the ASPP upgrade: task/assignment management,
a notification center, attendance tracking by course, and academic calendar events.
This is a single-tenant app (no auth) so all policies use anon+authenticated.

## New Tables

### 1. tasks
- Stores student tasks, assignments, quizzes, exams, projects, and deadlines.
- Fields: title, description, course_code, course_title, category, deadline,
  priority, status, marks_obtained, marks_max, weight, reminder_enabled,
  reminder_intervals, completed_at, created_at, updated_at.

### 2. notifications
- Stores in-app notifications generated from task deadlines and system events.
- Fields: title, message, category, priority, task_id, read, read_at,
  created_at, action_url.

### 3. attendance_records
- Stores per-course attendance entries (classes held vs attended).
- Fields: course_code, course_title, semester, classes_held, classes_attended,
  date, created_at, updated_at.

### 4. academic_events
- Stores calendar events: classes, exams, study sessions, personal events.
- Fields: title, description, course_code, event_type, start_date, end_date,
  all_day, location, color, created_by, created_at, updated_at.

## Security
- RLS enabled on all tables.
- All tables use TO anon, authenticated with USING (true) / WITH CHECK (true)
  because this is a single-tenant no-auth app with intentionally shared data.
*/

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  course_code text,
  course_title text,
  category text NOT NULL DEFAULT 'assignment',
  deadline timestamptz,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'upcoming',
  marks_obtained numeric,
  marks_max numeric,
  weight numeric,
  reminder_enabled boolean NOT NULL DEFAULT true,
  reminder_intervals jsonb NOT NULL DEFAULT '[7, 3, 1]'::jsonb,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
CREATE POLICY "anon_select_tasks" ON tasks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
CREATE POLICY "anon_insert_tasks" ON tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
CREATE POLICY "anon_update_tasks" ON tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "anon_delete_tasks" ON tasks FOR DELETE
  TO anon, authenticated USING (true);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  category text NOT NULL DEFAULT 'task',
  priority text NOT NULL DEFAULT 'medium',
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  action_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE
  TO anon, authenticated USING (true);

-- Attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text NOT NULL,
  course_title text,
  semester integer NOT NULL DEFAULT 1,
  classes_held integer NOT NULL DEFAULT 0,
  classes_attended integer NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_attendance" ON attendance_records;
CREATE POLICY "anon_select_attendance" ON attendance_records FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_attendance" ON attendance_records;
CREATE POLICY "anon_insert_attendance" ON attendance_records FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_attendance" ON attendance_records;
CREATE POLICY "anon_update_attendance" ON attendance_records FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_attendance" ON attendance_records;
CREATE POLICY "anon_delete_attendance" ON attendance_records FOR DELETE
  TO anon, authenticated USING (true);

-- Academic events table
CREATE TABLE IF NOT EXISTS academic_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  course_code text,
  event_type text NOT NULL DEFAULT 'study',
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  all_day boolean NOT NULL DEFAULT false,
  location text,
  color text NOT NULL DEFAULT 'hsl(230, 55%, 50%)',
  created_by text NOT NULL DEFAULT 'student',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE academic_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_events" ON academic_events;
CREATE POLICY "anon_select_events" ON academic_events FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_events" ON academic_events;
CREATE POLICY "anon_insert_events" ON academic_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_events" ON academic_events;
CREATE POLICY "anon_update_events" ON academic_events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_events" ON academic_events;
CREATE POLICY "anon_delete_events" ON academic_events FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_course ON attendance_records(course_code);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON academic_events(start_date);
