# System Requirements Document (SRD)
## Poloko IKS — Indigenous Knowledge Vault & Research Innovation System
**Version:** 1.0.0  
**Date:** September 17, 2026  
**Track:** Track 04 — Preservation of Botswana's Indigenous Knowledge Systems  
**Language of Reference:** English / Setswana  

---

## 1. Executive Summary

Poloko (Setswana: *to preserve / to safeguard*) is an open-source, web-first platform built to digitize, protect, and monetize Botswana's indigenous knowledge systems (IKS). It serves three primary stakeholders: **local communities** who are custodians of traditional knowledge, **researchers/scientists** who compile and innovate upon that knowledge, and **cultural practitioners and artisans** who teach traditional skills and generate income from their expertise.

The system directly addresses Track 04: *"Design technology that preserves, documents, and protects Botswana's indigenous knowledge systems and natural resources for future generations."*

---

## 2. Problem Statement

### 2.1 Loss of Heritage
Botswana's oral traditions, traditional ecological wisdom, native plant knowledge, and community conservation practices are disappearing at an accelerating rate. There is no centralized, open-source digital infrastructure to archive and protect this heritage for future generations.

### 2.2 Lack of Research Infrastructure
Independent researchers and local scientists who compile or innovate upon indigenous knowledge have no dedicated platform to:
- Publish and protect their findings
- Track who accesses or cites their intellectual output
- Monetize compiled studies and derived datasets
- Collaborate on incomplete or ongoing research

### 2.3 Biopiracy Risk
Indigenous knowledge is vulnerable to exploitation by external entities without attribution or compensation to originating communities or researchers.

### 2.4 No Income Pathway for Cultural Practitioners
Artisans, elders, and cultural practitioners who hold deep practical knowledge — basket weavers, natural dyers, traditional builders — have no digital platform to teach, demonstrate, and earn from their skills. Traditional knowledge risks dying not because it is forgotten, but because it is economically unviable to pass on.

---

## 3. Stakeholders

| Stakeholder | Role |
|---|---|
| Community Members | Submit, verify, and own raw traditional knowledge; enrol in courses |
| Community Elders / Board | Approve or restrict access to sensitive cultural knowledge; review and approve courses before publication |
| Researchers / Scientists | Publish, monetize, and collaborate on compiled research |
| Content Creators / Practitioners | Create and publish courses and media demonstrating traditional skills; earn income in BWP |
| Learners | Browse and enrol in courses; consume media gallery |
| Enterprise / Academic Entities | License structured research data via API |
| Platform Administrators | Govern data policies, manage access control |
| Future Generations (Beneficiaries) | Access preserved heritage and living skill courses |

---

## 4. System Scope

Poloko IKS is scoped around **three core modules**:

### Module 1 — Indigenous Knowledge Preservation Vault (Public Good)
A permanent, searchable digital heritage archive for raw traditional knowledge, native flora, and community conservation practices.

### Module 2 — Researcher & Innovation Hub (Monetization & Tracking)
A research marketplace and collaboration workspace enabling researchers to publish, monetize, track usage of, and collaboratively complete studies derived from indigenous knowledge.

### Module 3 — Learning Hub / *Thuto* (Teaching, Skills & Creator Income)
A course and media platform where cultural practitioners teach traditional skills through structured video/image courses. All courses require Elder Board approval before publication. Creators earn income in BWP when learners enrol in paid courses. The learner-facing experience is the primary focus: browsing a warm, inspiring course catalogue, watching demonstrations, and following step-by-step traditional skill lessons.

---

## 5. Functional Requirements

### 5.1 Module 1: Indigenous Knowledge Preservation Vault

#### FR-1.1 Knowledge Submission
- Users shall be able to submit entries categorized as: Traditional Practices, Flora & Medicinal Plants, Conservation Techniques, Cultural Narratives, or Resource Locations.
- Submissions shall support text, audio, images, and geo-tagged location data.
- Each submission shall receive an automatic SHA-256 cryptographic hash as proof of prior art and timestamped ownership.

#### FR-1.2 Knowledge Search & Discovery
- The public shall be able to search the archive by keyword, category, region, language (English / Setswana), and plant name.
- Search results shall respect data access tiers (Public / Restricted / Sacred).

#### FR-1.3 Community Verification
- Community members shall be able to verify, flag inaccuracies on, or endorse submitted knowledge entries.
- Verified entries shall be visually distinguished from unverified ones.

#### FR-1.4 Interactive Resource Mapping
- The system shall display geo-tagged knowledge assets and native resource locations on an interactive map (OpenStreetMap + Leaflet.js).
- Map data shall be filterable by resource type and access tier.

#### FR-1.5 Tiered Access Control
- Knowledge entries shall be classifiable into three tiers:
  - **Public** — Accessible to all users
  - **Restricted** — Accessible to verified researchers with approved applications
  - **Sacred** — Accessible only upon explicit approval by a designated Community Elder or Board
