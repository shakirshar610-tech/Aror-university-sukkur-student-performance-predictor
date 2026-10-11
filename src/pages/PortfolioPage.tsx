import { useState, useEffect, useMemo } from 'react'
import {
  Plus, Trash2, FolderOpen, Award, Briefcase, FlaskConical,
  Trophy, Heart, Wrench, GraduationCap, Star, Link as LinkIcon, Lock, Eye,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import {
  fetchPortfolio, createPortfolioItem, deletePortfolioItem,
  portfolioCategories, type PortfolioItem,
} from '@/services/portfolioService'
import { formatDate } from '@/lib/utils'

const CATEGORY_ICONS: Record<string, typeof FolderOpen> = {
  project: FolderOpen,
  certificate: Award,
  skill: Star,
  workshop: Wrench,
  competition: Trophy,
  volunteer: Heart,
  internship: Briefcase,
  research: FlaskConical,
  achievement: Trophy,
  milestone: GraduationCap,
}

const CATEGORY_COLORS: Record<string, string> = {
  project: 'hsl(230, 55%, 50%)',
  certificate: 'hsl(142, 71%, 45%)',
  skill: 'hsl(32, 95%, 50%)',
  workshop: 'hsl(172, 70%, 40%)',
  competition: 'hsl(280, 60%, 55%)',
  volunteer: 'hsl(340, 75%, 55%)',
  internship: 'hsl(200, 55%, 45%)',
  research: 'hsl(260, 60%, 50%)',
  achievement: 'hsl(48, 96%, 50%)',
  milestone: 'hsl(180, 55%, 40%)',
}

export function PortfolioPage() {
  const { addToast } = useToast()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null)
  const [filterCategory, setFilterCategory] = useState('')
  const [showPrivate, setShowPrivate] = useState(true)

  // Form
  const [fTitle, setFTitle] = useState('')
  const [fDescription, setFDescription] = useState('')
  const [fCategory, setFCategory] = useState('project')
  const [fDate, setFDate] = useState('')
  const [fLink, setFLink] = useState('')
  const [fIsPrivate, setFIsPrivate] = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await fetchPortfolio()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let result = [...items]
    if (filterCategory) result = result.filter((i) => i.category === filterCategory)
    if (!showPrivate) result = result.filter((i) => !i.is_private)
    return result
  }, [items, filterCategory, showPrivate])

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of items) {
      counts.set(item.category, (counts.get(item.category) || 0) + 1)
    }
    return counts
  }, [items])

  const handleAdd = async () => {
    if (!fTitle.trim()) { addToast('error', 'Title required'); return }
    try {
      await createPortfolioItem({
        title: fTitle.trim(),
        description: fDescription.trim() || undefined,
        category: fCategory,
        date: fDate || undefined,
        link: fLink.trim() || undefined,
        is_private: fIsPrivate,
      })
      addToast('success', 'Portfolio item added', `"${fTitle}" has been added to your portfolio.`)
      resetForm(); setShowModal(false); load()
    } catch (err) {
      addToast('error', 'Failed to add item', err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const resetForm = () => {
    setFTitle(''); setFDescription(''); setFCategory('project')
    setFDate(''); setFLink(''); setFIsPrivate(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deletePortfolioItem(deleteTarget.id)
      addToast('success', 'Portfolio item deleted')
      setDeleteTarget(null); load()
    } catch (err) {
      addToast('error', 'Failed to delete item')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <FolderOpen size={20} className="text-primary-500" />
            Academic Portfolio
          </h2>
          <p className="text-sm text-muted-foreground">Showcase your projects, achievements, and skills</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowModal(true) }}><Plus size={14} /> Add Item</Button>
      </div>

      {/* Category stats */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCategory('')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!filterCategory ? 'bg-primary-500 text-white' : 'bg-card border border-border text-muted-foreground hover:bg-muted'}`}
        >
          All ({items.length})
        </button>
        {portfolioCategories.map(c => {
          const count = categoryCounts.get(c.value) || 0
          if (count === 0) return null
          return (
            <button
              key={c.value}
              onClick={() => setFilterCategory(c.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterCategory === c.value ? 'bg-primary-500 text-white' : 'bg-card border border-border text-muted-foreground hover:bg-muted'}`}
            >
              {c.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Privacy toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPrivate(!showPrivate)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          {showPrivate ? <Eye size={16} /> : <Lock size={16} />}
          {showPrivate ? 'Showing all items' : 'Hiding private items'}
        </button>
      </div>

      {/* Portfolio grid */}
      {loading ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading portfolio...</CardContent></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderOpen size={20} />}
            title="Your portfolio is empty"
            description="Add projects, certificates, skills, workshops, competitions, and achievements to build your academic portfolio for internship and career applications."
            action={<Button size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> Add Item</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const Icon = CATEGORY_ICONS[item.category] || FolderOpen
            const color = CATEGORY_COLORS[item.category] || 'hsl(230, 55%, 50%)'
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                      <Icon size={20} style={{ color }} />
                    </div>
                    <div className="flex items-center gap-1">
                      {item.is_private && <Lock size={14} className="text-muted-foreground" />}
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium text-sm text-foreground mb-1">{item.title}</h3>
                  <Badge variant="info" className="mb-2">{portfolioCategories.find(c => c.value === item.category)?.label || item.category}</Badge>
                  {item.description && <p className="text-xs text-muted-foreground mb-2">{item.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                    {item.date && <span>{formatDate(item.date)}</span>}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-500 hover:underline">
                        <LinkIcon size={11} /> Link
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            Private items are only visible to you. Your portfolio is not published publicly unless
            you explicitly share it. Do not upload sensitive personal information or copyrighted
            materials without permission.
          </p>
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); resetForm() }} title="Add Portfolio Item">
        <div className="space-y-4">
          <Input label="Title" placeholder="e.g., Machine Learning Image Classifier" value={fTitle} onChange={(e) => setFTitle(e.target.value)} error={!fTitle.trim() ? 'Required' : undefined} />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
            <select className="w-full px-3 py-2 rounded-md border border-input bg-card text-sm text-foreground" value={fCategory} onChange={(e) => setFCategory(e.target.value)}>
              {portfolioCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <Input label="Description (optional)" placeholder="Brief description of the achievement or project" value={fDescription} onChange={(e) => setFDescription(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
            <Input label="Link (optional)" placeholder="https://..." value={fLink} onChange={(e) => setFLink(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPrivate" checked={fIsPrivate} onChange={(e) => setFIsPrivate(e.target.checked)} className="rounded" />
            <label htmlFor="isPrivate" className="text-sm text-foreground flex items-center gap-1">
              <Lock size={12} /> Keep this item private
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setShowModal(false); resetForm() }}>Cancel</Button>
            <Button size="sm" onClick={handleAdd}>Add to Portfolio</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteTarget !== null} title="Delete Portfolio Item" message={`Delete "${deleteTarget?.title}"?`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
