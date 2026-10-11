import { useMemo } from 'react'
import { trainModel, getFeatureImportance, predict, getGrade } from '@/model/linearRegression'

export function useModel() {
  const model = useMemo(() => trainModel(), [])
  const featureImportance = useMemo(() => getFeatureImportance(model), [model])
  return { model, featureImportance, predict, getGrade }
}
