# System Requirements Document (SRD)
## Poloko IKS — Indigenous Knowledge Vault & Research Innovation System
**Version:** 1.0.0  
**Date:** September 17, 2026  
**Track:** Track 04 — Preservation of Botswana's Indigenous Knowledge Systems  
**Language of Reference:** English / Setswana  

---

## 1. Executive Summary

Poloko (Setswana: *to preserve / to safeguard*) is an open-source, web-first platform built to digitize, protect, and monetize Botswana's indigenous knowledge systems (IKS). It serves two primary stakeholders: **local communities** who are custodians of traditional knowledge, and **researchers/scientists** who compile, innovate upon, and derive modern solutions from that knowledge.

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

---

## 3. Stakeholders

| Stakeholder | Role |
|---|---|
| Community Members | Submit, verify, and own raw traditional knowledge |
| Community Elders / Board | Approve or restrict access to sensitive cultural knowledge |
| Researchers / Scientists | Publish, monetize, and collaborate on compiled research |
| Enterprise / Academic Entities | License structured research data via API |
| Platform Administrators | Govern data policies, manage access control |
| Future Generations (Beneficiaries) | Access preserved heritage |

---

## 4. System Scope

Poloko IKS is scoped around **two core modules**:

### Module 1 — Indigenous Knowledge Preservation Vault (Public Good)
A permanent, searchable digital heritage archive for raw traditional knowledge, native flora, and community conservation practices.

### Module 2 — Researcher & Innovation Hub (Monetization & Tracking)
A research marketplace and collaboration workspace enabling researchers to publish, monetize, track usage of, and collaboratively complete studies derived from indigenous knowledge.

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
| **Guest** | View Public knowledge entries and map; register account |
| **Community Member** | Submit entries; verify/flag entries; view Public entries |
| **Researcher** | All Community Member rights; publish research; set licenses; access Restricted entries (with approval); use research API |
| **Elder / Board Member** | Approve/deny Sacred access requests; manage restricted entry metadata |
| **Administrator** | Full system access; manage users, roles, policies, and audit logs |

---

## 8. Data Classification Model

```
Knowledge Entry
│
├── Public           → No approval needed; visible to all
├── Restricted       → Researcher applies; Admin approves
└── Sacred           → Community Elder/Board explicitly approves per request
```

---

## 9. Constraints

- **Timeline:** Functional prototype must be ready within 2 days (hackathon deadline).
- **Budget:** Open-source stack only; no paid proprietary APIs.
- **Connectivity:** Must be functional in low-bandwidth rural Botswana environments.
- **IP:** All user-submitted data is owned by the submitter / originating community.

---

## 10. Assumptions

- Supabase free tier is sufficient for prototype data volumes.
- Community elder approval is simulated via an admin role in the prototype.
- Commercial payment flows (licensing checkout) will be stubbed in the prototype and fully implemented post-hackathon.
- OpenStreetMap data coverage for Botswana is sufficient for prototype mapping.

---

## 11. Out of Scope (Prototype Phase)

- Native mobile app (Flutter) — web-first only for prototype
- Live payment processing
- Blockchain/on-chain hash anchoring (SHA-256 stored in Supabase for prototype)
- Full ML-powered search (vector search stubbed)
- Multi-language full content translation (UI labels only for Setswana)

---

*Document maintained by: Poloko IKS Core Team*  
*Next Review: Post-hackathon v2.0 planning*
