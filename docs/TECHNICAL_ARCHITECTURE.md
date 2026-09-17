# Technical Architecture Document
## Poloko IKS — Indigenous Knowledge Vault & Research Innovation System
**Version:** 1.0.0  
**Date:** September 17, 2026  

---

## 1. Technology Stack Decision

Given the 2-day hackathon constraint, the following stack was selected for **maximum velocity, open-source compliance, and production viability**:

### Chosen Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React + Next.js 14 (App Router) | SSR/SSG for SEO and fast load; API routes eliminate a separate backend for prototype; large ecosystem; team familiarity assumed |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid, accessible UI composition without custom CSS overhead |
| **Backend / BaaS** | Supabase | Provides PostgreSQL, Auth, Storage, RLS, Realtime, and Edge Functions — entire backend in one open-source platform; eliminates need to build separate auth/storage services |
| **Database** | PostgreSQL (via Supabase) | Relational integrity; PostGIS for geo-tagged assets; RLS for tiered access control; pgvector ready for future semantic search |
| **File Storage** | Supabase Storage | S3-compatible open-source object storage; handles documents, images, audio; no MinIO setup overhead for prototype |
| **Mapping** | Leaflet.js + OpenStreetMap | Open-source, no API key required, excellent Botswana coverage |
| **API Layer** | Next.js API Routes (prototype) → FastAPI (post-hackathon) | Next.js API routes are sufficient for prototype speed; FastAPI recommended for production data processing pipelines |
| **Authentication** | Supabase Auth (email + magic link) | Built-in, JWT-based, integrates with RLS natively |
| **Cryptographic Hashing** | Web Crypto API (SHA-256, client + server) | Native, no dependencies; generates immutable proof-of-prior-art hashes |
| **Offline Support** | Next.js PWA (next-pwa) | Service worker caching for offline-first rural access |

### What Was Excluded and Why

