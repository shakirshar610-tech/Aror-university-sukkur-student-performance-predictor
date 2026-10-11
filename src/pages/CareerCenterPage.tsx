import { useState, useEffect } from 'react'
import {
  Briefcase, Code2, GraduationCap, Target, TrendingUp,
  CheckCircle2, Circle, ExternalLink, Award, FileText, Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/Skeleton'
import { careerTracks } from '@/services/portfolioService'

const SKILL_STORAGE_KEY = 'aspp_career_skills'

function readSkills(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(SKILL_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, boolean>
  } catch {
    return {}
  }
}

function writeSkills(skills: Record<string, boolean>) {
  try {
    localStorage.setItem(SKILL_STORAGE_KEY, JSON.stringify(skills))
  } catch { /* ignore */ }
}

const careerResources = [
  { title: 'Python Documentation', url: 'https://docs.python.org/3/', category: 'Python' },
  { title: 'Scikit-learn Tutorials', url: 'https://scikit-learn.org/stable/tutorial/index.html', category: 'Machine Learning' },
  { title: 'Keras Guide', url: 'https://keras.io/guides/', category: 'Deep Learning' },
  { title: 'TensorFlow Tutorials', url: 'https://www.tensorflow.org/tutorials', category: 'Deep Learning' },
  { title: 'OpenCV Documentation', url: 'https://docs.opencv.org/', category: 'Computer Vision' },
  { title: 'Hugging Face Course', url: 'https://huggingface.co/course', category: 'NLP' },
  { title: 'Pandas Documentation', url: 'https://pandas.pydata.org/docs/', category: 'Data Analysis' },
  { title: 'MLflow Documentation', url: 'https://mlflow.org/docs/latest/index.html', category: 'MLOps' },
]

const interviewTips = [
  'Practice coding problems on platforms like LeetCode or HackerRank regularly.',
  'Review your projects thoroughly — be ready to explain your design decisions and trade-offs.',
  'Study common ML/AI interview questions: bias-variance tradeoff, overfitting, evaluation metrics.',
  'Prepare a concise portfolio pitch highlighting 2-3 key projects with measurable outcomes.',
  'Review fundamental concepts: data structures, algorithms, time/space complexity.',
  'Be ready to discuss your Final Year Project and its real-world applications.',
]

export function CareerCenterPage() {
  const [skills, setSkills] = useState<Record<string, boolean>>({})
  const [selectedTrack, setSelectedTrack] = useState(careerTracks[0].id)

  useEffect(() => {
    setSkills(readSkills())
  }, [])

  const toggleSkill = (skillKey: string) => {
    const updated = { ...skills, [skillKey]: !skills[skillKey] }
    setSkills(updated)
    writeSkills(updated)
  }

  const currentTrack = careerTracks.find((t) => t.id === selectedTrack) || careerTracks[0]

  const trackProgress = (trackId: string) => {
    const track = careerTracks.find((t) => t.id === trackId)
    if (!track) return 0
    const trackSkills = track.skills.map((s) => `${trackId}:${s}`)
    const completed = trackSkills.filter((k) => skills[k]).length
    return (completed / track.skills.length) * 100
  }

  const overallProgress = () => {
    const allSkills = careerTracks.flatMap((t) => t.skills.map((s) => `${t.id}:${s}`))
    const completed = allSkills.filter((k) => skills[k]).length
    return (completed / allSkills.length) * 100
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Briefcase size={20} className="text-primary-500" />
          Career & Skill Development
        </h2>
        <p className="text-sm text-muted-foreground">Connect your coursework with career goals in AI and computer science</p>
      </div>

      {/* Overall progress */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><Target size={18} className="text-primary-500" /><p className="text-xs text-muted-foreground">Overall Progress</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{overallProgress().toFixed(0)}%</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><Code2 size={18} className="text-secondary" /><p className="text-xs text-muted-foreground">Career Tracks</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{careerTracks.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-success" /><p className="text-xs text-muted-foreground">Skills Completed</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">
            {Object.values(skills).filter(Boolean).length}
          </p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={18} className="text-accent" /><p className="text-xs text-muted-foreground">Total Skills</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">
            {careerTracks.reduce((s, t) => s + t.skills.length, 0)}
          </p>
        </CardContent></Card>
      </div>

      {/* Career tracks */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Tracks for AI Students</CardTitle>
          <CardDescription>Follow a structured path from fundamentals to advanced AI skills</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Track selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {careerTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedTrack === track.id ? 'bg-primary-500 text-white' : 'bg-card border border-border text-muted-foreground hover:bg-muted'}`}
              >
                {track.name}
              </button>
            ))}
          </div>

          {/* Track progress bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-muted-foreground">{currentTrack.name} — {currentTrack.level}</span>
              <span className="text-sm font-medium tabular-nums">{trackProgress(currentTrack.id).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary-500 h-full transition-all duration-300"
                style={{ width: `${trackProgress(currentTrack.id)}%` }}
              />
            </div>
          </div>

          {/* Skills checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentTrack.skills.map((skill) => {
              const skillKey = `${currentTrack.id}:${skill}`
              const isCompleted = skills[skillKey] || false
              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skillKey)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors text-left text-sm"
                >
                  {isCompleted
                    ? <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                    : <Circle size={18} className="text-muted-foreground flex-shrink-0" />}
                  <span className={isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}>
                    {skill}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Career preparation guides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText size={18} className="text-secondary" /> CV & Resume Preparation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-success mt-0.5 flex-shrink-0" /> Highlight relevant coursework and academic projects</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-success mt-0.5 flex-shrink-0" /> Include programming languages, frameworks, and tools</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-success mt-0.5 flex-shrink-0" /> Quantify achievements with measurable outcomes</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-success mt-0.5 flex-shrink-0" /> Add GitHub profile and project links</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="text-success mt-0.5 flex-shrink-0" /> Keep it concise — 1-2 pages maximum</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users size={18} className="text-accent" /> Interview Preparation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {interviewTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-success mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Learning resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><GraduationCap size={18} className="text-primary-500" /> Recommended Learning Resources</CardTitle>
          <CardDescription>Official documentation and tutorials for AI/ML skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {careerResources.map((res) => (
              <a
                key={res.url}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary-300 hover:bg-muted/30 transition-colors text-sm group"
              >
                <div>
                  <p className="font-medium text-foreground">{res.title}</p>
                  <p className="text-xs text-muted-foreground">{res.category}</p>
                </div>
                <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary-500" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Award size={14} className="flex-shrink-0 mt-0.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Career tracks and resources are learning suggestions for AI students, not guaranteed
              employment outcomes. Always verify external resources before relying on them. Your
              skill progress is stored locally in your browser.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
