-- =============================================================
-- Poloko IKS — Initial Database Schema
-- Migration: 001_initial_schema
-- =============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;     -- Geospatial support

-- =============================================================
-- PROFILES
-- Extends Supabase auth.users with application-level fields
-- =============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  role          TEXT NOT NULL DEFAULT 'community_member'
                  CHECK (role IN ('community_member', 'researcher', 'elder', 'admin')),
  community     TEXT,
  verified      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, community)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'community_member'),
    NEW.raw_user_meta_data->>'community'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- KNOWLEDGE ENTRIES (Module 1)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.knowledge_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL
                    CHECK (category IN (
                      'traditional_practice',
                      'flora_medicinal',
                      'conservation',
                      'cultural_narrative',
                      'resource_location'
                    )),
  access_tier     TEXT NOT NULL DEFAULT 'public'
                    CHECK (access_tier IN ('public', 'restricted', 'sacred')),
  language        TEXT NOT NULL DEFAULT 'en'
                    CHECK (language IN ('en', 'tn')),
  submitted_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sha256_hash     TEXT NOT NULL,
  latitude        DECIMAL(10,8),
  longitude       DECIMAL(11,8),
  tags            TEXT[] DEFAULT '{}',
  media_urls      TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent hash from being modified after insertion (Biopiracy Shield)
CREATE OR REPLACE FUNCTION public.prevent_hash_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sha256_hash <> OLD.sha256_hash THEN
    RAISE EXCEPTION 'sha256_hash is immutable and cannot be changed after submission.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER immutable_knowledge_hash
  BEFORE UPDATE ON public.knowledge_entries
  FOR EACH ROW EXECUTE FUNCTION public.prevent_hash_update();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER knowledge_updated_at
  BEFORE UPDATE ON public.knowledge_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================================
-- ACCESS REQUESTS (Tiered access control)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.access_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id        UUID NOT NULL REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  requester_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  approver_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'denied')),
  justification   TEXT,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entry_id, requester_id)   -- One request per user per entry
);

-- =============================================================
-- RESEARCH LISTINGS (Module 2)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.research_listings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  abstract          TEXT,
  full_document_url TEXT,
  status            TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('published', 'draft', 'open_for_collaboration')),
  license_type      TEXT CHECK (license_type IN (
                      'cc_by', 'cc_by_sa', 'odc_by', 'commercial', 'custom'
                    )),
  license_terms     JSONB,
  price             DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  author_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sha256_hash       TEXT NOT NULL,
  view_count        INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
  download_count    INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0),
  tags              TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER research_updated_at
  BEFORE UPDATE ON public.research_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Immutable hash for research listings too
CREATE TRIGGER immutable_research_hash
  BEFORE UPDATE ON public.research_listings
  FOR EACH ROW EXECUTE FUNCTION public.prevent_hash_update();

-- =============================================================
-- RESEARCH COLLABORATORS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.research_collaborators (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id        UUID NOT NULL REFERENCES public.research_listings(id) ON DELETE CASCADE,
  collaborator_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contribution      TEXT,
  credit_share      DECIMAL(5,2) CHECK (credit_share > 0 AND credit_share < 100),
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(listing_id, collaborator_id)
);

-- =============================================================
-- AUDIT LOGS (Attribution Tracking)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL
                  CHECK (action IN ('view', 'download', 'cite', 'api_access', 'submit', 'verify')),
  target_type   TEXT NOT NULL
                  CHECK (target_type IN ('knowledge_entry', 'research_listing')),
  target_id     UUID NOT NULL,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs are append-only — no updates or deletes
CREATE OR REPLACE RULE audit_no_update AS ON UPDATE TO public.audit_logs DO INSTEAD NOTHING;
CREATE OR REPLACE RULE audit_no_delete AS ON DELETE TO public.audit_logs DO INSTEAD NOTHING;

