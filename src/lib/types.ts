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

// ─── Supabase Database schema type map ───────────────────────────────────────
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      knowledge_entries: { Row: KnowledgeEntry; Insert: Partial<KnowledgeEntry>; Update: Partial<KnowledgeEntry> }
      access_requests: { Row: AccessRequest; Insert: Partial<AccessRequest>; Update: Partial<AccessRequest> }
      research_listings: { Row: ResearchListing; Insert: Partial<ResearchListing>; Update: Partial<ResearchListing> }
      research_collaborators: { Row: ResearchCollaborator; Insert: Partial<ResearchCollaborator>; Update: Partial<ResearchCollaborator> }
      audit_logs: { Row: AuditLog; Insert: Partial<AuditLog>; Update: Partial<AuditLog> }
      api_keys: { Row: ApiKey; Insert: Partial<ApiKey>; Update: Partial<ApiKey> }
    }
  }
}
