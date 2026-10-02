export type Role = "CITIZEN" | "MUNICIPAL_MEMBER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  department_id?: number | null;
  department?: string | null;
}

export interface MediaItem {
  id: number;
  media_type: "image" | "video";
  media_role: string;
  url: string;
  thumbnail_url: string | null;
  created_at: string;
  analysis?: { issue_type: string; severity: string; confidence: number; description: string } | null;
}

export interface TimelineEvent {
  id: number;
  event_type: string;
  title: string;
  detail: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  media_type: string | null;
  actor_name: string | null;
  created_at: string;
}

export interface Verification {
  id: number;
  ai_result: string;
  ai_confidence: number;
  ai_summary: string | null;
  citizen_result: string | null;
  final_status: string;
}

export interface Incident {
  id: number;
  incident_code: string;
  issue_type: string;
  severity: string;
  priority_score: number;
  priority_level: string;
  priority_locked: boolean;
  status: string;
  latitude: number;
  longitude: number;
  street_name: string;
  street_slug: string;
  description: string | null;
  department: { id: number; name: string } | null;
  assigned_user: { id: number; name: string } | null;
  due_date: string | null;
  report_count: number;
  first_reported_at: string;
  recurring: boolean;
  recurrence_count: number;
  thumbnail_url: string | null;
  // detail only
  priority_reasons?: string[];
  reports?: { id: number; user_id: number; user_name: string; description: string | null; created_at: string }[];
  media?: MediaItem[];
  timeline?: TimelineEvent[];
  verification?: Verification | null;
  before?: MediaItem | null;
  after?: MediaItem | null;
}

export interface Analysis {
  media_id: number;
  issue_type: string;
  severity: string;
  confidence: number;
  description: string;
  source: string;
}
