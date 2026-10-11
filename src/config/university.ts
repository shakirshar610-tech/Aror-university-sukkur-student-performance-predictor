export interface UniversityInfo {
  name: string
  shortName: string
  tagline: string
  location: string
  website: string
  examRulesUrl: string
  independenceNote: string
}

export interface Department {
  id: string
  name: string
  code: string
  description: string
}

export interface Program {
  id: string
  departmentId: string
  name: string
  code: string
  degreeType: string
  durationSemesters: number
  active: boolean
}

export interface Course {
  id: string
  programId: string
  semester: number
  courseCode: string
  title: string
  creditHours: number
  type: 'theory' | 'practical'
  category: string
}

export interface AssessmentComponent {
  id: string
  name: string
  key: string
  maxMarks: number
  weight: number
  type: 'theory' | 'practical'
  description: string
}

export interface GradeBoundary {
  minPercent: number
  maxPercent: number
  letter: string
  gradePoint: number
  label: string
}

export interface SpecialGrade {
  letter: string
  label: string
  description: string
}

export interface SemesterInfo {
  number: number
  label: string
  type: 'fall' | 'spring' | 'summer'
  weeks: number
}

// University
export const university: UniversityInfo = {
  name: 'Aror University of Art, Architecture, Design and Heritage',
  shortName: 'Aror University',
  tagline: 'Understand Your Performance. Plan Your Progress.',
  location: 'Rohri Bypass, Sukkur, Sindh, Pakistan',
  website: 'https://aror.edu.pk/',
  examRulesUrl: 'https://aror.edu.pk/examination-rules/',
  independenceNote:
    'ASPP is an independent academic support project. It is not officially affiliated with or endorsed by Aror University unless authorization is obtained.',
}

// Departments
export const departments: Department[] = [
  { id: 'ai', name: 'Artificial Intelligence', code: 'AI', description: 'BS Artificial Intelligence and related programs.' },
  { id: 'cs', name: 'Cybersecurity', code: 'CYB', description: 'BS Cybersecurity program.' },
  { id: 'mg', name: 'Multimedia & Gaming', code: 'MG', description: 'BS Multimedia & Gaming program.' },
  { id: 'arch', name: 'Architecture', code: 'ARCH', description: 'Bachelor of Architecture program.' },
  { id: 'civil', name: 'Civil Engineering', code: 'CIV', description: 'BS Civil Engineering program.' },
  { id: 'env', name: 'Environmental Sciences', code: 'ENV', description: 'BS Environmental Sciences program.' },
  { id: 'ccs', name: 'Climate Change & Sustainable Development', code: 'CCS', description: 'BS Climate Change and Sustainable Development.' },
  { id: 'archaeo', name: 'Archaeology', code: 'ARCH-ARC', description: 'BS Archaeology program.' },
  { id: 'history', name: 'History', code: 'HIS', description: 'BS History program.' },
  { id: 'tourism', name: 'Tourism & Hospitality', code: 'THM', description: 'BS Tourism & Hospitality Management.' },
  { id: 'pak', name: 'Pakistan Studies', code: 'PAK', description: 'BS Pakistan Studies program.' },
  { id: 'textile', name: 'Textile Design', code: 'TD', description: 'BS Textile Design program.' },
  { id: 'fashion', name: 'Fashion Design', code: 'FD', description: 'BS Fashion Design program.' },
  { id: 'ceramic', name: 'Ceramic Design', code: 'CD', description: 'BS Ceramic Design program.' },
]

