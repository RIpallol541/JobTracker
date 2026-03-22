export type WorkFormat = "remote" | "hybrid" | "office";

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "hr_interview"
  | "tech_interview"
  | "test_task"
  | "final_interview"
  | "offer"
  | "rejected"
  | "accepted";

export type InterviewFormat = "online" | "offline" | "phone";

export type OfferStatus = "active" | "accepted" | "declined" | "expired";

export type RemoteFormat = "remote" | "hybrid" | "office";

export interface User {
  id: number;
  email: string;
}

export interface Vacancy {
  id: number;
  user_id: number;
  title: string;
  company: string;
  link: string | null;
  description: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string | null;
  location: string | null;
  work_format: WorkFormat;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  user_id: number;
  vacancy_id: number;
  status: ApplicationStatus;
  source: string | null;
  applied_date: string | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: number;
  user_id: number;
  application_id: number;
  stage: string;
  scheduled_at: string;
  format: InterviewFormat;
  interviewer_name: string | null;
  result: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: number;
  user_id: number;
  application_id: number;
  salary: string | null;
  currency: string | null;
  bonus: string | null;
  probation_months: number | null;
  vacation_days: number | null;
  remote_format: RemoteFormat | null;
  schedule: string | null;
  stack: string | null;
  grade: string | null;
  location: string | null;
  relocation_support: boolean | null;
  insurance: boolean | null;
  additional_benefits: string | null;
  notes: string | null;
  offer_date: string | null;
  deadline_date: string | null;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  user_id: number;
  vacancy_id: number | null;
  application_id: number | null;
  interview_id: number | null;
  title: string;
  text: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardSummary {
  vacancies_count: number;
  applications_count: number;
  interviews_count: number;
  offers_count: number;
  rejections_count: number;
  conversion: {
    applications_to_interviews: number;
    interviews_to_offers: number;
    applications_to_offers: number;
  };
  upcoming_interviews: Interview[];
  active_offers: Offer[];
  recent_notes: Note[];
}

export interface ComparisonWeights {
  weight_salary: number;
  weight_bonus: number;
  weight_remote: number;
  weight_vacation: number;
  weight_insurance: number;
  weight_relocation: number;
}

export interface CriterionBreakdown {
  salary_score: number;
  bonus_score: number;
  remote_score: number;
  vacation_score: number;
  insurance_score: number;
  relocation_score: number;
}

export interface OfferScoreRow {
  offer_id: number;
  company: string;
  vacancy_title: string;
  score: number;
  breakdown: CriterionBreakdown;
}

export interface OfferComparisonResponse {
  weights: ComparisonWeights;
  rows: OfferScoreRow[];
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
