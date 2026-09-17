// ─── Supabase Database Types ─────────────────────────────────────────────────

export type AccessTier = 'public' | 'restricted' | 'sacred'
export type KnowledgeCategory =
  | 'traditional_practice'
  | 'flora_medicinal'
  | 'conservation'
  | 'cultural_narrative'
  | 'resource_location'

export type UserRole = 'community_member' | 'researcher' | 'elder' | 'admin'
export type Language = 'en' | 'tn'
export type RequestStatus = 'pending' | 'approved' | 'denied'
export type ListingStatus = 'published' | 'draft' | 'open_for_collaboration'
export type LicenseType = 'cc_by' | 'cc_by_sa' | 'odc_by' | 'commercial' | 'custom'
export type AuditAction = 'view' | 'download' | 'cite' | 'api_access' | 'submit' | 'verify'

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  community: string | null
  verified: boolean
  created_at: string
}

export interface KnowledgeEntry {
  id: string
  title: string
  description: string | null
  category: KnowledgeCategory
  access_tier: AccessTier
  language: Language
  submitted_by: string | null
  verified: boolean
  verified_by: string | null
  sha256_hash: string
  latitude: number | null
  longitude: number | null
  tags: string[] | null
  media_urls: string[] | null
  created_at: string
  updated_at: string
  // Joined fields
  profiles?: Pick<Profile, 'full_name' | 'community'>
}

export interface AccessRequest {
  id: string
  entry_id: string
  requester_id: string
  approver_id: string | null
  status: RequestStatus
  justification: string | null
  reviewed_at: string | null
  created_at: string
  // Joined
  knowledge_entries?: Pick<KnowledgeEntry, 'title' | 'access_tier'>
  profiles?: Pick<Profile, 'full_name'>
}

export interface ResearchListing {
  id: string
  title: string
  abstract: string | null
  full_document_url: string | null
  status: ListingStatus
  license_type: LicenseType | null
  license_terms: Record<string, unknown> | null
  price: number
  author_id: string
  sha256_hash: string
  view_count: number
  download_count: number
  tags: string[] | null
  created_at: string
  updated_at: string
  // Joined
  profiles?: Pick<Profile, 'full_name' | 'community'>
  collaborators?: ResearchCollaborator[]
}

export interface ResearchCollaborator {
  id: string
  listing_id: string
  collaborator_id: string
  contribution: string | null
  credit_share: number | null
  joined_at: string
  profiles?: Pick<Profile, 'full_name'>
}

export interface AuditLog {
  id: string
  actor_id: string | null
  action: AuditAction
  target_type: 'knowledge_entry' | 'research_listing'
  target_id: string
  metadata: Record<string, unknown> | null
  created_at: string
  profiles?: Pick<Profile, 'full_name'>
}

export interface ApiKey {
  id: string
  key_hash: string
  owner_id: string
  listing_id: string | null
  label: string | null
  usage_count: number
  is_active: boolean
  expires_at: string | null
  created_at: string
}

// ─── Module 3 — Learning Hub ─────────────────────────────────────────────────

export type CourseCategory =
  | 'traditional_crafts'
  | 'culinary_heritage'
  | 'cultural_arts'
  | 'natural_building'
  | 'ecological_practices'
  | 'modern_fusion'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'

export type CourseStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'

export type LessonContentType = 'video' | 'image_gallery' | 'text'

export interface Course {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  category: CourseCategory
  skill_level: SkillLevel
  language: Language
  creator_id: string
  cover_image_url: string | null
  preview_video_url: string | null
  price_bwp: number
  status: CourseStatus
  rejection_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  enrolment_count: number
  rating_avg: number
  sha256_hash: string
  created_at: string
  updated_at: string
  // Joined
  profiles?: Pick<Profile, 'full_name' | 'community'>
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string | null
  content_type: LessonContentType
  video_url: string | null
  image_urls: string[] | null
  text_content: string | null
  materials_list: string[] | null
  duration_mins: number | null
  sort_order: number
  is_free_preview: boolean
  created_at: string
}

export interface CourseEnrolment {
  id: string
  course_id: string
  learner_id: string
  enrolled_at: string
  completed_lesson_ids: string[]
  completed_at: string | null
}

export interface MediaItem {
  id: string
  title: string
  description: string | null
  category: CourseCategory | null
  content_type: 'video' | 'image_gallery'
  video_url: string | null
  image_urls: string[] | null
  creator_id: string
  view_count: number
  created_at: string
  // Joined
  profiles?: Pick<Profile, 'full_name' | 'community'>
}

// ─── Supabase Database schema type map ───────────────────────────────────────
export type Database = {
  public: {
    Tables: {
      profiles:               { Row: Profile;               Insert: Partial<Profile>;               Update: Partial<Profile>               }
      knowledge_entries:      { Row: KnowledgeEntry;        Insert: Partial<KnowledgeEntry>;        Update: Partial<KnowledgeEntry>        }
      access_requests:        { Row: AccessRequest;         Insert: Partial<AccessRequest>;         Update: Partial<AccessRequest>         }
      research_listings:      { Row: ResearchListing;       Insert: Partial<ResearchListing>;       Update: Partial<ResearchListing>       }
      research_collaborators: { Row: ResearchCollaborator;  Insert: Partial<ResearchCollaborator>;  Update: Partial<ResearchCollaborator>  }
      audit_logs:             { Row: AuditLog;              Insert: Partial<AuditLog>;              Update: Partial<AuditLog>              }
      api_keys:               { Row: ApiKey;                Insert: Partial<ApiKey>;                Update: Partial<ApiKey>                }
      courses:                { Row: Course;                Insert: Partial<Course>;                Update: Partial<Course>                }
      lessons:                { Row: Lesson;                Insert: Partial<Lesson>;                Update: Partial<Lesson>                }
      course_enrolments:      { Row: CourseEnrolment;       Insert: Partial<CourseEnrolment>;       Update: Partial<CourseEnrolment>       }
      media_items:            { Row: MediaItem;             Insert: Partial<MediaItem>;             Update: Partial<MediaItem>             }
    }
  }
}