// Programs
export const programs: Program[] = [
  { id: 'bs-ai', departmentId: 'ai', name: 'BS Artificial Intelligence', code: 'BS-AI', degreeType: 'BS', durationSemesters: 8, active: true },
  { id: 'bs-cyb', departmentId: 'cs', name: 'BS Cybersecurity', code: 'BS-CYB', degreeType: 'BS', durationSemesters: 8, active: true },
  { id: 'bs-mg', departmentId: 'mg', name: 'BS Multimedia & Gaming', code: 'BS-MG', degreeType: 'BS', durationSemesters: 8, active: true },
  { id: 'b-arch', departmentId: 'arch', name: 'Bachelor of Architecture', code: 'B-Arch', degreeType: 'BArch', durationSemesters: 10, active: true },
  { id: 'bs-civil', departmentId: 'civil', name: 'BS Civil Engineering', code: 'BS-CIV', degreeType: 'BS', durationSemesters: 8, active: true },
  { id: 'bs-env', departmentId: 'env', name: 'BS Environmental Sciences', code: 'BS-ENV', degreeType: 'BS', durationSemesters: 8, active: true },
  { id: 'bs-ccs', departmentId: 'ccs', name: 'BS Climate Change and Sustainable Development', code: 'BS-CCS', degreeType: 'BS', durationSemesters: 8, active: true },
  { id: 'bs-archaeo', departmentId: 'archaeo', name: 'BS Archaeology', code: 'BS-ARC', degreeType: 'BS', durationSemesters: 8, active: true },
  { id: 'bs-history', departmentId: 'history', name: 'BS History', code: 'BS-HIS', degreeType: 'BS', durationSemesters: 8, active: true },
  { id: 'bs-tourism', departmentId: 'tourism', name: 'BS Tourism & Hospitality', code: 'BS-THM', degreeType: 'BS', durationSemesters: 8, active: true },
  { id: 'bs-pak', departmentId: 'pak', name: 'BS Pakistan Studies', code: 'BS-PAK', degreeType: 'BS', durationSemesters: 8, active: true },
  { id: 'bs-textile', departmentId: 'textile', name: 'BS Textile Design', code: 'BS-TD', degreeType: 'BS', durationSemesters: 8, active: true },
  { id: 'bs-fashion', departmentId: 'fashion', name: 'BS Fashion Design', code: 'BS-FD', degreeType: 'BS', durationSemesters: 8, active: true },
  { id: 'bs-ceramic', departmentId: 'ceramic', name: 'BS Ceramic Design', code: 'BS-CD', degreeType: 'BS', durationSemesters: 8, active: true },
]

// Semester structure
export const semesterStructure = {
  regularWeeks: 16,
  types: ['fall', 'spring'] as const,
  hasSummerWinter: true,
  assessments: ['Quizzes', 'Assignments', 'Presentations', 'Mid-semester examination', 'Final-semester examination', 'Practical and project-based assessment'],
}

export const semesters: SemesterInfo[] = Array.from({ length: 8 }, (_, i) => ({
  number: i + 1,
  label: `Semester ${i + 1}`,
  type: i % 2 === 0 ? 'fall' : 'spring',
  weeks: 16,
}))

// Assessment framework
export const theoryAssessment: AssessmentComponent[] = [
  { id: 'sessional', name: 'Sessional Assessments', key: 'sessional', maxMarks: 30, weight: 30, type: 'theory', description: 'Quizzes, assignments, presentations, and other sessional work.' },
  { id: 'midterm', name: 'Midterm Examination', key: 'midterm', maxMarks: 30, weight: 30, type: 'theory', description: 'Mid-semester examination.' },
  { id: 'final', name: 'Final Examination', key: 'final', maxMarks: 40, weight: 40, type: 'theory', description: 'Final-semester examination.' },
]

export const practicalAssessment: AssessmentComponent[] = [
  { id: 'practical-exam', name: 'Practical Examination', key: 'practical_exam', maxMarks: 20, weight: 40, type: 'practical', description: 'Practical examination.' },
  { id: 'viva', name: 'Viva / Discussion / Presentation', key: 'viva', maxMarks: 15, weight: 30, type: 'practical', description: 'Viva voce, discussion, or presentation.' },
  { id: 'manuals', name: 'Manuals / Project File', key: 'manuals', maxMarks: 15, weight: 30, type: 'practical', description: 'Lab manuals, project file, and related work.' },
]

// Grading scale (published examination rules)
export const gradeScale: GradeBoundary[] = [
  { minPercent: 94, maxPercent: 100, letter: 'A+', gradePoint: 4.00, label: 'Excellent' },
  { minPercent: 90, maxPercent: 93.99, letter: 'A', gradePoint: 3.88, label: 'Excellent' },
  { minPercent: 87, maxPercent: 89.99, letter: 'A-', gradePoint: 3.50, label: 'Very Good' },
  { minPercent: 83, maxPercent: 86.99, letter: 'B+', gradePoint: 3.33, label: 'Good' },
  { minPercent: 80, maxPercent: 82.99, letter: 'B', gradePoint: 3.00, label: 'Good' },
  { minPercent: 75, maxPercent: 79.99, letter: 'B-', gradePoint: 2.88, label: 'Above Average' },
  { minPercent: 71, maxPercent: 74.99, letter: 'C+', gradePoint: 2.67, label: 'Average' },
  { minPercent: 68, maxPercent: 70.99, letter: 'C', gradePoint: 2.50, label: 'Average' },
  { minPercent: 64, maxPercent: 67.99, letter: 'C-', gradePoint: 2.33, label: 'Below Average' },
  { minPercent: 61, maxPercent: 63.99, letter: 'D', gradePoint: 2.00, label: 'Pass' },
  { minPercent: 60, maxPercent: 60.99, letter: 'D-', gradePoint: 1.70, label: 'Marginal Pass' },
  { minPercent: 0, maxPercent: 59.99, letter: 'F', gradePoint: 0.00, label: 'Fail' },
]

