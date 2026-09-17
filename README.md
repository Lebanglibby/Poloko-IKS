
# 🌿 Poloko IKS
### Indigenous Knowledge Vault & Research Innovation System

> **Poloko** — *Setswana for "preservation" or "safeguarding"*

**Track 04:** Design technology that preserves, documents, and protects Botswana's indigenous knowledge systems and natural resources for future generations.

---

## What Is Poloko IKS?

Poloko IKS is an open-source web platform that digitizes, protects, and empowers innovation around Botswana's indigenous knowledge systems (IKS). It brings together two core modules:

- **Module 1 — The Knowledge Preservation Vault:** A searchable, public-good digital archive of traditional practices, native flora, and community conservation wisdom — with cryptographic protection against biopiracy.
- **Module 2 — The Researcher & Innovation Hub:** A marketplace and collaboration workspace where researchers publish, monetize, track usage of, and collaboratively refine studies derived from indigenous knowledge.

---

## The Problem We Solve

| Problem | Impact |
|---|---|
| Oral indigenous knowledge is disappearing with each generation | Irreversible loss of cultural and ecological heritage |
| No digital infrastructure to protect traditional knowledge from biopiracy | External entities exploit indigenous knowledge without attribution or compensation |
| Researchers have no platform to monetize or track their IKS-derived work | Lost economic opportunity for local scientists |
| Sacred/sensitive knowledge is either fully hidden or fully public | No middle ground — knowledge either lost or exposed |

---

## Key Features

### Module 1 — Knowledge Vault
- 📚 **Digital Heritage Archive** — Submit and browse traditional knowledge, plant properties, and conservation practices
- 🔐 **3-Tier Access Control** — Public / Restricted / Sacred classification with PostgreSQL RLS enforcement
- 🛡️ **Biopiracy Shield** — SHA-256 cryptographic hash generated on every upload as immutable proof of prior art
- 🗺️ **Interactive Resource Map** — OpenStreetMap + Leaflet.js for geo-tagged knowledge assets
- ✅ **Community Verification** — Community members verify and endorse submissions
- 📶 **Offline-First** — PWA with service worker caching for rural low-connectivity access

### Module 2 — Research Hub
- 📄 **Research Publication** — Publish compiled studies, product formulations, and technical frameworks
- 💰 **Smart Licensing Engine** — Creative Commons, Open Data Commons, or custom commercial royalty terms
- 🤝 **Collaborative Pipeline** — Open studies for co-authorship with tracked intellectual credit
- 📊 **Usage & Attribution Tracking** — Transparent audit logs: who viewed, downloaded, or cited your work
- 🔑 **Research API** — Authenticated API endpoints for licensed third-party data access

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend / BaaS | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Database | PostgreSQL + PostGIS (via Supabase) |
| File Storage | Supabase Storage |
| Mapping | Leaflet.js + OpenStreetMap |
| Hashing | Web Crypto API (SHA-256) |
| Offline | next-pwa (Service Worker) |
| Deployment | Vercel (prototype) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/Lebanglibby/Poloko-IKS.git
cd Poloko-IKS

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key in .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Project Structure

```
poloko/
├── app/                    # Next.js App Router pages and API routes
│   ├── (auth)/             # Login / Register
│   ├── (public)/           # Public pages (vault browse, map)
│   ├── (protected)/        # Authenticated pages (submit, dashboard, research)
│   └── api/                # API routes + external Research API (v1)
├── components/
│   ├── vault/              # Module 1 components
│   ├── research/           # Module 2 components
│   ├── map/                # Leaflet map component
│   └── shared/             # Navigation, layout, shared UI
├── lib/
│   ├── supabase/           # Supabase client (browser + server)
│   ├── hash.ts             # SHA-256 hashing utility
│   └── types.ts            # TypeScript interfaces
├── docs/
│   ├── SRD.md              # System Requirements Document
│   ├── TECHNICAL_ARCHITECTURE.md
│   └── API_REFERENCE.md
└── public/locales/         # i18n strings (English + Setswana)
```

---

## Documentation

| Document | Description |
|---|---|
| [System Requirements Document](docs/SRD.md) | Full functional and non-functional requirements |
| [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md) | Stack decisions, DB schema, security, deployment |
| [API Reference](docs/API_REFERENCE.md) | Research API endpoint documentation |

---

## Data Sovereignty

All data is owned by the submitting community or researcher. The platform enforces:
- Explicit consent parameters on all submissions
- Community elder approval for sacred knowledge access
- Immutable cryptographic proof of prior art on all uploads
- No third-party analytics or proprietary API dependencies

---

## Scalability

Built entirely on open-source, self-hostable tools — the full stack can be replicated across any SADC region with a single Docker Compose deployment, ensuring data sovereignty for each participating nation.

---

## License

This project is open-source under the [MIT License](LICENSE).

---

## Contributing
 
This project was built for the Track 04 Hackathon. Contributions welcome post-hackathon. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

*Built with 🌿 for Botswana and future generations.*
>>>>>>> e4313ac (feat: initial commit — Poloko IKS v0.1.0)
