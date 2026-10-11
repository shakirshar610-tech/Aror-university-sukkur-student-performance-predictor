import { useState, useEffect, useMemo } from 'react'
import {
  Brain, CheckCircle2, XCircle, RotateCcw, Trophy, Clock,
  ChevronRight, Trash2, BookOpen,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import {
  fetchQuizAttempts, createQuizAttempt, clearQuizHistory,
  quizTopics, getQuestionsByTopic, getRandomQuestions,
  type QuizQuestion, type QuizAttempt,
} from '@/services/quizService'
import { formatDate, formatScore } from '@/lib/utils'

type QuizMode = 'select' | 'active' | 'results'

export function QuizPracticePage() {
  const { addToast } = useToast()
  const [mode, setMode] = useState<QuizMode>('select')
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)

  const load = async () => {
    setLoading(true)
    const data = await fetchQuizAttempts()
    setAttempts(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const stats = useMemo(() => {
    const total = attempts.length
    const correct = attempts.filter((a) => a.is_correct).length
    const accuracy = total > 0 ? (correct / total) * 100 : 0
    const byTopic = new Map<string, { total: number; correct: number }>()
    for (const a of attempts) {
      if (!byTopic.has(a.topic)) byTopic.set(a.topic, { total: 0, correct: 0 })
      const t = byTopic.get(a.topic)!
      t.total++
      if (a.is_correct) t.correct++
    }
    const weakTopics = Array.from(byTopic.entries())
      .filter(([, v]) => v.total >= 2 && v.correct / v.total < 0.5)
      .map(([topic, v]) => ({ topic, ...v, accuracy: (v.correct / v.total) * 100 }))
    return { total, correct, accuracy, weakTopics }
  }, [attempts])

  const startQuiz = (topic: string) => {
    const qs = topic === 'mixed' ? getRandomQuestions(5) : getQuestionsByTopic(topic)
    if (qs.length === 0) {
      addToast('info', 'No questions available', `No practice questions for ${topic}.`)
      return
    }
    setSelectedTopic(topic)
    setQuestions(qs)
    setCurrentIdx(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setAnsweredCount(0)
    setMode('active')
  }

  const submitAnswer = async () => {
    if (selectedAnswer === null) return
    const q = questions[currentIdx]
    const isCorrect = selectedAnswer === q.correctAnswer
    setShowExplanation(true)
    setAnsweredCount((c) => c + 1)
    if (isCorrect) setScore((s) => s + 1)
    try {
      await createQuizAttempt({
        topic: q.topic,
        question_type: 'mcq',
        question: q.question,
        options: q.options,
        correct_answer: q.options[q.correctAnswer],
        user_answer: q.options[selectedAnswer],
        is_correct: isCorrect,
        difficulty: q.difficulty,
      })
      load()
    } catch { /* ignore */ }
  }

  const nextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setMode('results')
    }
  }

  const resetQuiz = () => {
    setMode('select')
    setQuestions([])
    setCurrentIdx(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore(0)
    setAnsweredCount(0)
  }

  const handleClearHistory = async () => {
    await clearQuizHistory()
    addToast('success', 'Quiz history cleared')
    load()
  }

  if (mode === 'active') {
    const q = questions[currentIdx]
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">{selectedTopic === 'mixed' ? 'Mixed Practice' : selectedTopic}</h2>
            <p className="text-sm text-muted-foreground">Question {currentIdx + 1} of {questions.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success"><CheckCircle2 size={12} /> {score} correct</Badge>
            <Button variant="ghost" size="sm" onClick={resetQuiz}>Exit</Button>
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary-500 h-full transition-all duration-300"
            style={{ width: `${((currentIdx + (showExplanation ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant={q.difficulty === 'easy' ? 'success' : q.difficulty === 'medium' ? 'warning' : 'error'}>
                {q.difficulty}
              </Badge>
              <Badge variant="info">{q.topic}</Badge>
            </div>
            <CardTitle className="text-base mt-3">{q.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {q.options.map((opt, i) => {
                let className = 'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm '
                if (showExplanation) {
                  if (i === q.correctAnswer) className += 'border-success bg-success/10 text-success'
                  else if (i === selectedAnswer) className += 'border-destructive bg-destructive/10 text-destructive'
                  else className += 'border-border opacity-50'
                } else if (selectedAnswer === i) {
                  className += 'border-primary-500 bg-primary-500/10'
                } else {
                  className += 'border-border hover:border-primary-300 hover:bg-muted/30'
                }
                return (
                  <button
                    key={i}
                    disabled={showExplanation}
                    onClick={() => setSelectedAnswer(i)}
                    className={className}
                  >
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 text-left">{opt}</span>
                    {showExplanation && i === q.correctAnswer && <CheckCircle2 size={16} className="text-success" />}
                    {showExplanation && i === selectedAnswer && i !== q.correctAnswer && <XCircle size={16} className="text-destructive" />}
                  </button>
                )
              })}
            </div>

            {showExplanation && (
              <div className="mt-4 p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
                <p className="text-sm"><strong>Explanation:</strong> {q.explanation}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              {!showExplanation ? (
                <Button size="sm" onClick={submitAnswer} disabled={selectedAnswer === null}>Submit Answer</Button>
              ) : (
                <Button size="sm" onClick={nextQuestion}>
                  {currentIdx + 1 < questions.length ? 'Next Question' : 'View Results'}
                  <ChevronRight size={14} />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (mode === 'results') {
    const pct = answeredCount > 0 ? (score / answeredCount) * 100 : 0
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
              <Trophy size={28} className="text-primary-500" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Quiz Complete!</h2>
            <p className="text-lg text-muted-foreground mb-1">
              You scored <span className="font-bold text-primary-500">{score}</span> out of {answeredCount}
            </p>
            <p className="font-display text-3xl font-bold tabular-nums mb-4">{pct.toFixed(0)}%</p>
            <Badge variant={pct >= 70 ? 'success' : pct >= 50 ? 'warning' : 'error'}>
              {pct >= 70 ? 'Great work!' : pct >= 50 ? 'Keep practicing' : 'Needs improvement'}
            </Badge>
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => startQuiz(selectedTopic)}>
                <RotateCcw size={14} /> Try Again
              </Button>
              <Button size="sm" onClick={resetQuiz}>Back to Topics</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><Brain size={18} className="text-primary-500" /><p className="text-xs text-muted-foreground">Total Attempts</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{stats.total}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><CheckCircle2 size={18} className="text-success" /><p className="text-xs text-muted-foreground">Correct</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{stats.correct}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><Trophy size={18} className="text-secondary" /><p className="text-xs text-muted-foreground">Accuracy</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{formatScore(stats.accuracy, 0)}%</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><Clock size={18} className="text-warning" /><p className="text-xs text-muted-foreground">Weak Topics</p></div>
          <p className="font-display text-2xl font-bold tabular-nums">{stats.weakTopics.length}</p>
        </CardContent></Card>
      </div>

      {/* Topic selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose a Practice Topic</CardTitle>
          <CardDescription>Test your knowledge with multiple-choice questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => startQuiz('mixed')}
              className="flex items-center gap-3 p-4 rounded-lg border-2 border-primary-500/30 bg-primary-500/5 hover:border-primary-500 hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                <Brain size={20} className="text-primary-500" />
              </div>
              <div>
                <p className="font-medium text-sm">Mixed Practice</p>
                <p className="text-xs text-muted-foreground">Questions from all topics</p>
              </div>
            </button>
            {quizTopics.map(topic => {
              const topicStats = stats.weakTopics.find(t => t.topic === topic)
              const qCount = getQuestionsByTopic(topic).length
              return (
                <button
                  key={topic}
                  onClick={() => startQuiz(topic)}
                  className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:shadow-md hover:border-primary-300 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{topic}</p>
                    <p className="text-xs text-muted-foreground">{qCount} questions</p>
                    {topicStats && <p className="text-xs text-destructive mt-0.5">Accuracy: {topicStats.accuracy.toFixed(0)}%</p>}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weak topics warning */}
      {stats.weakTopics.length > 0 && (
        <div className="flex gap-2 p-3 rounded-md bg-warning/10 border border-warning/20">
          <Trophy size={16} className="flex-shrink-0 mt-0.5 text-warning" />
          <p className="text-xs text-warning">
            Topics needing more practice: {stats.weakTopics.map(t => t.topic).join(', ')}. Focus on these areas to improve your accuracy.
          </p>
        </div>
      )}

      {/* Recent attempts */}
      {!loading && attempts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Practice History</CardTitle>
              <Button variant="outline" size="sm" onClick={handleClearHistory}><Trash2 size={14} /> Clear History</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border max-h-64 overflow-y-auto scrollbar-thin">
              {attempts.slice(0, 20).map((a) => (
                <div key={a.id} className="flex items-start gap-3 py-2.5 px-2 text-sm">
                  {a.is_correct
                    ? <CheckCircle2 size={16} className="text-success flex-shrink-0 mt-0.5" />
                    : <XCircle size={16} className="text-destructive flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{a.question}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <Badge variant="info" className="text-[10px] mr-1">{a.topic}</Badge>
                      Correct: {a.correct_answer}
                      {!a.is_correct && a.user_answer && ` | Your answer: ${a.user_answer}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground/60 flex-shrink-0">{formatDate(a.created_at)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && attempts.length === 0 && (
        <Card>
          <EmptyState
            icon={<Brain size={20} />}
            title="No practice attempts yet"
            description="Select a topic above to start practicing. Your attempts will be tracked here to identify areas needing improvement."
          />
        </Card>
      )}

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            Practice questions are AI-generated study material for revision purposes. They are not
            official examination questions and do not guarantee specific exam content. Always
            consult your course syllabus and instructor for exam preparation guidance.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