| Excluded | Reason |
|---|---|
| Flutter | Prototype is web-first; Flutter adds mobile complexity not achievable in 2 days |
| MinIO | Supabase Storage covers all prototype storage needs without infra setup |
| Separate FastAPI backend | Next.js API routes provide equivalent functionality for prototype scale |
| Blockchain anchoring | Supabase immutable hash records are sufficient for prototype; on-chain anchoring is a post-hackathon upgrade |

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│         Next.js 14 App Router (React)                   │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───┐ │
│   │  Module 1  │  │  Module 2  │  │  Module 3  │  │Shr│ │
│   │  Knowledge │  │  Research  │  │  Learning  │  │ ed│ │
│   │  Vault UI  │  │  Hub UI    │  │  Hub UI    │  │UI │ │
│   └────────────┘  └────────────┘  └────────────┘  └───┘ │
│         │                  │              │          │   │
│   ┌─────────────────────────────────────────────────┐   │
│   │           Next.js API Routes (/api/*)            │   │
│   │  - /api/knowledge  - /api/research               │   │
│   │  - /api/map        - /api/licensing              │   │
│   │  - /api/hash       - /api/audit                  │   │
│   │  - /api/courses    - /api/lessons                │   │
│   │  - /api/enrollments                              │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS / Supabase Client SDK
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE PLATFORM                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │ PostgreSQL │  │  Supabase  │  │  Supabase Storage  │ │
│  │ + PostGIS  │  │    Auth    │  │  (Docs/Images/     │ │
│  │ + RLS      │  │  (JWT)     │  │   Video URLs/      │ │
│  └────────────┘  └────────────┘  │   Course Media)    │ │
│  ┌────────────┐  ┌────────────┐  └────────────────────┘ │
│  │ Realtime   │  │   Edge     │                          │
│  │ (Collab)   │  │ Functions  │                          │
│  └────────────┘  └────────────┘                          │
└─────────────────────────────────────────────────────────┘
                          │
             ┌────────────┴────────────┐
             │                         │
             ▼                         ▼
┌─────────────────────┐   ┌──────────────────────────────┐
│  OpenStreetMap      │   │  External Research API        │
│  + Leaflet.js       │   │  (Next.js API Routes +        │
│  (Geo Mapping)      │   │   API Key Auth)               │
└─────────────────────┘   └──────────────────────────────┘
```

---

## 3. Database Schema

### 3.1 Core Tables

```sql
-- Users (managed by Supabase Auth, extended here)
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name     TEXT,
  role          TEXT CHECK (role IN ('community_member','researcher','elder','admin')),
  community     TEXT,
  verified      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Entries (Module 1)
CREATE TABLE knowledge_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT CHECK (category IN (
                    'traditional_practice','flora_medicinal',
                    'conservation','cultural_narrative','resource_location'
                  )),
  access_tier     TEXT CHECK (access_tier IN ('public','restricted','sacred')) DEFAULT 'public',
  language        TEXT CHECK (language IN ('en','tn')) DEFAULT 'en',
  submitted_by    UUID REFERENCES profiles(id),
  verified        BOOLEAN DEFAULT FALSE,
  verified_by     UUID REFERENCES profiles(id),
  sha256_hash     TEXT NOT NULL,           -- Biopiracy shield
  latitude        DECIMAL(10,8),
  longitude       DECIMAL(11,8),
  tags            TEXT[],
  media_urls      TEXT[],
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Access Requests (for Restricted/Sacred entries)
CREATE TABLE access_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id        UUID REFERENCES knowledge_entries(id),
  requester_id    UUID REFERENCES profiles(id),
  approver_id     UUID REFERENCES profiles(id),
  status          TEXT CHECK (status IN ('pending','approved','denied')) DEFAULT 'pending',
  justification   TEXT,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Research Listings (Module 2)
CREATE TABLE research_listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  abstract        TEXT,
  full_document_url TEXT,
  status          TEXT CHECK (status IN ('published','draft','open_for_collaboration')) DEFAULT 'draft',
  license_type    TEXT CHECK (license_type IN ('cc_by','cc_by_sa','odc_by','commercial','custom')),
  license_terms   JSONB,                   -- Custom commercial terms stored here
  price           DECIMAL(10,2) DEFAULT 0, -- 0 = free/open license
  author_id       UUID REFERENCES profiles(id),
  sha256_hash     TEXT NOT NULL,
  view_count      INTEGER DEFAULT 0,
  download_count  INTEGER DEFAULT 0,
  tags            TEXT[],
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Research Collaborators
CREATE TABLE research_collaborators (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      UUID REFERENCES research_listings(id),
  collaborator_id UUID REFERENCES profiles(id),
  contribution    TEXT,
  credit_share    DECIMAL(5,2),            -- Percentage of credit
  joined_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Audit / Attribution Log
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        UUID REFERENCES profiles(id),
  action          TEXT NOT NULL,           -- 'view','download','cite','api_access'
  target_type     TEXT NOT NULL,           -- 'knowledge_entry','research_listing'
  target_id       UUID NOT NULL,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys (Research API)
CREATE TABLE api_keys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash        TEXT UNIQUE NOT NULL,    -- Hashed API key stored, never plaintext
  owner_id        UUID REFERENCES profiles(id),
  listing_id      UUID REFERENCES research_listings(id),
  label           TEXT,
  usage_count     INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Module 3 Tables — Learning Hub

```sql
-- Courses (Module 3)
-- A course is a structured collection of lessons created by a content creator.
-- Must be approved by the Elder Board before it is publicly visible.
CREATE TABLE courses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  subtitle          TEXT,
  description       TEXT,
  category          TEXT CHECK (category IN (
                      'traditional_crafts','culinary_heritage',
                      'cultural_arts','natural_building',
                      'ecological_practices','modern_fusion'
                    )),
  skill_level       TEXT CHECK (skill_level IN ('beginner','intermediate','advanced'))
                      DEFAULT 'beginner',
  language          TEXT CHECK (language IN ('en','tn')) DEFAULT 'en',
  creator_id        UUID REFERENCES profiles(id),
  cover_image_url   TEXT,
  preview_video_url TEXT,                   -- Short teaser clip, free to view
  price_bwp         DECIMAL(10,2) DEFAULT 0, -- 0 = free
  status            TEXT CHECK (status IN (
                      'draft','pending_review','approved','rejected'
                    )) DEFAULT 'draft',
  rejection_note    TEXT,                   -- Elder Board feedback if rejected
  reviewed_by       UUID REFERENCES profiles(id), -- Elder who approved/rejected
  reviewed_at       TIMESTAMPTZ,
  enrolment_count   INTEGER DEFAULT 0,
  rating_avg        DECIMAL(3,2) DEFAULT 0,
  sha256_hash       TEXT NOT NULL,          -- Tamper-proof record of course syllabus
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons (belong to a course, ordered)
CREATE TABLE lessons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID REFERENCES courses(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  content_type    TEXT CHECK (content_type IN ('video','image_gallery','text'))
                    DEFAULT 'video',
  video_url       TEXT,                     -- External URL (YouTube embed for prototype)
  image_urls      TEXT[],                   -- Array of image URLs for gallery lessons
  text_content    TEXT,                     -- Markdown/plain text for text lessons
  materials_list  TEXT[],                   -- e.g. ['Mokola palm fronds','Natural dye']
  duration_mins   INTEGER,                  -- Estimated lesson duration
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT FALSE,    -- First lesson often free for paid courses
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Course Enrolments (tracks which users enrolled and their progress)
CREATE TABLE course_enrolments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id           UUID REFERENCES courses(id),
  learner_id          UUID REFERENCES profiles(id),
  enrolled_at         TIMESTAMPTZ DEFAULT NOW(),
  completed_lesson_ids UUID[],              -- Array of completed lesson IDs
  completed_at        TIMESTAMPTZ,          -- Set when all lessons completed
  UNIQUE(course_id, learner_id)
);

-- Media Items (standalone video/image demos, not part of a course)
CREATE TABLE media_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT,                     -- Same category list as courses
  content_type    TEXT CHECK (content_type IN ('video','image_gallery')),
  video_url       TEXT,
  image_urls      TEXT[],
  creator_id      UUID REFERENCES profiles(id),
  view_count      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.4 Module 3 RLS Policies

```sql
-- Only approved courses are visible to the public
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "approved_courses_public" ON courses
  FOR SELECT USING (status = 'approved');

-- Creators can see their own courses at any status
CREATE POLICY "creator_sees_own_courses" ON courses
  FOR SELECT USING (creator_id = auth.uid());

-- Elders and admins can see all courses (for review)
CREATE POLICY "elder_admin_sees_all_courses" ON courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin','elder')
    )
  );

-- Lessons: visible if enrolled or course is free or lesson is free_preview
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "free_preview_lessons_public" ON lessons
  FOR SELECT USING (is_free_preview = TRUE);

CREATE POLICY "enrolled_lessons_visible" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_enrolments ce
      JOIN courses c ON c.id = ce.course_id
      WHERE ce.course_id = lessons.course_id
        AND ce.learner_id = auth.uid()
    )
  );

CREATE POLICY "free_course_lessons_visible" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses c
      WHERE c.id = lessons.course_id
        AND c.price_bwp = 0
        AND c.status = 'approved'
    )
  );
```

### 3.2 Row-Level Security Policies (Key Policies)

```sql
-- Knowledge entries: public entries visible to all; restricted/sacred blocked by default
ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_entries_visible" ON knowledge_entries
  FOR SELECT USING (access_tier = 'public');

CREATE POLICY "restricted_entries_approved_only" ON knowledge_entries
  FOR SELECT USING (
    access_tier = 'restricted' AND
    EXISTS (
      SELECT 1 FROM access_requests ar
      WHERE ar.entry_id = id
        AND ar.requester_id = auth.uid()
        AND ar.status = 'approved'
    )
  );

CREATE POLICY "sacred_entries_elder_approved_only" ON knowledge_entries
  FOR SELECT USING (
    access_tier = 'sacred' AND
    EXISTS (
      SELECT 1 FROM access_requests ar
      JOIN profiles p ON p.id = ar.approver_id
      WHERE ar.entry_id = id
        AND ar.requester_id = auth.uid()
        AND ar.status = 'approved'
        AND p.role IN ('elder','admin')
    )
  );

-- Admins and elders can see all
CREATE POLICY "admin_elder_see_all" ON knowledge_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin','elder')
    )
  );
```

---

## 4. Application Structure (Next.js)

```
poloko/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (public)/
│   │   ├── page.tsx              # Landing page
│   │   ├── vault/
│   │   │   ├── page.tsx          # Knowledge search & browse
│   │   │   └── [id]/page.tsx     # Knowledge entry detail
│   │   ├── map/page.tsx          # Interactive resource map
│   │   └── learn/                # Module 3 — Learning Hub (public)
│   │       ├── page.tsx          # Course catalogue + media gallery
│   │       └── [courseId]/
│   │           ├── page.tsx      # Course detail (public — pre-enrolment)
│   │           └── lesson/
│   │               └── [lessonId]/page.tsx  # Lesson view (enrolled learners)
│   ├── (protected)/
│   │   ├── submit/page.tsx       # Submit knowledge entry
│   │   ├── dashboard/page.tsx    # User dashboard
│   │   ├── research/
│   │   │   ├── page.tsx          # Research marketplace
│   │   │   ├── [id]/page.tsx     # Research listing detail
│   │   │   ├── new/page.tsx      # Publish new research
│   │   │   └── collaborate/[id]/page.tsx
│   │   ├── access-requests/page.tsx
│   │   ├── audit/page.tsx        # Attribution audit log
│   │   └── create/               # Module 3 — creator tools (protected)
│   │       ├── page.tsx          # My courses dashboard
│   │       ├── new/page.tsx      # Create new course
│   │       └── [courseId]/
│   │           ├── edit/page.tsx         # Edit course details
│   │           └── lessons/new/page.tsx  # Add lesson to course
│   ├── api/
│   │   ├── knowledge/route.ts
│   │   ├── research/route.ts
│   │   ├── hash/route.ts         # SHA-256 hash generation
│   │   ├── access/route.ts
│   │   ├── audit/route.ts
│   │   ├── courses/route.ts      # Module 3 — course CRUD
│   │   ├── lessons/route.ts      # Module 3 — lesson CRUD
│   │   ├── enrolments/route.ts   # Module 3 — enrol in course
│   │   └── v1/                   # External Research API
│   │       └── datasets/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                       # shadcn/ui base components
│   ├── vault/                    # Module 1 components
│   │   ├── KnowledgeCard.tsx
│   │   ├── KnowledgeForm.tsx
│   │   ├── AccessTierBadge.tsx
│   │   └── VerificationBadge.tsx
│   ├── research/                 # Module 2 components
│   │   ├── ResearchCard.tsx
│   │   ├── LicenseSelector.tsx
│   │   ├── CollaboratorPanel.tsx
│   │   └── AuditLogTable.tsx
│   ├── learning/                 # Module 3 components
│   │   ├── CourseCard.tsx        # Catalogue grid card
│   │   ├── CourseCatalogue.tsx   # Filterable course grid
│   │   ├── CourseHero.tsx        # Course detail hero section
│   │   ├── LessonList.tsx        # Ordered lesson sidebar/list
│   │   ├── LessonPlayer.tsx      # Video + image gallery player
│   │   ├── ElderApprovalBadge.tsx# "Elder Board Approved" badge
│   │   ├── EnrolButton.tsx       # Enrol / Start course CTA
│   │   ├── ProgressTracker.tsx   # Lesson completion progress
│   │   ├── MediaGallery.tsx      # Standalone media item grid
│   │   └── CreatorProfile.tsx    # Creator bio card
│   ├── map/
│   │   └── ResourceMap.tsx       # Leaflet.js map component
│   └── shared/
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       └── HashDisplay.tsx       # SHA-256 proof display
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server-side Supabase client
│   ├── hash.ts                   # SHA-256 utility
│   ├── types.ts                  # TypeScript interfaces
│   └── constants.ts
├── docs/
│   ├── SRD.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   └── API_REFERENCE.md
├── public/
│   └── locales/
│       ├── en.json               # English UI strings
│       └── tn.json               # Setswana UI strings
├── .env.local.example
├── README.md
└── package.json
```

---

## 5. Security Architecture

### 5.1 Authentication Flow
```
User → Supabase Auth (email/magic link) → JWT issued
     → JWT attached to all API requests
     → Supabase RLS evaluates auth.uid() on every query
     → Next.js middleware validates session server-side
```

### 5.2 Biopiracy Shield (SHA-256 Hashing)
```
User uploads content
     → Client computes SHA-256 hash of raw file bytes (Web Crypto API)
     → Hash + timestamp stored in knowledge_entries.sha256_hash
     → Original file stored in Supabase Storage
     → Hash record is immutable (no UPDATE policy on hash column)
     → Serves as timestamped proof of prior art
```

### 5.3 API Key Authentication
```
Researcher creates API key
     → Server generates random 32-byte token
     → SHA-256 hash of token stored in api_keys.key_hash (never plaintext)
     → Token returned ONCE to researcher
     → External requests: Bearer <token> in Authorization header
     → Server hashes incoming token → matches against stored hash
     → All API access logged in audit_logs
```

---

## 6. Mapping Architecture

```
ResourceMap.tsx (React Component)
     → Leaflet.js renders OpenStreetMap tiles
     → Knowledge entries with lat/lng loaded from Supabase
     → Markers colored by access_tier:
         🟢 Public   → Green marker
         🟡 Restricted → Yellow marker (coordinates blurred ±0.01°)
         🔴 Sacred   → Red marker (exact location hidden; region only)
     → Clicking a marker opens a popup with entry summary + access request button
```

---

## 7. Offline-First Strategy

- **next-pwa** generates a service worker that caches the app shell and recent knowledge entries.
- Knowledge submissions captured offline are stored in **IndexedDB** via a lightweight queue.
- On reconnection, the queue is flushed to Supabase via the API layer.
- Map tiles for Botswana regions are pre-cached for offline viewing.

---

## 8. Deployment Architecture (Prototype)

```
Developer pushes to GitHub
     → Vercel auto-deploys Next.js application
     → Environment variables (Supabase URL/keys) configured in Vercel dashboard
     → Supabase project hosted on Supabase Cloud (free tier)
     → Domain: poloko-iks.vercel.app (prototype)
```

### Post-Hackathon Production Path
- Self-hosted Supabase on a Botswana / SADC-region VPS for data sovereignty
- Nginx reverse proxy + Docker Compose deployment
- FastAPI microservice for heavy data processing pipelines
- On-chain SHA-256 anchoring via a lightweight blockchain integration

---

## 9. Hackathon Prototype Scope (1-Day Sprint Plan)

> **Strategy:** Build the learner-facing experience for Module 3 — the course catalogue, course detail page, and lesson view — using seed/mock data so it demos beautifully even without a full creator flow. Elder approval badge is displayed as static UI for prototype.

### Hour 0–3 — Foundation
| # | Task |
|---|---|
| 1 | Project scaffold + Supabase setup + Auth |
| 2 | Database schema (all 3 modules) + RLS policies |
| 3 | Seed data: 4–6 courses with lessons, creators, cover images |

### Hour 3–8 — Module 1 Core
| # | Task |
|---|---|
| 4 | Knowledge submission form + SHA-256 hashing |
| 5 | Knowledge vault browse + search page |
| 6 | Interactive map + access tier system |

### Hour 8–14 — Module 3 Learner UI (Demo Priority)
| # | Task |
|---|---|
| 7 | Course catalogue page — filterable grid with `CourseCard` components |
| 8 | Course detail page — hero, Elder approval badge, lesson list, enrol button |
| 9 | Lesson view page — video embed/image gallery, text notes, materials list, progress |
| 10 | Media gallery — standalone demo videos/images |

### Hour 14–18 — Module 2 Core
| # | Task |
|---|---|
| 11 | Research listing publish + license selector |
| 12 | Research marketplace browse page |
| 13 | Audit log / attribution tracking dashboard |

### Hour 18–24 — Polish & Demo Prep
| # | Task |
|---|---|
| 14 | Dashboard (all 3 modules surfaced) |
| 15 | Landing page with all 3 modules showcased |
| 16 | Navbar updated with Learning Hub link |
| 17 | Seed more demo data for realistic demo |
| 18 | Final QA pass + Vercel deployment |

### Module 3 Demo Flow (What Judges Will See)
1. Land on `/learn` — warm course catalogue with 4–6 Elder-approved traditional skills courses
2. Click *"Traditional Tswana Basket Weaving"* → course detail page with Elder Board Approved badge, creator bio, lesson list, BWP price, Enrol button
3. Click *"Preview First Lesson Free"* → lesson view with video, step-by-step text, materials list
4. Show *"Decoration in Modern Style Using Traditional Items"* course — demonstrates the modern fusion category
5. Show the Elder Board Approved badge and explain the approval flow

---

*Document maintained by: Poloko IKS Core Team*
