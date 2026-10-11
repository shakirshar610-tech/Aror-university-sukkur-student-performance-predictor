import { useState, useRef, useMemo } from 'react'
import {
  Upload,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  Table2,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/context/ToastContext'
import { trainingData, parseCSV, dataToCSV, csvHeaders } from '@/data/studentData'
import { validateDataset, descriptiveStats } from '@/model/linearRegression'
import { saveDatasetMeta, exportToCSV } from '@/services/datasetService'
import { formatNumber } from '@/lib/utils'
import type { StudentRecord } from '@/types'

export function DatasetPage() {
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedData, setUploadedData] = useState<StudentRecord[] | null>(null)
  const [fileName, setFileName] = useState('')
  const [validation, setValidation] = useState<ReturnType<typeof validateDataset> | null>(null)
  const [previewRows, setPreviewRows] = useState<StudentRecord[]>(trainingData.slice(0, 10))

  const stats = useMemo(() => descriptiveStats(trainingData), [])

  const statsChartData = stats.map((s) => ({
    column: s.column.replace('_', ' '),
    mean: s.mean,
    median: s.median,
  }))

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'File too large', 'Maximum file size is 5 MB')
      return
    }

    if (!file.name.endsWith('.csv')) {
      addToast('error', 'Invalid file type', 'Only CSV files are accepted')
      return
    }

    try {
      const text = await file.text()
      const records = parseCSV(text)
      if (records.length === 0) {
        addToast('error', 'Empty or invalid CSV', 'No valid records found in the file')
        return
      }

      const result = validateDataset(records)
      setUploadedData(records)
      setFileName(file.name)
      setValidation(result)
      setPreviewRows(records.slice(0, 10))

      await saveDatasetMeta({
        filename: file.name,
        row_count: records.length,
        validation_status: result.valid ? 'valid' : 'invalid',
      })

      if (result.valid) {
        addToast('success', 'Dataset uploaded', `${records.length} records validated successfully`)
      } else {
        addToast('warning', 'Dataset has issues', result.errors.join(', '))
      }
    } catch (err) {
      addToast('error', 'Upload failed', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleDownloadTemplate = () => {
    const blob = new Blob([csvHeaders + '\n5,80,70,70\n3,65,60,58\n8,90,78,85'], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sample_student_data_template.csv'
    link.click()
    URL.revokeObjectURL(url)
    addToast('success', 'Template downloaded')
  }

  const handleExportData = () => {
    const data = uploadedData || trainingData
    exportToCSV(data as unknown as Record<string, unknown>[], 'student_data_export.csv')
    addToast('success', 'Data exported', `${data.length} records exported to CSV`)
  }

  const displayData = uploadedData || trainingData
  const displayStats = uploadedData ? descriptiveStats(uploadedData) : stats

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Management</CardTitle>
          <CardDescription>
            Upload, validate, and manage the student performance dataset. Expected columns:
            study_hours, attendance, previous_score, final_score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div
              className="flex-1 border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary-300 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={28} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Click to upload CSV file</p>
              <p className="text-xs text-muted-foreground mt-1">Max 5 MB, CSV format only</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={handleDownloadTemplate}>
                <Download size={16} /> Download Template
              </Button>
              <Button variant="outline" onClick={handleExportData}>
                <FileText size={16} /> Export Current Data
              </Button>
            </div>
          </div>

          {validation && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">File: {fileName}</span>
                {validation.valid ? (
                  <Badge variant="success"><CheckCircle2 size={12} /> Valid</Badge>
                ) : (
                  <Badge variant="error"><XCircle size={12} /> Invalid</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-md bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Row Count</p>
                  <p className="font-display text-lg font-bold">{validation.stats.rowCount}</p>
                </div>
                <div className="p-3 rounded-md bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Missing Values</p>
                  <p className="font-display text-lg font-bold">{validation.stats.missingValues}</p>
                </div>
                <div className="p-3 rounded-md bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Invalid Ranges</p>
                  <p className="font-display text-lg font-bold">{validation.stats.invalidRanges}</p>
                </div>
                <div className="p-3 rounded-md bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Duplicates</p>
                  <p className="font-display text-lg font-bold">{validation.stats.duplicates}</p>
                </div>
              </div>

              {validation.errors.length > 0 && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  {validation.errors.map((e, i) => (
                    <p key={i} className="text-sm text-destructive flex items-center gap-1">
                      <XCircle size={14} /> {e}
                    </p>
                  ))}
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="p-3 rounded-md bg-warning/10 border border-warning/20">
                  {validation.warnings.map((w, i) => (
                    <p key={i} className="text-sm text-warning flex items-center gap-1">
                      <AlertTriangle size={14} /> {w}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Dataset Info */}
      <Card>
        <CardHeader>
          <CardTitle>Current Dataset</CardTitle>
          <CardDescription>
            {uploadedData
              ? `Uploaded: ${fileName} (${uploadedData.length} records)`
              : `Default training dataset (${trainingData.length} records) — synthetic educational data`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Preview Table */}
          <div className="overflow-x-auto scrollbar-thin border border-border rounded-md mb-4">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">#</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Study Hours</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Attendance</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Previous Score</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Final Score</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
                    <td className="text-right py-2 px-3 tabular-nums">{r.study_hours}</td>
                    <td className="text-right py-2 px-3 tabular-nums">{r.attendance}%</td>
                    <td className="text-right py-2 px-3 tabular-nums">{r.previous_score}</td>
                    <td className="text-right py-2 px-3 font-display font-semibold tabular-nums">{r.final_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Showing first {previewRows.length} of {displayData.length} records</p>
        </CardContent>
      </Card>

      {/* Descriptive Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Descriptive Statistics</CardTitle>
          <CardDescription>Summary of each column in the dataset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Column</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Mean</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Median</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Std Dev</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Min</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {displayStats.map((s) => (
                    <tr key={s.column} className="border-b border-border last:border-0">
                      <td className="py-2 px-3 font-medium">{s.column.replace('_', ' ')}</td>
                      <td className="text-right py-2 px-3 tabular-nums">{formatNumber(s.mean)}</td>
                      <td className="text-right py-2 px-3 tabular-nums">{formatNumber(s.median)}</td>
                      <td className="text-right py-2 px-3 tabular-nums">{formatNumber(s.std)}</td>
                      <td className="text-right py-2 px-3 tabular-nums">{formatNumber(s.min)}</td>
                      <td className="text-right py-2 px-3 tabular-nums">{formatNumber(s.max)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statsChartData} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="column" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                <Bar dataKey="mean" fill="hsl(230, 55%, 50%)" name="Mean" radius={[4, 4, 0, 0]} />
                <Bar dataKey="median" fill="hsl(172, 70%, 40%)" name="Median" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 flex gap-2">
          <Database size={16} className="flex-shrink-0 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            The current training dataset contains {trainingData.length} synthetic student records
            designed for educational demonstration. A production model should be trained on
            real, representative data. The target column (final_score) is required for model training.
            Uploaded datasets are validated but do not automatically replace the active training data.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
