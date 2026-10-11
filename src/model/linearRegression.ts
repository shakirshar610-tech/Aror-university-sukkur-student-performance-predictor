import type {
  StudentRecord,
  PredictionInput,
  TrainedModel,
  ModelWeights,
  ModelMetrics,
  PredictionResult,
  FeatureImportance,
} from '../types'
import { trainingData } from '../data/studentData'

const MODEL_VERSION = '1.0.0'
const ALGORITHM = 'Linear Regression (Ordinary Least Squares)'
const TEST_SIZE = 0.2
const RANDOM_STATE = 42

function transpose(m: number[][]): number[][] {
  return m[0].map((_, col) => m.map((row) => row[col]))
}

function matMul(a: number[][], b: number[][]): number[][] {
  const rowsA = a.length
  const colsB = b[0].length
  const colsA = a[0].length
  const result: number[][] = Array.from({ length: rowsA }, () =>
    Array.from({ length: colsB }, () => 0),
  )
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += a[i][k] * b[k][j]
      }
    }
  }
  return result
}

function matVecMul(m: number[][], v: number[]): number[] {
  return m.map((row) => row.reduce((sum, val, i) => sum + val * v[i], 0))
}

function invertMatrix(m: number[][]): number[][] {
  const n = m.length
  const aug = m.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ])

  for (let col = 0; col < n; col++) {
    let pivotRow = col
    let maxVal = Math.abs(aug[col][col])
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(aug[r][col]) > maxVal) {
        maxVal = Math.abs(aug[r][col])
        pivotRow = r
      }
    }
    if (maxVal < 1e-12) throw new Error('Matrix is singular and cannot be inverted')
    ;[aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]]
    const pivot = aug[col][col]
    for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const factor = aug[r][col]
      for (let j = 0; j < 2 * n; j++) aug[r][j] -= factor * aug[col][j]
    }
  }
  return aug.map((row) => row.slice(n))
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function meanAbsoluteError(actual: number[], predicted: number[]): number {
  return mean(actual.map((a, i) => Math.abs(a - predicted[i])))
}

function rootMeanSquaredError(actual: number[], predicted: number[]): number {
  return Math.sqrt(mean(actual.map((a, i) => (a - predicted[i]) ** 2)))
}

function rSquared(actual: number[], predicted: number[]): number {
  const avg = mean(actual)
  const ssRes = actual.reduce((sum, y, i) => sum + (y - predicted[i]) ** 2, 0)
  const ssTot = actual.reduce((sum, y) => sum + (y - avg) ** 2, 0)
  return ssTot === 0 ? 1 : 1 - ssRes / ssTot
}

function designMatrix(rows: StudentRecord[]): number[][] {
  return rows.map((r) => [1, r.study_hours, r.attendance, r.previous_score])
}

function targetVector(rows: StudentRecord[]): number[] {
  return rows.map((r) => r.final_score)
}

// Seeded shuffle for reproducibility (equivalent to sklearn's random_state)
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  let s = seed
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function trainModel(data: StudentRecord[] = trainingData): TrainedModel {
  const shuffled = seededShuffle(data, RANDOM_STATE)
  const splitIdx = Math.floor(shuffled.length * (1 - TEST_SIZE))
  const train = shuffled.slice(0, splitIdx)
  const test = shuffled.slice(splitIdx)

  const X = designMatrix(train)
  const y = targetVector(train)
  const Xt = transpose(X)
  const XtX = matMul(Xt, X)
  const Xty = matVecMul(Xt, y)
  const XtX_inv = invertMatrix(XtX)
  const weightsArr = matVecMul(XtX_inv, Xty)

  const weights: ModelWeights = {
    bias: weightsArr[0],
    study_hours: weightsArr[1],
    attendance: weightsArr[2],
    previous_score: weightsArr[3],
  }

  // Evaluate on test set
  const XTest = designMatrix(test)
  const yTest = targetVector(test)
  const testPreds = matVecMul(XTest, weightsArr)
  const testMetrics: ModelMetrics = {
    mae: meanAbsoluteError(yTest, testPreds),
    rmse: rootMeanSquaredError(yTest, testPreds),
    r2: rSquared(yTest, testPreds),
    trainSize: train.length,
    testSize: test.length,
  }

  // Train set predictions for residual analysis
  const trainPreds = matVecMul(X, weightsArr)

  const residuals = test.map((row, i) => ({
    predicted: testPreds[i],
    actual: yTest[i],
    residual: yTest[i] - testPreds[i],
  }))

  const testPredictions = test.map((row, i) => ({
    predicted: testPreds[i],
    actual: yTest[i],
  }))

  const trainPredictions = train.map((row, i) => ({
    predicted: trainPreds[i],
    actual: y[i],
  }))

  return {
    weights,
    metrics: testMetrics,
    featureNames: ['study_hours', 'attendance', 'previous_score'],
    targetName: 'final_score',
    algorithm: ALGORITHM,
    version: MODEL_VERSION,
    trainedAt: new Date().toISOString(),
    residuals,
    testPredictions,
    trainPredictions,
  }
}

export function predictRaw(model: TrainedModel, input: PredictionInput): number {
  const { bias, study_hours, attendance, previous_score } = model.weights
  return (
    bias +
    study_hours * input.study_hours +
    attendance * input.attendance +
    previous_score * input.previous_score
  )
}