export const specialGrades: SpecialGrade[] = [
  { letter: 'I', label: 'Incomplete', description: 'Assessment requirements not yet completed.' },
  { letter: 'W', label: 'Withdraw', description: 'Course withdrawn with approved permission.' },
  { letter: 'X', label: 'Exempted', description: 'Course requirement exempted.' },
]

// BS Artificial Intelligence curriculum — seed data
// Source: https://aror.edu.pk/faculty-fest/artificial-intelligence/program-details/
export const bsAiCourses: Course[] = [
  // Semester 1
  { id: 'ai-s1-1', programId: 'bs-ai', semester: 1, courseCode: 'AI-101', title: 'Programming Fundamentals', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s1-2', programId: 'bs-ai', semester: 1, courseCode: 'AI-102', title: 'Application of Information & Communication Technologies', creditHours: 3, type: 'theory', category: 'Foundation' },
  { id: 'ai-s1-3', programId: 'bs-ai', semester: 1, courseCode: 'ENG-101', title: 'Functional English', creditHours: 3, type: 'theory', category: 'General' },
  { id: 'ai-s1-4', programId: 'bs-ai', semester: 1, courseCode: 'MTH-101', title: 'Calculus and Analytic Geometry', creditHours: 3, type: 'theory', category: 'Foundation' },
  { id: 'ai-s1-5', programId: 'bs-ai', semester: 1, courseCode: 'ISL-101', title: 'Islamic Studies', creditHours: 2, type: 'theory', category: 'General' },
  { id: 'ai-s1-6', programId: 'bs-ai', semester: 1, courseCode: 'PAK-101', title: 'Ideology and Constitution of Pakistan', creditHours: 2, type: 'theory', category: 'General' },
  // Semester 2
  { id: 'ai-s2-1', programId: 'bs-ai', semester: 2, courseCode: 'AI-201', title: 'Object Oriented Programming', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s2-2', programId: 'bs-ai', semester: 2, courseCode: 'AI-202', title: 'Digital Logic Design', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s2-3', programId: 'bs-ai', semester: 2, courseCode: 'MTH-201', title: 'Linear Algebra', creditHours: 3, type: 'theory', category: 'Foundation' },
  { id: 'ai-s2-4', programId: 'bs-ai', semester: 2, courseCode: 'AI-203', title: 'Discrete Structure', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s2-5', programId: 'bs-ai', semester: 2, courseCode: 'ENG-201', title: 'Expository Writing', creditHours: 3, type: 'theory', category: 'General' },
  // Semester 3
  { id: 'ai-s3-1', programId: 'bs-ai', semester: 3, courseCode: 'AI-301', title: 'Data Structures', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s3-2', programId: 'bs-ai', semester: 3, courseCode: 'AI-302', title: 'Computer Networks', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s3-3', programId: 'bs-ai', semester: 3, courseCode: 'AI-303', title: 'Software Engineering', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s3-4', programId: 'bs-ai', semester: 3, courseCode: 'MTH-301', title: 'Multivariable Calculus', creditHours: 3, type: 'theory', category: 'Foundation' },
  { id: 'ai-s3-5', programId: 'bs-ai', semester: 3, courseCode: 'PHY-301', title: 'Natural Sciences (Applied Physics)', creditHours: 3, type: 'theory', category: 'Foundation' },
  { id: 'ai-s3-6', programId: 'bs-ai', semester: 3, courseCode: 'PAK-301', title: 'Ideology and Constitution of Pakistan', creditHours: 2, type: 'theory', category: 'General' },
  // Semester 4
  { id: 'ai-s4-1', programId: 'bs-ai', semester: 4, courseCode: 'AI-401', title: 'Database Systems', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s4-2', programId: 'bs-ai', semester: 4, courseCode: 'AI-402', title: 'Operating Systems', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s4-3', programId: 'bs-ai', semester: 4, courseCode: 'AI-403', title: 'Analysis of Algorithms', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s4-4', programId: 'bs-ai', semester: 4, courseCode: 'AI-404', title: 'Artificial Intelligence', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s4-5', programId: 'bs-ai', semester: 4, courseCode: 'AI-405', title: 'Programming for AI', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s4-6', programId: 'bs-ai', semester: 4, courseCode: 'STAT-401', title: 'Probability and Statistics', creditHours: 3, type: 'theory', category: 'Foundation' },
  // Semester 5
  { id: 'ai-s5-1', programId: 'bs-ai', semester: 5, courseCode: 'AI-501', title: 'Information Security', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s5-2', programId: 'bs-ai', semester: 5, courseCode: 'AI-502', title: 'Computer Organization and Assembly Language', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s5-3', programId: 'bs-ai', semester: 5, courseCode: 'AI-503', title: 'Machine Learning', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s5-4', programId: 'bs-ai', semester: 5, courseCode: 'AI-504', title: 'Natural Language Processing', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s5-5', programId: 'bs-ai', semester: 5, courseCode: 'AI-505', title: 'Web Programming for AI', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s5-6', programId: 'bs-ai', semester: 5, courseCode: 'MGT-501', title: 'Introduction to Management', creditHours: 3, type: 'theory', category: 'General' },
  // Semester 6
  { id: 'ai-s6-1', programId: 'bs-ai', semester: 6, courseCode: 'AI-601', title: 'Artificial Neural Network and Deep Learning', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s6-2', programId: 'bs-ai', semester: 6, courseCode: 'AI-602', title: 'Computer Vision', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s6-3', programId: 'bs-ai', semester: 6, courseCode: 'AI-603', title: 'Human Computer Interaction', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s6-4', programId: 'bs-ai', semester: 6, courseCode: 'AI-604', title: 'Multimedia Mining', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s6-5', programId: 'bs-ai', semester: 6, courseCode: 'CIV-601', title: 'Civics and Community Engagement', creditHours: 2, type: 'theory', category: 'General' },
  { id: 'ai-s6-6', programId: 'bs-ai', semester: 6, courseCode: 'ENG-601', title: 'Technical & Business Writing', creditHours: 3, type: 'theory', category: 'General' },
  // Semester 7
  { id: 'ai-s7-1', programId: 'bs-ai', semester: 7, courseCode: 'AI-701', title: 'Final Year Project I', creditHours: 3, type: 'practical', category: 'Core' },
  { id: 'ai-s7-2', programId: 'bs-ai', semester: 7, courseCode: 'AI-702', title: 'Knowledge Representation & Reasoning', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s7-3', programId: 'bs-ai', semester: 7, courseCode: 'MKT-701', title: 'Introduction to Marketing', creditHours: 3, type: 'theory', category: 'General' },
  { id: 'ai-s7-4', programId: 'bs-ai', semester: 7, courseCode: 'AI-703', title: 'Generative Artificial Intelligence', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s7-5', programId: 'bs-ai', semester: 7, courseCode: 'AI-704', title: 'MLOps', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s7-6', programId: 'bs-ai', semester: 7, courseCode: 'ENT-701', title: 'Entrepreneurship', creditHours: 3, type: 'theory', category: 'General' },
  // Semester 8
  { id: 'ai-s8-1', programId: 'bs-ai', semester: 8, courseCode: 'AI-801', title: 'Final Year Project II', creditHours: 3, type: 'practical', category: 'Core' },
  { id: 'ai-s8-2', programId: 'bs-ai', semester: 8, courseCode: 'AI-802', title: 'Parallel & Distributed Computing', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s8-3', programId: 'bs-ai', semester: 8, courseCode: 'AI-803', title: 'Reinforcement Learning', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'ai-s8-4', programId: 'bs-ai', semester: 8, courseCode: 'AI-804', title: 'Professional Practices', creditHours: 3, type: 'theory', category: 'General' },
]

// BS Cybersecurity curriculum — seed data
// Source: https://aror.edu.pk/faculty-fest/cybersecurity/program-details
// Total Credit Hours = 130, Total Courses = 44
// Note: Official course codes not publicly listed; codes below are provisional identifiers.
export const bsCybCourses: Course[] = [
  // Semester 1
  { id: 'cyb-s1-1', programId: 'bs-cyb', semester: 1, courseCode: 'CYB-101', title: 'Programming Fundamentals', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s1-2', programId: 'bs-cyb', semester: 1, courseCode: 'CYB-102', title: 'Application of Information & Communication Technologies', creditHours: 3, type: 'theory', category: 'Foundation' },
  { id: 'cyb-s1-3', programId: 'bs-cyb', semester: 1, courseCode: 'ENG-101', title: 'Functional English', creditHours: 3, type: 'theory', category: 'General' },
  { id: 'cyb-s1-4', programId: 'bs-cyb', semester: 1, courseCode: 'MTH-101', title: 'Calculus and Analytic Geometry (QR1)', creditHours: 3, type: 'theory', category: 'Foundation' },
  { id: 'cyb-s1-5', programId: 'bs-cyb', semester: 1, courseCode: 'ISL-101', title: 'Islamic Studies / Ethics', creditHours: 2, type: 'theory', category: 'General' },
  { id: 'cyb-s1-6', programId: 'bs-cyb', semester: 1, courseCode: 'PAK-101', title: 'Ideology and Constitution of Pakistan', creditHours: 2, type: 'theory', category: 'General' },
  // Semester 2
  { id: 'cyb-s2-1', programId: 'bs-cyb', semester: 2, courseCode: 'CYB-201', title: 'Object Oriented Programming', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s2-2', programId: 'bs-cyb', semester: 2, courseCode: 'MTH-201', title: 'Multivariable Calculus', creditHours: 3, type: 'theory', category: 'Foundation' },
  { id: 'cyb-s2-3', programId: 'bs-cyb', semester: 2, courseCode: 'CYB-203', title: 'Discrete Structure', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s2-4', programId: 'bs-cyb', semester: 2, courseCode: 'ENG-201', title: 'Expository Writing', creditHours: 3, type: 'theory', category: 'General' },
  { id: 'cyb-s2-5', programId: 'bs-cyb', semester: 2, courseCode: 'PHY-201', title: 'Natural Sciences (Applied Physics)', creditHours: 3, type: 'theory', category: 'Foundation' },
  // Semester 3
  { id: 'cyb-s3-1', programId: 'bs-cyb', semester: 3, courseCode: 'CYB-301', title: 'Data Structures', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s3-2', programId: 'bs-cyb', semester: 3, courseCode: 'CYB-302', title: 'Artificial Intelligence', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s3-3', programId: 'bs-cyb', semester: 3, courseCode: 'CYB-303', title: 'Software Engineering', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s3-4', programId: 'bs-cyb', semester: 3, courseCode: 'MTH-301', title: 'Linear Algebra', creditHours: 3, type: 'theory', category: 'Foundation' },
  { id: 'cyb-s3-5', programId: 'bs-cyb', semester: 3, courseCode: 'CYB-305', title: 'Digital Logic Design', creditHours: 3, type: 'theory', category: 'Core' },
  // Semester 4
  { id: 'cyb-s4-1', programId: 'bs-cyb', semester: 4, courseCode: 'CYB-401', title: 'Database Systems', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s4-2', programId: 'bs-cyb', semester: 4, courseCode: 'CYB-402', title: 'Operating Systems', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s4-3', programId: 'bs-cyb', semester: 4, courseCode: 'CYB-403', title: 'Computer Communication & Networks', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s4-4', programId: 'bs-cyb', semester: 4, courseCode: 'CYB-404', title: 'Introduction to Cybersecurity', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s4-5', programId: 'bs-cyb', semester: 4, courseCode: 'CIV-401', title: 'Civics and Community Engagement', creditHours: 2, type: 'theory', category: 'General' },
  { id: 'cyb-s4-6', programId: 'bs-cyb', semester: 4, courseCode: 'STAT-401', title: 'Probability and Statistics', creditHours: 3, type: 'theory', category: 'Foundation' },
  // Semester 5
  { id: 'cyb-s5-1', programId: 'bs-cyb', semester: 5, courseCode: 'CYB-501', title: 'Analysis of Algorithms', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s5-2', programId: 'bs-cyb', semester: 5, courseCode: 'CYB-502', title: 'Computer Organization and Assembly Language', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s5-3', programId: 'bs-cyb', semester: 5, courseCode: 'CYB-503', title: 'Information Security', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s5-4', programId: 'bs-cyb', semester: 5, courseCode: 'CYB-504', title: 'Domain Elective-I', creditHours: 3, type: 'theory', category: 'Elective' },
  { id: 'cyb-s5-5', programId: 'bs-cyb', semester: 5, courseCode: 'CYB-505', title: 'Domain Elective-II', creditHours: 3, type: 'theory', category: 'Elective' },
  { id: 'cyb-s5-6', programId: 'bs-cyb', semester: 5, courseCode: 'MGT-501', title: 'Introduction to Management', creditHours: 3, type: 'theory', category: 'General' },
  // Semester 6
  { id: 'cyb-s6-1', programId: 'bs-cyb', semester: 6, courseCode: 'CYB-601', title: 'Network Security', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s6-2', programId: 'bs-cyb', semester: 6, courseCode: 'CYB-602', title: 'Digital Forensics', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s6-3', programId: 'bs-cyb', semester: 6, courseCode: 'CYB-603', title: 'Secure Software Design and Development', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s6-4', programId: 'bs-cyb', semester: 6, courseCode: 'CYB-604', title: 'Domain Elective-III', creditHours: 3, type: 'theory', category: 'Elective' },
  { id: 'cyb-s6-5', programId: 'bs-cyb', semester: 6, courseCode: 'CYB-605', title: 'Information Assurance', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s6-6', programId: 'bs-cyb', semester: 6, courseCode: 'ENG-601', title: 'Technical & Business Writing', creditHours: 3, type: 'theory', category: 'General' },
  // Semester 7
  { id: 'cyb-s7-1', programId: 'bs-cyb', semester: 7, courseCode: 'CYB-701', title: 'Final Year Design Project – I', creditHours: 3, type: 'practical', category: 'Core' },
  { id: 'cyb-s7-2', programId: 'bs-cyb', semester: 7, courseCode: 'CYB-702', title: 'Domain Elective-IV', creditHours: 3, type: 'theory', category: 'Elective' },
  { id: 'cyb-s7-3', programId: 'bs-cyb', semester: 7, courseCode: 'MKT-701', title: 'Digital Marketing', creditHours: 3, type: 'theory', category: 'General' },
  { id: 'cyb-s7-4', programId: 'bs-cyb', semester: 7, courseCode: 'CYB-704', title: 'Domain Elective-V', creditHours: 3, type: 'theory', category: 'Elective' },
  { id: 'cyb-s7-5', programId: 'bs-cyb', semester: 7, courseCode: 'CYB-705', title: 'Domain Elective-VI', creditHours: 3, type: 'theory', category: 'Elective' },
  { id: 'cyb-s7-6', programId: 'bs-cyb', semester: 7, courseCode: 'ENT-701', title: 'Technology Entrepreneurship', creditHours: 3, type: 'theory', category: 'General' },
  // Semester 8
  { id: 'cyb-s8-1', programId: 'bs-cyb', semester: 8, courseCode: 'CYB-801', title: 'Final Year Design Project – II', creditHours: 3, type: 'practical', category: 'Core' },
  { id: 'cyb-s8-2', programId: 'bs-cyb', semester: 8, courseCode: 'CYB-802', title: 'Parallel & Distributed Computing', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'cyb-s8-3', programId: 'bs-cyb', semester: 8, courseCode: 'CYB-803', title: 'Domain Elective-VII', creditHours: 3, type: 'theory', category: 'Elective' },
  { id: 'cyb-s8-4', programId: 'bs-cyb', semester: 8, courseCode: 'CYB-804', title: 'Professional Practices', creditHours: 3, type: 'theory', category: 'General' },
]

// BS Multimedia & Gaming curriculum — seed data
// Source: https://aror.edu.pk/faculty-fest/multimedia-gaming/program-details
// Note: Official course codes not publicly listed; codes below are provisional identifiers.
export const bsMgCourses: Course[] = [
  // Semester 1
  { id: 'mg-s1-1', programId: 'bs-mg', semester: 1, courseCode: 'MG-101', title: 'Programming Fundamentals', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'mg-s1-2', programId: 'bs-mg', semester: 1, courseCode: 'MG-102', title: 'Application of Information & Communication Technologies', creditHours: 3, type: 'theory', category: 'Foundation' },
  { id: 'mg-s1-3', programId: 'bs-mg', semester: 1, courseCode: 'ISL-101', title: 'Islamic Studies', creditHours: 2, type: 'theory', category: 'General' },
  { id: 'mg-s1-4', programId: 'bs-mg', semester: 1, courseCode: 'MTH-101', title: 'Calculus and Analytic Geometry', creditHours: 3, type: 'theory', category: 'Foundation' },
  { id: 'mg-s1-5', programId: 'bs-mg', semester: 1, courseCode: 'ENG-101', title: 'Functional English', creditHours: 3, type: 'theory', category: 'General' },
  { id: 'mg-s1-6', programId: 'bs-mg', semester: 1, courseCode: 'MG-106', title: 'Domain Elective-1 (Basic Drawings)', creditHours: 3, type: 'practical', category: 'Elective' },
  // Semester 2
  { id: 'mg-s2-1', programId: 'bs-mg', semester: 2, courseCode: 'MG-201', title: 'Object Oriented Programming', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'mg-s2-2', programId: 'bs-mg', semester: 2, courseCode: 'MG-202', title: 'Data Structures', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'mg-s2-3', programId: 'bs-mg', semester: 2, courseCode: 'PHY-201', title: 'Natural Science (Applied Physics)', creditHours: 3, type: 'theory', category: 'Foundation' },
  { id: 'mg-s2-4', programId: 'bs-mg', semester: 2, courseCode: 'MTH-201', title: 'Multivariable Calculus', creditHours: 3, type: 'theory', category: 'Foundation' },
  { id: 'mg-s2-5', programId: 'bs-mg', semester: 2, courseCode: 'MG-205', title: 'Discrete Structures', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'mg-s2-6', programId: 'bs-mg', semester: 2, courseCode: 'ENG-201', title: 'Expository Writing', creditHours: 3, type: 'theory', category: 'General' },
  // Semester 3
  { id: 'mg-s3-1', programId: 'bs-mg', semester: 3, courseCode: 'MG-301', title: 'Digital Logic Design', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'mg-s3-2', programId: 'bs-mg', semester: 3, courseCode: 'MG-302', title: 'Operating Systems', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'mg-s3-3', programId: 'bs-mg', semester: 3, courseCode: 'MG-303', title: 'Software Engineering', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'mg-s3-4', programId: 'bs-mg', semester: 3, courseCode: 'MTH-301', title: 'Linear Algebra', creditHours: 3, type: 'theory', category: 'Foundation' },
  { id: 'mg-s3-5', programId: 'bs-mg', semester: 3, courseCode: 'MG-305', title: 'Analysis of Algorithms', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'mg-s3-6', programId: 'bs-mg', semester: 3, courseCode: 'ENG-601', title: 'Technical & Business Writing', creditHours: 3, type: 'theory', category: 'General' },
  // Semester 4
  { id: 'mg-s4-1', programId: 'bs-mg', semester: 4, courseCode: 'MG-401', title: 'Database Systems', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'mg-s4-2', programId: 'bs-mg', semester: 4, courseCode: 'MG-402', title: 'Computer Organization & Assembly Language', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'mg-s4-3', programId: 'bs-mg', semester: 4, courseCode: 'MG-403', title: 'Domain Core 1 (Mobile Multimedia)', creditHours: 3, type: 'practical', category: 'Core' },
  { id: 'mg-s4-4', programId: 'bs-mg', semester: 4, courseCode: 'MG-404', title: 'Domain Core 2 (Game Design and Development)', creditHours: 3, type: 'practical', category: 'Core' },
  { id: 'mg-s4-5', programId: 'bs-mg', semester: 4, courseCode: 'STAT-401', title: 'Probability & Statistics', creditHours: 3, type: 'theory', category: 'Foundation' },
  { id: 'mg-s4-6', programId: 'bs-mg', semester: 4, courseCode: 'MGT-501', title: 'Social Science (Introduction to Management)', creditHours: 3, type: 'theory', category: 'General' },
  // Semester 5
  { id: 'mg-s5-1', programId: 'bs-mg', semester: 5, courseCode: 'MG-501', title: 'Artificial Intelligence', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'mg-s5-2', programId: 'bs-mg', semester: 5, courseCode: 'MG-502', title: 'Domain Core 3 (Interactive Games and Audio)', creditHours: 3, type: 'practical', category: 'Core' },
  { id: 'mg-s5-3', programId: 'bs-mg', semester: 5, courseCode: 'MG-503', title: 'Domain Core 4 (Game Programming)', creditHours: 3, type: 'practical', category: 'Core' },
  { id: 'mg-s5-4', programId: 'bs-mg', semester: 5, courseCode: 'MG-504', title: 'Domain Elective 2', creditHours: 3, type: 'theory', category: 'Elective' },
  { id: 'mg-s5-5', programId: 'bs-mg', semester: 5, courseCode: 'MG-505', title: 'Domain Elective 3', creditHours: 3, type: 'theory', category: 'Elective' },
  { id: 'mg-s5-6', programId: 'bs-mg', semester: 5, courseCode: 'MKT-701', title: 'Elective Supporting Course (Introduction to Marketing)', creditHours: 3, type: 'theory', category: 'General' },
  // Semester 6
  { id: 'mg-s6-1', programId: 'bs-mg', semester: 6, courseCode: 'MG-601', title: 'Computer Networks', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'mg-s6-2', programId: 'bs-mg', semester: 6, courseCode: 'MG-602', title: 'Domain Core 5 (Video Production Techniques)', creditHours: 3, type: 'practical', category: 'Core' },
  { id: 'mg-s6-3', programId: 'bs-mg', semester: 6, courseCode: 'MG-603', title: 'Domain Core 6 (Parallel & Distributed Computing)', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'mg-s6-4', programId: 'bs-mg', semester: 6, courseCode: 'MG-604', title: 'Domain Elective 4', creditHours: 3, type: 'theory', category: 'Elective' },
  { id: 'mg-s6-5', programId: 'bs-mg', semester: 6, courseCode: 'MG-605', title: 'Domain Elective 5', creditHours: 3, type: 'theory', category: 'Elective' },
  { id: 'mg-s6-6', programId: 'bs-mg', semester: 6, courseCode: 'ENT-701', title: 'Entrepreneurship', creditHours: 3, type: 'theory', category: 'General' },
  // Semester 7
  { id: 'mg-s7-1', programId: 'bs-mg', semester: 7, courseCode: 'MG-701', title: 'Final Year Project – I', creditHours: 3, type: 'practical', category: 'Core' },
  { id: 'mg-s7-2', programId: 'bs-mg', semester: 7, courseCode: 'MG-702', title: 'Information Security', creditHours: 3, type: 'theory', category: 'Core' },
  { id: 'mg-s7-3', programId: 'bs-mg', semester: 7, courseCode: 'MG-703', title: 'Domain Elective 6', creditHours: 3, type: 'theory', category: 'Elective' },
  { id: 'mg-s7-4', programId: 'bs-mg', semester: 7, courseCode: 'MG-704', title: 'Domain Elective 7', creditHours: 3, type: 'theory', category: 'Elective' },
  // Semester 8
  { id: 'mg-s8-1', programId: 'bs-mg', semester: 8, courseCode: 'MG-801', title: 'Final Year Project – II', creditHours: 3, type: 'practical', category: 'Core' },
  { id: 'mg-s8-2', programId: 'bs-mg', semester: 8, courseCode: 'PAK-101', title: 'Ideology and Constitution of Pakistan', creditHours: 2, type: 'theory', category: 'General' },
  { id: 'mg-s8-3', programId: 'bs-mg', semester: 8, courseCode: 'MG-803', title: 'Arts & Humanities (Professional Practices)', creditHours: 3, type: 'theory', category: 'General' },
  { id: 'mg-s8-4', programId: 'bs-mg', semester: 8, courseCode: 'CIV-601', title: 'Civics and Community Engagement', creditHours: 2, type: 'theory', category: 'General' },
]

export const allCourses: Course[] = [...bsAiCourses, ...bsCybCourses, ...bsMgCourses]

// Helper functions
export function getDepartment(id: string): Department | undefined {
  return departments.find((d) => d.id === id)
}

export function getProgram(id: string): Program | undefined {
  return programs.find((p) => p.id === id)
}

export function getProgramsByDepartment(deptId: string): Program[] {
  return programs.filter((p) => p.departmentId === deptId)
}

export function getCoursesByProgramAndSemester(programId: string, semester: number): Course[] {
  return allCourses.filter((c) => c.programId === programId && c.semester === semester)
}

export function getGradeForPercentage(percentage: number): GradeBoundary | null {
  return gradeScale.find((g) => percentage >= g.minPercent && percentage <= g.maxPercent) || null
}

export function getAssessmentFramework(type: 'theory' | 'practical'): AssessmentComponent[] {
  return type === 'theory' ? theoryAssessment : practicalAssessment
}

export function calculateAttendancePercentage(classesAttended: number, totalClasses: number): number {
  if (totalClasses <= 0) return 0
  return Math.min(100, Math.max(0, (classesAttended / totalClasses) * 100))
}

export function normalizeToPercentage(obtained: number, max: number): number {
  if (max <= 0) return 0
  return Math.min(100, Math.max(0, (obtained / max) * 100))
}

export const minAttendanceForExamEligibility = 75