- Access tiers shall be enforced at the database level using PostgreSQL Row-Level Security (RLS).

#### FR-1.6 Offline-First Accessibility
- The web application shall cache critical read data for offline access in low-connectivity environments.
- Submitted data captured offline shall sync automatically when connectivity is restored.

#### FR-1.7 Biopiracy Shield
- All uploaded assets shall have SHA-256 hashes generated and stored at upload time.
- Hash records shall be immutable and serve as timestamped proof of prior art.

---

### 5.2 Module 2: Researcher & Innovation Hub

#### FR-2.1 Research Publication
- Researchers shall be able to publish compiled studies, product formulations, or technical frameworks as research listings.
- Listings shall support document uploads (PDF, DOCX), multimedia assets, and structured metadata.

#### FR-2.2 Licensing & Monetization
- Researchers shall be able to assign licensing terms to each listing:
  - **Open License** — Creative Commons or Open Data Commons
  - **Commercial License** — Custom royalty or revenue-sharing terms
- The platform shall support a marketplace checkout flow for commercial listings.

#### FR-2.3 Collaborative Research Pipeline
- Researchers shall be able to mark studies as "Open for Collaboration."
- Other verified researchers shall be able to contribute to, refine, and co-author incomplete studies.
- Intellectual credit shall be tracked per contributor via an attribution log.

#### FR-2.4 Usage & Attribution Tracking
- Researchers shall receive transparent audit logs showing:
  - Who viewed their listing
  - Who downloaded their assets
  - Who cited their work
  - Downstream API usage of their data

#### FR-2.5 Research API
- The platform shall expose authenticated RESTful API endpoints for licensed access to structured research datasets.
- API keys shall be tied to specific licensing agreements.
- Primary researchers shall retain visibility on all API-level data consumption.

---

### 5.3 Module 3: Learning Hub — *Thuto*

> **Design Focus:** The learner experience is the priority. The UI should feel like a warm, community-owned alternative to Udemy — cultural, approachable, and inspiring. Creator tooling is secondary in the prototype; the browsing and course-consumption flow is what gets demoed.

#### FR-3.1 Course Catalogue — Learner Browse
- Any visitor (guest or authenticated) shall be able to browse the course catalogue without an account.
- Courses shall be displayed as rich cards showing: cover image, course title, creator name, category, price (BWP or Free), rating average, and lesson count.
- The catalogue shall be filterable by: category, price (Free / Paid), skill level (Beginner / Intermediate / Advanced), and language (English / Setswana).
- A featured / hero banner shall highlight the most recent Elder-approved courses.

#### FR-3.2 Course Detail Page — Learner View
- Each course shall have a dedicated public detail page displaying:
  - Course title, subtitle, and cover image/video preview
  - Creator profile: name, community, photo, brief bio
  - **Elder Board Approval badge** — visually prominent, confirming the course has been reviewed and approved by the community Elder Board
  - Full course description and learning outcomes
  - Structured lesson list with lesson title, duration, and content type (video / image gallery / text)
  - First lesson or a short preview clip available without enrolment (for paid courses)
  - Price in BWP (or "Free") and an enrol/start button
  - Number of enrolled learners
  - Category and skill level tags

#### FR-3.3 Lesson View — Learner Experience
- Enrolled learners shall access a lesson view showing:
  - Video player (for video lessons) or image gallery (for image-based lessons)
  - Lesson title and step-by-step text notes below the media
  - Materials / tools list for practical lessons (e.g. "Mokola palm fronds, natural dye, lekupa mould")
  - Navigation between lessons (Previous / Next) with progress indicator
  - Lesson completion checkbox (marks progress)

#### FR-3.4 Media Gallery — Standalone Demonstrations
- Creators shall be able to publish standalone videos or photo series outside of a course structure.
- Media items shall appear in a gallery grid on the Learning Hub home page.
- Media items are free to view by all authenticated users.

#### FR-3.5 Elder Board Course Approval
- When a creator submits a course for publication, it enters **Pending Elder Review** status.
- Elders and Admins shall receive a notification and be able to:
  - Preview the full course content
  - Approve (course becomes publicly listed) or Reject with written feedback
- Courses shall display a visible **"Elder Board Approved"** badge on the catalogue and detail page.
- Rejected courses are returned to the creator with feedback; they may resubmit after revision.

#### FR-3.6 Creator Course Management
- Authenticated users with the `content_creator` flag (or `elder` / `admin` role) shall be able to:
  - Create a new course: title, subtitle, description, category, skill level, language, price (BWP or free), cover image
  - Add lessons: title, content type, video URL or image uploads, text notes, materials list
  - Submit course for Elder Board review
  - View course status: Draft / Pending Review / Approved / Rejected
  - Edit and resubmit rejected courses

