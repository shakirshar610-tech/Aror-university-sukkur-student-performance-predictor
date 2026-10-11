import { useState, useMemo } from 'react'
import {
  Search,
  Trash2,
  Download,
  Eye,
  History,
  Calendar,
  Filter,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import { deletePrediction } from '@/services/predictionService'
import { exportToCSV } from '@/services/datasetService'
import { formatScore, formatDate, formatNumber } from '@/lib/utils'
import type { PredictionRecord } from '@/types'

interface PageProps {
  predictions: PredictionRecord[]
  setPredictions: React.Dispatch<React.SetStateAction<PredictionRecord[]>>
}

const ITEMS_PER_PAGE = 10

export function HistoryPage({ predictions, setPredictions }: PageProps) {
  const { addToast } = useToast()
  const [search, setSearch] = useState('')
  const [scoreMin, setScoreMin] = useState('')
  const [scoreMax, setScoreMax] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [viewTarget, setViewTarget] = useState<PredictionRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PredictionRecord | null>(null)

  const filtered = useMemo(() => {
    let result = [...predictions]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          (p.student?.student_name || 'anonymous').toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q),
      )
    }
    if (scoreMin !== '') {
      const min = parseFloat(scoreMin)
      if (!isNaN(min)) result = result.filter((p) => p.predicted_score >= min)
    }
    if (scoreMax !== '') {
      const max = parseFloat(scoreMax)
      if (!isNaN(max)) result = result.filter((p) => p.predicted_score <= max)
    }
    if (dateFrom) {
      result = result.filter((p) => p.created_at >= dateFrom)
    }
    if (dateTo) {
      result = result.filter((p) => p.created_at <= dateTo + 'T23:59:59')
    }
    return result
  }, [predictions, search, scoreMin, scoreMax, dateFrom, dateTo])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deletePrediction(deleteTarget.id)
      setPredictions((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      addToast('success', 'Prediction deleted')
      setDeleteTarget(null)
    } catch (err) {
      addToast('error', 'Failed to delete', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleExport = () => {
    if (filtered.length === 0) {
      addToast('warning', 'No data to export')
      return
    }
    const csvData = filtered.map((p) => ({
      id: p.id,
      student: p.student?.student_name || 'Anonymous',
      study_hours: p.study_hours,
      attendance: p.attendance,
      previous_score: p.previous_score,
      predicted_score: formatNumber(p.predicted_score, 2),
      model_version: p.model_version,
      created_at: p.created_at,
    }))
    exportToCSV(csvData, 'prediction_history.csv')
    addToast('success', 'Export complete', `${filtered.length} records exported to CSV`)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by student name or prediction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={16} />}
            />
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download size={16} />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Filter size={14} /> Filters:
          </div>
          <div className="flex items-center gap-1">
            <Input
              placeholder="Min Score"
              type="number"
              value={scoreMin}
              onChange={(e) => setScoreMin(e.target.value)}
              className="w-24"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              placeholder="Max Score"
              type="number"
              value={scoreMax}
              onChange={(e) => setScoreMax(e.target.value)}
              className="w-24"
            />
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-muted-foreground" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-36"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-36"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<History size={20} />}
            title="No predictions found"
            description={search || scoreMin || scoreMax || dateFrom || dateTo ? "Try adjusting your filters." : "Make your first prediction to see it here."}
          />
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Prediction ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Study Hours</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Attendance</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Prev Score</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Predicted</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Version</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                        {p.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {p.student?.student_name || 'Anonymous'}
                      </td>
                      <td className="text-right py-3 px-4 tabular-nums">{p.study_hours}h</td>
                      <td className="text-right py-3 px-4 tabular-nums">{p.attendance}%</td>
                      <td className="text-right py-3 px-4 tabular-nums">{p.previous_score}</td>
                      <td className="text-right py-3 px-4 font-display font-bold text-primary-500 tabular-nums">
                        {formatScore(p.predicted_score)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">v{p.model_version}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{formatDate(p.created_at)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewTarget(p)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        )}
      </Card>

      {/* View Modal */}
      <Modal
        open={viewTarget !== null}
        onClose={() => setViewTarget(null)}
        title="Prediction Details"
      >
        {viewTarget && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Prediction ID</p>
                <p className="text-sm font-mono">{viewTarget.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Student</p>
                <p className="text-sm font-medium">{viewTarget.student?.student_name || 'Anonymous'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Study Hours</p>
                <p className="text-sm font-medium">{viewTarget.study_hours} hrs/day</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Attendance</p>
                <p className="text-sm font-medium">{viewTarget.attendance}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Previous Score</p>
                <p className="text-sm font-medium">{viewTarget.previous_score}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Predicted Score</p>
                <p className="text-sm font-display font-bold text-primary-500">{formatScore(viewTarget.predicted_score)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Model Version</p>
                <p className="text-sm font-medium">v{viewTarget.model_version}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Timestamp</p>
                <p className="text-sm font-medium">{formatDate(viewTarget.created_at)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Prediction"
        message="Are you sure you want to delete this prediction record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
