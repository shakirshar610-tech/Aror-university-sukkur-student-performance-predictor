import { useState, useEffect, useCallback } from 'react'
import { fetchStudents } from '@/services/studentService'
import { fetchPredictions } from '@/services/predictionService'
import { saveModelVersion } from '@/services/modelService'
import type { Student, PredictionRecord } from '@/types'
import type { TrainedModel } from '@/types'

export function useData(model: TrainedModel) {
  const [students, setStudents] = useState<Student[]>([])
  const [predictions, setPredictions] = useState<PredictionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, p] = await Promise.all([fetchStudents(), fetchPredictions()])
      setStudents(s)
      setPredictions(p)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Save model version to database on first load
  useEffect(() => {
    saveModelVersion({
      version: model.version,
      algorithm: model.algorithm,
      training_dataset_identifier: 'student_data.csv',
      training_date: model.trainedAt,
      feature_schema: { features: model.featureNames, target: model.targetName },
      mae: model.metrics.mae,
      rmse: model.metrics.rmse,
      r2_score: model.metrics.r2,
      train_size: model.metrics.trainSize,
      test_size: model.metrics.testSize,
      coefficients: model.weights as unknown as Record<string, number>,
    })
  }, [model])

  const refresh = useCallback(() => load(), [load])

  return { students, predictions, loading, error, refresh, setStudents, setPredictions }
}
