import { supabase } from '@/lib/supabase'

export interface PortfolioItem {
  id: string
  title: string
  description: string | null
  category: string
  date: string | null
  link: string | null
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface PortfolioInput {
  title: string
  description?: string
  category?: string
  date?: string
  link?: string
  is_private?: boolean
}

const STORAGE_KEY = 'aspp_portfolio'

function readLocal(): PortfolioItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PortfolioItem[]
  } catch {
    return []
  }
}

function writeLocal(items: PortfolioItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch { /* ignore */ }
}

export async function fetchPortfolio(): Promise<PortfolioItem[]> {
  if (!supabase) return readLocal()
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .order('date', { ascending: false, nullsFirst: false })
  if (error) return readLocal()
  return (data || []) as PortfolioItem[]
}

export async function createPortfolioItem(input: PortfolioInput): Promise<PortfolioItem> {
  const payload = {
    title: input.title,
    description: input.description || null,
    category: input.category || 'project',
    date: input.date || null,
    link: input.link || null,
    is_private: input.is_private ?? false,
  }
  if (!supabase) {
    const item: PortfolioItem = {
      id: crypto.randomUUID(),
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const local = readLocal()
    local.unshift(item)
    writeLocal(local)
    return item
  }
  const { data, error } = await supabase.from('portfolio_items').insert(payload).select('*').single()
  if (error) throw error
  return data as PortfolioItem
}

export async function deletePortfolioItem(id: string): Promise<void> {
  if (!supabase) {
    writeLocal(readLocal().filter((i) => i.id !== id))
    return
  }
  const { error } = await supabase.from('portfolio_items').delete().eq('id', id)
  if (error) throw error
}

export const portfolioCategories = [
  { value: 'project', label: 'Project' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'skill', label: 'Skill' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'competition', label: 'Competition' },
  { value: 'volunteer', label: 'Volunteer Work' },
  { value: 'internship', label: 'Internship' },
  { value: 'research', label: 'Research' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'milestone', label: 'Milestone' },
]

export const careerTracks = [
  {
    id: 'python',
    name: 'Python Programming',
    skills: ['Variables & Data Types', 'Control Flow', 'Functions', 'OOP', 'File Handling', 'Modules & Packages', 'Error Handling', 'Decorators'],
    level: 'Foundation',
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    skills: ['NumPy', 'Pandas', 'Matplotlib', 'Seaborn', 'Data Cleaning', 'Exploratory Data Analysis', 'Statistical Analysis', 'Data Visualization'],
    level: 'Intermediate',
  },
  {
    id: 'machine-learning',
    name: 'Machine Learning',
    skills: ['Supervised Learning', 'Unsupervised Learning', 'Feature Engineering', 'Model Evaluation', 'Cross-Validation', 'Hyperparameter Tuning', 'Scikit-learn', 'Model Deployment'],
    level: 'Intermediate',
  },
  {
    id: 'deep-learning',
    name: 'Deep Learning',
    skills: ['Neural Networks', 'TensorFlow/Keras', 'PyTorch', 'CNNs', 'RNNs/LSTMs', 'Transfer Learning', ' regularization', 'GPU Training'],
    level: 'Advanced',
  },
  {
    id: 'computer-vision',
    name: 'Computer Vision',
    skills: ['Image Processing', 'OpenCV', 'Object Detection', 'Image Segmentation', 'Face Recognition', 'Feature Extraction', 'YOLO', 'Image Classification'],
    level: 'Advanced',
  },
  {
    id: 'nlp',
    name: 'Natural Language Processing',
    skills: ['Text Preprocessing', 'Tokenization', 'Word Embeddings', 'TF-IDF', 'Sentiment Analysis', 'Named Entity Recognition', 'Transformers', 'Language Models'],
    level: 'Advanced',
  },
  {
    id: 'generative-ai',
    name: 'Generative AI',
    skills: ['GPT Models', 'Prompt Engineering', 'RAG', 'LangChain', 'Fine-tuning', 'LLM Applications', 'AI Safety', 'Vector Databases'],
    level: 'Advanced',
  },
  {
    id: 'mlops',
    name: 'MLOps',
    skills: ['Model Versioning', 'CI/CD for ML', 'Docker', 'Model Monitoring', 'Experiment Tracking', 'MLflow', 'Kubernetes', 'Cloud Deployment'],
    level: 'Advanced',
  },
]