-- =============================================================
-- API KEYS (Research API)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.api_keys (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash      TEXT UNIQUE NOT NULL,
  owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id    UUID REFERENCES public.research_listings(id) ON DELETE SET NULL,
  label         TEXT,
  usage_count   INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- INDEXES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_category ON public.knowledge_entries(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_access_tier ON public.knowledge_entries(access_tier);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_submitted_by ON public.knowledge_entries(submitted_by);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_created_at ON public.knowledge_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_listings_author_id ON public.research_listings(author_id);
CREATE INDEX IF NOT EXISTS idx_research_listings_status ON public.research_listings(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_entry_id ON public.access_requests(entry_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_requester ON public.access_requests(requester_id);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

-- ── PROFILES ──
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_read_all_for_admin" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'elder'))
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- ── KNOWLEDGE ENTRIES ──
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;

-- Public entries: everyone can read
CREATE POLICY "ke_public_readable" ON public.knowledge_entries
  FOR SELECT USING (access_tier = 'public');

-- Restricted entries: only approved requesters
CREATE POLICY "ke_restricted_approved" ON public.knowledge_entries
  FOR SELECT USING (
    access_tier = 'restricted'
    AND (
      submitted_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.access_requests ar
        WHERE ar.entry_id = id
          AND ar.requester_id = auth.uid()
          AND ar.status = 'approved'
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'elder')
      )
    )
  );

-- Sacred entries: only elder/admin approved access
CREATE POLICY "ke_sacred_elder_approved" ON public.knowledge_entries
  FOR SELECT USING (
    access_tier = 'sacred'
    AND (
      submitted_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.access_requests ar
        JOIN public.profiles approver ON approver.id = ar.approver_id
        WHERE ar.entry_id = id
          AND ar.requester_id = auth.uid()
          AND ar.status = 'approved'
          AND approver.role IN ('elder', 'admin')
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'elder')
      )
    )
  );

-- Authenticated users can insert
CREATE POLICY "ke_authenticated_insert" ON public.knowledge_entries
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Authors and admins can update
CREATE POLICY "ke_author_update" ON public.knowledge_entries
  FOR UPDATE USING (
    submitted_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── RESEARCH LISTINGS ──
ALTER TABLE public.research_listings ENABLE ROW LEVEL SECURITY;

-- Non-draft listings are publicly readable
CREATE POLICY "rl_published_readable" ON public.research_listings
  FOR SELECT USING (
    status != 'draft'
    OR author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Researchers can insert their own listings
CREATE POLICY "rl_researcher_insert" ON public.research_listings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('researcher', 'admin')
    )
  );

-- Authors and admins can update
CREATE POLICY "rl_author_update" ON public.research_listings
  FOR UPDATE USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── ACCESS REQUESTS ──
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ar_requester_own" ON public.access_requests
  FOR SELECT USING (requester_id = auth.uid());

CREATE POLICY "ar_approver_view_pending" ON public.access_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('elder', 'admin'))
  );

CREATE POLICY "ar_authenticated_insert" ON public.access_requests
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "ar_approver_update" ON public.access_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('elder', 'admin'))
  );

-- ── RESEARCH COLLABORATORS ──
ALTER TABLE public.research_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rc_listing_readable" ON public.research_collaborators
  FOR SELECT USING (true);  -- Collaborators are publicly visible

CREATE POLICY "rc_authenticated_insert" ON public.research_collaborators
  FOR INSERT WITH CHECK (collaborator_id = auth.uid());

-- ── AUDIT LOGS ──
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "al_owner_readable" ON public.audit_logs
  FOR SELECT USING (
    -- Can see logs for content you own
    EXISTS (
      SELECT 1 FROM public.knowledge_entries ke
      WHERE ke.id = target_id AND ke.submitted_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.research_listings rl
      WHERE rl.id = target_id AND rl.author_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "al_authenticated_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true);  -- Any authenticated or anonymous action can be logged

-- ── API KEYS ──
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ak_owner_readable" ON public.api_keys
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "ak_owner_insert" ON public.api_keys
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "ak_owner_update" ON public.api_keys
  FOR UPDATE USING (owner_id = auth.uid());
