# Poloko IKS — API Reference
## External Research API (v1) + Internal API Routes

**Version:** 1.0.0  
**Base URL (prototype):** `https://poloko-iks.vercel.app`

---

## Authentication

### Internal API Routes
All protected internal routes use **Supabase session cookies** (managed automatically by the `@supabase/ssr` client). The middleware at `src/middleware.ts` validates sessions on every protected request.

### External Research API (`/api/v1/*`)
Uses **Bearer API key** authentication:
```
Authorization: Bearer <your_api_key>
```
API keys are issued per researcher via the Dashboard. The raw key is shown **once** at creation — store it securely. Only the SHA-256 hash of the key is stored in the database.

---

## Internal API Routes

### Knowledge Entries

#### `GET /api/knowledge`
Browse and search knowledge entries. Respects RLS — restricted/sacred entries are automatically filtered based on the requester's session.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Filter by title (case-insensitive) |
| `category` | string | Filter by category enum |
| `tier` | string | Filter by access tier (`public`, `restricted`, `sacred`) |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Results per page (default: 20, max: 100) |

**Response:**
```json
{
  "data": [ ...KnowledgeEntry[] ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 47,
    "pages": 3
  }
}
```

---

#### `POST /api/knowledge`
Submit a new knowledge entry. Requires authentication.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string",
  "category": "traditional_practice | flora_medicinal | conservation | cultural_narrative | resource_location",
  "access_tier": "public | restricted | sacred",
  "language": "en | tn",
  "tags": ["string"],
  "latitude": 0.0,
  "longitude": 0.0,
  "sha256_hash": "string (required) — generated client-side before submission"
}
```

**Response:** `201 Created`
```json
{ "data": { ...KnowledgeEntry } }
```

---

### Research Listings

#### `GET /api/research`
Browse published research listings.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Filter by title |
| `license_type` | string | Filter by license type |
| `status` | string | `published` or `open_for_collaboration` |
| `page` | integer | Page number |
| `limit` | integer | Results per page |

---

#### `POST /api/research`
Publish a research listing. Requires `researcher` or `admin` role.

**Request Body:**
```json
{
  "title": "string (required)",
  "abstract": "string",
  "status": "draft | published | open_for_collaboration",
  "license_type": "cc_by | cc_by_sa | odc_by | commercial | custom",
  "price": 0.00,
  "tags": ["string"],
  "sha256_hash": "string (required)"
}
```

---

### SHA-256 Hashing

#### `POST /api/hash`
Server-side SHA-256 hash generation (fallback for environments without Web Crypto API).

**Request Body:**
```json
{ "content": "string to hash" }
```

**Response:**
```json
{
  "hash": "a3f5c8d2e1b4a7f6...",
  "timestamp": "2026-09-17T00:00:00.000Z",
  "algorithm": "SHA-256"
}
```

---

### Access Requests

#### `POST /api/access`
Submit an access request for a restricted or sacred knowledge entry.

**Request Body (JSON or form-data):**
```json
{
  "entry_id": "uuid (required)",
  "justification": "string"
}
```

**Response:** `201 Created`

---

#### `GET /api/access`
Fetch access requests.
- Elders/Admins: returns all pending requests
- Other users: returns their own requests

---

### Audit Logs

#### `GET /api/audit`
Fetch attribution audit logs for the authenticated user's content.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `target_type` | string | `knowledge_entry` or `research_listing` |
| `page` | integer | Page number |
| `limit` | integer | Results per page (default: 50) |

---

#### `POST /api/audit`
Log an action against a content item.

**Request Body:**
```json
{
  "action": "view | download | cite | api_access | submit | verify",
  "target_type": "knowledge_entry | research_listing",
  "target_id": "uuid",
  "metadata": {}
}
```

---

## External Research API (v1)

### `GET /api/v1/datasets`
Returns licensed, structured research data for third-party consumption.

**Authentication:** `Authorization: Bearer <api_key>`

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Results per page (max: 100) |

**Response:**
```json
{
  "api_version": "v1",
  "platform": "Poloko IKS",
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "abstract": "string",
      "license_type": "string",
      "tags": ["string"],
      "created_at": "ISO 8601",
      "profiles": { "full_name": "string" }
    }
  ],
  "pagination": { "page": 1, "limit": 50 },
  "attribution": "Data provided under the licensing terms agreed with the originating researcher."
}
```

**Error Responses:**

| Status | Meaning |
|---|---|
| `401` | No API key provided |
| `403` | Invalid, inactive, or expired API key |
| `500` | Internal server error |

---

## Data Models

### KnowledgeEntry
```typescript
{
  id: string                // UUID
  title: string
  description: string | null
  category: 'traditional_practice' | 'flora_medicinal' | 'conservation' | 'cultural_narrative' | 'resource_location'
  access_tier: 'public' | 'restricted' | 'sacred'
  language: 'en' | 'tn'
  submitted_by: string | null  // Profile UUID
  verified: boolean
  sha256_hash: string          // Immutable proof of prior art
  latitude: number | null
  longitude: number | null
  tags: string[]
  media_urls: string[]
  created_at: string           // ISO 8601
  updated_at: string
}
```

### ResearchListing
```typescript
{
  id: string
  title: string
  abstract: string | null
  full_document_url: string | null
  status: 'published' | 'draft' | 'open_for_collaboration'
  license_type: 'cc_by' | 'cc_by_sa' | 'odc_by' | 'commercial' | 'custom'
  license_terms: object | null  // Custom commercial terms
  price: number                 // BWP; 0 = free
  author_id: string
  sha256_hash: string           // Immutable proof of authorship
  view_count: number
  download_count: number
  tags: string[]
  created_at: string
  updated_at: string
}
```

---

## Rate Limits (Production)

| Endpoint | Limit |
|---|---|
| Public browse (`GET /api/knowledge`, `/api/research`) | 100 req/min |
| Authenticated writes | 30 req/min per user |
| External API (`/api/v1/*`) | 60 req/min per API key |
| Hash generation | 50 req/min |

---

*Poloko IKS API — Built for Botswana's indigenous knowledge ecosystem*
