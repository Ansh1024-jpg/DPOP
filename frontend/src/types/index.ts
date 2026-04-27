export interface AuthUser {
  user_id: number
  username: string
  role: 'applicant' | 'policy_manager' | 'manager'
  full_name: string
}

export const ApplicationStatus = {
  SUBMITTED: 'submitted',
  UNDER_AI_REVIEW: 'under_ai_review',
  FLAGGED: 'flagged',
  CORRECTIONS_MADE: 'corrections_made',
  PENDING_REVIEW: 'pending_review',
  ESCALATED: 'escalated',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

export type ApplicationStatusType = (typeof ApplicationStatus)[keyof typeof ApplicationStatus]

export const RiskLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

export type RiskLevelType = (typeof RiskLevel)[keyof typeof RiskLevel]

export interface FlagResponse {
  id: number
  section: string
  field_name: string
  issue: string
  severity: string
  is_resolved: boolean
}

export interface ApplicationResponse {
  id: number
  applicant_id: number
  applicant_name: string
  status: ApplicationStatusType
  risk_level: RiskLevelType | null
  ai_summary: string | null
  escalation_reason: string | null
  escalation_remarks: string | null
  final_decision: string | null
  decision_remarks: string | null
  submitted_at: string | null
  updated_at: string | null
  policy_manager_id: number | null
  manager_id: number | null
  // Personal
  full_name: string | null
  date_of_birth: string | null
  pan_number: string | null
  address: string | null
  phone: string | null
  email: string | null
  // Occupation
  occupation: string | null
  employer_name: string | null
  annual_income: number | null
  employment_type: string | null
  // Health
  pre_existing_conditions: string | null
  smoker: boolean | null
  height_cm: number | null
  weight_kg: number | null
  // Insurance
  coverage_amount: number | null
  policy_term: number | null
  premium_payment_mode: string | null
  // Nominee
  nominee_name: string | null
  nominee_relation: string | null
  nominee_dob: string | null
  document_path: string | null
  flags: FlagResponse[]
}

export interface ApplicationSummary {
  id: number
  applicant_id: number
  applicant_name: string
  status: ApplicationStatusType
  risk_level: RiskLevelType | null
  submitted_at: string | null
}
