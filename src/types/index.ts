export interface StudentRecord {
  study_hours: number
  attendance: number
  previous_score: number
  final_score: number
}

export interface PredictionInput {
  study_hours: number
  attendance: number
  previous_score: number
}

export interface PredictionResult {
  predicted_score: number
  raw_predicted_score: number
  model_version: string
  timestamp: string
  contributions: {
    bias: number
    study_hours: number
    attendance: number
    previous_score: number
  }
}

export interface ModelWeights {
  bias: number
  study_hours: number
  attendance: number
  previous_score: number
}

export interface ModelMetrics {
  mae: number
  rmse: number
  r2: number
  trainSize: number
  testSize: number
}

export interface FeatureImportance {
  feature: string
  label: string
  weight: number
  normalizedWeight: number
  color: string
}

export interface TrainedModel {
  weights: ModelWeights
  metrics: ModelMetrics
  featureNames: string[]
  targetName: string
  algorithm: string
  version: string
  trainedAt: string
  residuals: { predicted: number; actual: number; residual: number }[]
  testPredictions: { predicted: number; actual: number }[]
  trainPredictions: { predicted: number; actual: number }[]
}

export interface Student {
  id: string
  student_name: string
  student_code: string
  course: string
  created_at: string
  updated_at: string
}

export interface StudentInput {
  student_name: string
  student_code: string
  course: string
}

export interface PredictionRecord {
  id: string
  student_id: string | null
  study_hours: number
  attendance: number
  previous_score: number
  predicted_score: number
  model_version: string
  created_at: string
  student?: Student | null
}

export interface ModelVersion {
  id: string
  version: string
  algorithm: string
  training_dataset_identifier: string
  training_date: string
  feature_schema: Record<string, unknown>
  mae: number
  rmse: number
  r2_score: number
  train_size: number
  test_size: number
  coefficients: Record<string, number>
  created_at: string
}

export interface DatasetMeta {
  id: string
  filename: string
  row_count: number
  validation_status: string
  uploaded_at: string
}

export type PageId =
  | 'overview'
  | 'predict'
  | 'students'
  | 'history'
  | 'analytics'
  | 'dataset'
  | 'model-performance'
  | 'settings'
  | 'documentation'
  | 'academic-records'
  | 'study-planner'
  | 'tasks'
  | 'calendar'
  | 'notifications'
  | 'attendance'
  | 'reports'
  | 'grade-calculator'
  | 'quiz-practice'
  | 'portfolio'
  | 'career-center'
  | 'departments'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  description?: string
}
