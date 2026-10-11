import { supabase } from '@/lib/supabase'
import type { DatasetMeta } from '@/types'

export async function saveDatasetMeta(input: {
  filename: string
  row_count: number
  validation_status: string
}): Promise<DatasetMeta | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('dataset_metadata')
    .insert({
      filename: input.filename,
      row_count: input.row_count,
      validation_status: input.validation_status,
    })
    .select()
    .single()
  if (error) return null
  return data as DatasetMeta
}

export async function fetchDatasetMetadata(): Promise<DatasetMeta[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('dataset_metadata')
    .select('*')
    .order('uploaded_at', { ascending: false })
  if (error) return []
  return (data || []) as DatasetMeta[]
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers?: string[],
): void {
  if (data.length === 0) return
  const cols = headers || Object.keys(data[0])
  const rows = data.map((row) =>
    cols.map((col) => {
      const val = row[col]
      if (val === null || val === undefined) return ''
      return typeof val === 'string' && val.includes(',')
        ? `"${val.replace(/"/g, '""')}"`
        : String(val)
    }).join(','),
  )
  const csv = [cols.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