#### FR-3.7 Creator Income (BWP)
- Creators shall be able to set a course price in Botswana Pula (BWP).
- For the prototype, pricing and enrolment shall be displayed but payment processing shall be **stubbed** (no live payment gateway).
- The creator profile shall display total earnings (stub data for prototype).
- Post-hackathon: integration with a Botswana-compatible payment provider (e.g. Orange Money, FNB Pay).

#### FR-3.8 Course Categories
Courses shall be categorised as:
- **Traditional Crafts** — basket weaving, pottery, natural dyeing, leather work
- **Culinary Heritage** — traditional food preparation, fermentation, seasonal harvesting
- **Cultural Arts** — traditional dance, storytelling, music, beadwork
- **Natural Building** — traditional architecture, thatch, compound design
- **Ecological Practices** — sustainable farming, water conservation, plant cultivation
- **Modern Fusion** — traditional techniques applied to contemporary design (e.g. *Decoration in Modern Style Using Traditional Items*)

---

## 6. Non-Functional Requirements

| ID | Requirement | Detail |
|---|---|---|
| NFR-01 | Performance | Page load under 3 seconds on standard 3G connection |
| NFR-02 | Availability | 99.5% uptime target for web application |
| NFR-03 | Scalability | Architecture must support replication across SADC regions |
| NFR-04 | Security | All data encrypted in transit (TLS 1.3) and at rest (AES-256) |
| NFR-05 | Data Sovereignty | All data stored within sovereign-compatible infrastructure |
| NFR-06 | Accessibility | WCAG 2.1 AA compliance for inclusive access |
| NFR-07 | Offline Support | Core browsing and capture functions available offline |
| NFR-08 | Auditability | All data access and modifications logged immutably |
| NFR-09 | Open Source | Full codebase published under an OSI-approved license |
| NFR-10 | Localization | Interface support for English and Setswana |

---

## 7. User Roles & Permissions

| Role | Permissions |
|---|---|
| **Guest** | View Public knowledge entries and map; browse course catalogue and course detail pages; register account |
| **Community Member** | Submit entries; verify/flag entries; view Public entries; enrol in free courses; purchase paid courses |
| **Content Creator** | All Community Member rights; create and submit courses for Elder review; upload media; manage own courses; receive income from paid courses |
| **Researcher** | All Community Member rights; publish research; set licenses; access Restricted entries (with approval); use research API; enrol in courses |
| **Elder / Board Member** | Approve/deny Sacred access requests; review, approve, or reject course submissions with feedback; manage restricted entry metadata |
| **Administrator** | Full system access; manage users, roles, policies, audit logs, and course approvals |

---

## 8. Data Classification Model

```
Knowledge Entry (Module 1)
│
├── Public           → No approval needed; visible to all
├── Restricted       → Researcher applies; Admin approves
└── Sacred           → Community Elder/Board explicitly approves per request

Course (Module 3)
│
├── Draft            → Created by content creator; not visible publicly
├── Pending Review   → Submitted to Elder Board; not visible publicly
├── Approved         → Elder Board approved; listed in catalogue
└── Rejected         → Returned to creator with feedback; not visible
```

---

## 9. Constraints

- **Timeline:** Functional prototype must be ready within a 1-day hackathon sprint. Module 3 UI focuses on the learner-facing browsing and course detail experience — creator tooling and Elder approval UI are secondary.
- **Budget:** Open-source stack only; no paid proprietary APIs.
- **Connectivity:** Must be functional in low-bandwidth rural Botswana environments.
- **IP:** All user-submitted data is owned by the submitter / originating community.
- **Cultural Sovereignty:** No course involving Sacred or Restricted knowledge may be published without explicit Elder Board approval. The approval badge is non-removable once displayed.

---

## 10. Assumptions

- Supabase free tier is sufficient for prototype data volumes.
- Community elder approval is simulated via an admin role in the prototype.
- Commercial payment flows (licensing checkout) will be stubbed in the prototype and fully implemented post-hackathon.
- OpenStreetMap data coverage for Botswana is sufficient for prototype mapping.

---

## 11. Out of Scope (Prototype Phase)

- Native mobile app (Flutter) — web-first only for prototype
- Live payment processing for course enrolments (BWP pricing displayed, checkout stubbed)
- Blockchain/on-chain hash anchoring (SHA-256 stored in Supabase for prototype)
- Full ML-powered search (vector search stubbed)
- Multi-language full content translation (UI labels only for Setswana)
- Video transcoding / CDN hosting (video URLs embedded from external source for prototype)
- Creator earnings withdrawal / payout flow (earnings dashboard stubbed)

---

*Document maintained by: Poloko IKS Core Team*  
*Next Review: Post-hackathon v2.0 planning*
