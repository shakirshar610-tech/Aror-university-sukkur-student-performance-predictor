import { supabase } from '@/lib/supabase'
import type { ModelVersion } from '@/types'

export async function saveModelVersion(input: {
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
}): Promise<ModelVersion | null> {
  if (!supabase) return null
  // Check if version already exists
  const { data: existing } = await supabase
    .from('model_versions')
    .select('id')
    .eq('version', input.version)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('model_versions')
      .update({
        algorithm: input.algorithm,
        training_dataset_identifier: input.training_dataset_identifier,
        training_date: input.training_date,
        feature_schema: input.feature_schema,
        mae: input.mae,
        rmse: input.rmse,
        r2_score: input.r2_score,
        train_size: input.train_size,
        test_size: input.test_size,
        coefficients: input.coefficients,
      })
      .eq('version', input.version)
      .select()
      .single()
    if (error) return null
    return data as ModelVersion
  }

  const { data, error } = await supabase
    .from('model_versions')
    .insert({
      version: input.version,
      algorithm: input.algorithm,
      training_dataset_identifier: input.training_dataset_identifier,
      training_date: input.training_date,
      feature_schema: input.feature_schema,
      mae: input.mae,
      rmse: input.rmse,
      r2_score: input.r2_score,
      train_size: input.train_size,
      test_size: input.test_size,
      coefficients: input.coefficients,
    })
    .select()
    .single()
  if (error) return null
  return data as ModelVersion
}

export async function fetchModelVersions(): Promise<ModelVersion[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('model_versions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return (data || []) as ModelVersion[]
}
