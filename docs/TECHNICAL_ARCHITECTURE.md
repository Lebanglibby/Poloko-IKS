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
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│   │  Module 1    │  │  Module 2    │  │   Shared     │ │
│   │  Knowledge   │  │  Research    │  │   Auth/UI    │ │
│   │  Vault UI    │  │  Hub UI      │  │   Components │ │
│   └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │          │
│   ┌─────────────────────────────────────────────────┐   │
│   │           Next.js API Routes (/api/*)            │   │
│   │  - /api/knowledge  - /api/research               │   │
│   │  - /api/map        - /api/licensing              │   │
│   │  - /api/hash       - /api/audit                  │   │
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
│  │ + RLS      │  │  (JWT)     │  │   Audio Assets)    │ │
│  └────────────┘  └────────────┘  └────────────────────┘ │
│  ┌────────────┐  ┌────────────┐                          │
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
│   │   └── map/page.tsx          # Interactive resource map
│   ├── (protected)/
│   │   ├── submit/page.tsx       # Submit knowledge entry
│   │   ├── dashboard/page.tsx    # User dashboard
│   │   ├── research/
│   │   │   ├── page.tsx          # Research marketplace
│   │   │   ├── [id]/page.tsx     # Research listing detail
│   │   │   ├── new/page.tsx      # Publish new research
│   │   │   └── collaborate/[id]/page.tsx
│   │   ├── access-requests/page.tsx
│   │   └── audit/page.tsx        # Attribution audit log
│   ├── api/
│   │   ├── knowledge/route.ts
│   │   ├── research/route.ts
│   │   ├── hash/route.ts         # SHA-256 hash generation
│   │   ├── access/route.ts
│   │   ├── audit/route.ts
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
├── docs/                         # Project documentation
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

## 9. Hackathon Prototype Scope (48-hour Build Plan)

### Day 1 (Hours 0–24)
| # | Feature | Module |
|---|---|---|
| 1 | Project scaffold + Supabase setup + Auth | Shared |
| 2 | Database schema + RLS policies | Shared |
| 3 | Knowledge submission form + SHA-256 hashing | Module 1 |
| 4 | Knowledge vault browse + search page | Module 1 |
| 5 | Interactive map with OpenStreetMap + Leaflet | Module 1 |

### Day 2 (Hours 24–48)
| # | Feature | Module |
|---|---|---|
| 6 | Access tiers + access request flow | Module 1 |
| 7 | Research listing publish + license selector | Module 2 |
| 8 | Research marketplace browse page | Module 2 |
| 9 | Audit log / attribution tracking dashboard | Module 2 |
| 10 | Dashboard + polish + demo data seed | Shared |

---

*Document maintained by: Poloko IKS Core Team*