export function predict(model: TrainedModel, input: PredictionInput): PredictionResult {
  const raw = predictRaw(model, input)
  const clamped = Math.max(0, Math.min(100, raw))
  return {
    predicted_score: clamped,
    raw_predicted_score: raw,
    model_version: model.version,
    timestamp: new Date().toISOString(),
    contributions: {
      bias: model.weights.bias,
      study_hours: model.weights.study_hours * input.study_hours,
      attendance: model.weights.attendance * input.attendance,
      previous_score: model.weights.previous_score * input.previous_score,
    },
  }
}

export function getFeatureImportance(model: TrainedModel): FeatureImportance[] {
  const w = model.weights
  const items = [
    { feature: 'study_hours', label: 'Study Hours', weight: Math.abs(w.study_hours), color: 'hsl(230, 55%, 50%)' },
    { feature: 'attendance', label: 'Attendance', weight: Math.abs(w.attendance), color: 'hsl(172, 70%, 40%)' },
    { feature: 'previous_score', label: 'Previous Score', weight: Math.abs(w.previous_score), color: 'hsl(32, 95%, 50%)' },
  ]
  const maxW = Math.max(...items.map((i) => i.weight))
  return items.map((i) => ({
    ...i,
    normalizedWeight: maxW > 0 ? (i.weight / maxW) * 100 : 0,
  }))
}

import { gradeScale, getGradeForPercentage } from '@/config/university'

export function getGrade(score: number): { letter: string; label: string; color: string; gradePoint: number } {
  const boundary = getGradeForPercentage(score)
  if (!boundary) return { letter: 'F', label: 'Fail', color: 'hsl(0, 84%, 60%)', gradePoint: 0 }
  // Color mapping based on grade letter
  const colorMap: Record<string, string> = {
    'A+': 'hsl(142, 71%, 45%)',
    'A': 'hsl(142, 71%, 45%)',
    'A-': 'hsl(142, 65%, 42%)',
    'B+': 'hsl(172, 70%, 40%)',
    'B': 'hsl(172, 65%, 38%)',
    'B-': 'hsl(190, 60%, 42%)',
    'C+': 'hsl(200, 55%, 45%)',
    'C': 'hsl(38, 92%, 50%)',
    'C-': 'hsl(38, 85%, 48%)',
    'D': 'hsl(25, 90%, 55%)',
    'D-': 'hsl(20, 88%, 53%)',
    'F': 'hsl(0, 84%, 60%)',
  }
  return {
    letter: boundary.letter,
    label: boundary.label,
    color: colorMap[boundary.letter] || 'hsl(0, 84%, 60%)',
    gradePoint: boundary.gradePoint,
  }
}

export function validateInput(input: PredictionInput): string[] {
  const errors: string[] = []
  if (input.study_hours < 0 || input.study_hours > 24) {
    errors.push('Study hours must be between 0 and 24')
  }
  if (isNaN(input.study_hours) || !isFinite(input.study_hours)) {
    errors.push('Study hours must be a valid number')
  }
  if (input.attendance < 0 || input.attendance > 100) {
    errors.push('Attendance must be between 0 and 100')
  }
  if (isNaN(input.attendance) || !isFinite(input.attendance)) {
    errors.push('Attendance must be a valid number')
  }
  if (input.previous_score < 0 || input.previous_score > 100) {
    errors.push('Previous score must be between 0 and 100')
  }
  if (isNaN(input.previous_score) || !isFinite(input.previous_score)) {
    errors.push('Previous score must be a valid number')
  }
  return errors
}

export function validateDataset(records: StudentRecord[]): {
  valid: boolean
  errors: string[]
  warnings: string[]
  stats: {
    rowCount: number
    missingValues: number
    invalidRanges: number
    duplicates: number
  }
} {
  const errors: string[] = []
  const warnings: string[] = []
  let missingValues = 0
  let invalidRanges = 0
  const seen = new Set<string>()
  let duplicates = 0

  for (const r of records) {
    if (isNaN(r.study_hours) || isNaN(r.attendance) || isNaN(r.previous_score) || isNaN(r.final_score)) {
      missingValues++
    }
    if (r.study_hours < 0 || r.study_hours > 24) invalidRanges++
    if (r.attendance < 0 || r.attendance > 100) invalidRanges++
    if (r.previous_score < 0 || r.previous_score > 100) invalidRanges++
    if (r.final_score < 0 || r.final_score > 100) invalidRanges++
    const key = `${r.study_hours},${r.attendance},${r.previous_score},${r.final_score}`
    if (seen.has(key)) duplicates++
    else seen.add(key)
  }

  if (records.length === 0) errors.push('Dataset contains no valid records')
  if (records.length < 10) warnings.push('Dataset is very small for reliable model training')

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: { rowCount: records.length, missingValues, invalidRanges, duplicates },
  }
}

export function descriptiveStats(records: StudentRecord[]) {
  const cols = ['study_hours', 'attendance', 'previous_score', 'final_score'] as const
  return cols.map((col) => {
    const vals = records.map((r) => r[col]).sort((a, b) => a - b)
    const n = vals.length
    const avg = mean(vals)
    const min = vals[0]
    const max = vals[n - 1]
    const median = n % 2 === 0 ? (vals[n / 2 - 1] + vals[n / 2]) / 2 : vals[Math.floor(n / 2)]
    const std = Math.sqrt(mean(vals.map((v) => (v - avg) ** 2)))
    return { column: col, count: n, mean: avg, median, std, min, max }
  })
}
