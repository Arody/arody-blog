# CLAUDE.md — Arody Blog

This file provides context for AI assistants working on this codebase.

## Project Overview

Arody Blog is a personal photography blog and portfolio for a Mexican photographer. It is a full-stack Next.js application with a Supabase backend. The UI language is Spanish (es_MX locale). The live site is at **https://arody.cloud**.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS 3 + `@tailwindcss/typography` |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + password) |
| Storage | Supabase Storage (`uploads` bucket) |
| Icons | Lucide React |
| DnD | @dnd-kit/core, @dnd-kit/sortable |
| Image compression | browser-image-compression |

## Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (eslint-config-next)
```

No test runner is configured.

## Environment Variables

The following variables must be set (in `.env.local` for development):

```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Both are public (prefixed `NEXT_PUBLIC_`) and used in both client and server code.

## Directory Structure

```
/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout: fonts, metadata, Header, Footer
│   │   ├── page.tsx                # Home page — post grid (force-dynamic)
│   │   ├── globals.css             # Global CSS variables and Tailwind layers
│   │   ├── about/page.tsx          # Static about page
│   │   ├── blog/
│   │   │   └── [slug]/page.tsx     # Blog post page + OG metadata
│   │   ├── admin/
│   │   │   ├── layout.tsx          # Admin layout with black nav bar
│   │   │   ├── page.tsx            # Dashboard — post list (force-dynamic)
│   │   │   ├── login/page.tsx      # Login form (client component)
│   │   │   └── editor/
│   │   │       ├── page.tsx        # New post editor page
│   │   │       └── [slug]/page.tsx # Edit existing post page
│   │   └── api/
│   │       ├── auth/route.ts       # Auth API route
│   │       ├── posts/route.ts      # GET/POST posts (legacy, not primary)
│   │       ├── posts/[slug]/route.ts
│   │       └── upload/route.ts     # Legacy local file upload (not active)
│   ├── components/
│   │   ├── Header.tsx              # Site header with nav links
│   │   ├── Footer.tsx              # Site footer
│   │   ├── PostReader.tsx          # Blog content renderer with font selector
│   │   ├── CommentSection.tsx      # Realtime comments (Supabase Realtime)
│   │   ├── ShareWidget.tsx         # Social sharing widget
│   │   └── admin/
│   │       ├── PostEditor.tsx      # Full post create/edit form (client)
│   │       ├── BlockEditor.tsx     # Drag-and-drop block editor (client)
│   │       └── RichTextEditor.tsx  # Rich text editor for paragraph blocks
│   ├── lib/
│   │   ├── api.ts                  # Supabase data layer — Post CRUD functions
│   │   └── supabase.ts             # Simple anon Supabase client (server-side)
│   ├── utils/supabase/
│   │   ├── client.ts               # Browser client (createBrowserClient)
│   │   ├── server.ts               # Server client (createServerClient + cookies)
│   │   └── middleware.ts           # Session refresh helper for middleware
│   ├── middleware.ts               # Next.js middleware — refreshes Supabase session
│   └── content/posts/              # Legacy JSON posts (not used; superseded by DB)
├── public/
│   └── arody-portrait.jpg          # Default OG fallback image
├── supabase_setup.sql              # Full DB schema + RLS policies
├── next.config.ts                  # Image remote patterns (Supabase CDN)
├── tailwind.config.ts              # Theme colors mapped to CSS vars, fonts
└── eslint.config.mjs               # ESLint: next/core-web-vitals + typescript
```

## Database Schema

Defined in `supabase_setup.sql`. Run this SQL in the Supabase SQL editor to initialize the project.

### `posts` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `slug` | text (UNIQUE) | URL identifier |
| `title` | text | |
| `excerpt` | text | Short summary |
| `content` | text | HTML string |
| `cover_image` | text | Public URL from Supabase Storage |
| `date` | date | Publication date |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Must be set manually on update |

### `comments` table

Used by `CommentSection.tsx`. Schema includes `id`, `post_id` (FK → posts.id), `author_name`, `content`, `created_at`.

### Storage

Bucket: `uploads` (public). Images are stored with unique filenames (`{timestamp}-{cleanName}_main.jpg` and `_social.jpg`).

### Row Level Security (RLS)

- Posts: public `SELECT`, authenticated-only `INSERT/UPDATE/DELETE`.
- Storage: public `SELECT`, authenticated-only `INSERT/UPDATE/DELETE`.

## Supabase Client Usage Patterns

**In client components (`"use client"`):**
```ts
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();
```

**In server components / route handlers:**
```ts
import { createClient } from "@/utils/supabase/server";
const supabase = await createClient();
```

**In `src/lib/api.ts` (server-side data layer):**
```ts
import { supabase } from './supabase'; // Simple client, no SSR cookies
```

Never mix these — use `@/utils/supabase/client` only in client components, `@/utils/supabase/server` only in server contexts.

## Key Conventions

### Naming
- Database columns use **snake_case** (`cover_image`, `created_at`).
- TypeScript interfaces use **camelCase** (`coverImage`, `createdAt`).
- The `api.ts` layer maps between the two explicitly.

### Slug generation
Slugs are auto-generated from the post title in `PostEditor.tsx`:
```ts
value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
```
Slugs are not editable after creation (the `slug` field is pre-filled and the upsert uses `onConflict: 'slug'`).

### Force dynamic rendering
Pages that query Supabase on the server use:
```ts
export const dynamic = 'force-dynamic';
```
This applies to `app/page.tsx` and `app/admin/page.tsx`.

### CSS Design System
CSS custom properties defined in `globals.css`:

| Variable | Light | Dark |
|---|---|---|
| `--background` | `#ffffff` | `#0a0a0a` |
| `--foreground` | `#000000` | `#ffffff` |
| `--accent` | `#555555` | `#d4d4d4` |
| `--light-gray` | `#f4f4f4` | `#1a1a1a` |
| `--border` | `#e0e0e0` | `#333333` |

Tailwind theme colors in `tailwind.config.ts` map to these variables (`background`, `foreground`, `accent`, `border`).

The admin area uses `.admin-area` class to always force light mode regardless of system preference.

### Fonts
- **Serif** (`font-serif`): Playfair Display via `--font-playfair` — used for headings, post titles, drop caps.
- **Sans** (`font-sans`): Inter via `--font-inter` — used for body text, UI.

Both are loaded in `src/app/layout.tsx` using `next/font/google`.

### Tailwind component classes
Defined in `globals.css` under `@layer components`:
- `.btn` — Primary action button (black fill, inverts on hover).
- `.container` — `max-w-7xl mx-auto px-8`.
- `input`, `textarea`, `select` — Consistent form field styles.
- `label` — Uppercase, tracked, small.

### Prose / Typography
Post content renders via `dangerouslySetInnerHTML` inside `PostReader.tsx` with a `.prose` wrapper. Custom overrides in `globals.css` adapt prose for dark mode via CSS variable mapping.

## Image Upload Pipeline

Handled in `PostEditor.tsx > handleImageUpload()`:

1. User selects an image file.
2. **Main image**: compressed to max 100KB / 1200px using `browser-image-compression`. Format: JPEG.
3. **Social image**: a 1200×630 canvas crop of the original (center-crop/cover), compressed to max 50KB. Filename: `{timestamp}-{cleanName}_social.jpg`.
4. Both are uploaded in parallel to the Supabase `uploads` bucket.
5. Only the **main image** public URL is stored as `cover_image` in the post.
6. The social image URL is derived by convention: replace `_main.jpg` with `_social.jpg` in the URL if needed for OG tags (currently the main image URL is used directly in OG metadata).

When a cover image changes, the old one is deleted from storage (by filename extracted from the URL).

## Admin Authentication

- Login page: `/admin/login` — uses Supabase `signInWithPassword`.
- Session is managed via Supabase SSR cookies, refreshed by `src/middleware.ts` on every request.
- The middleware runs on all routes except static files and images.
- In `CommentSection.tsx`, admin status is detected by checking `supabase.auth.getUser()` — if a user session exists, delete buttons appear on comments.

## Content Editor

The post editor (`PostEditor.tsx`) supports two modes toggled by UI buttons:
- **Blocks mode** (`BlockEditor.tsx`): Drag-and-drop block-based editor using `@dnd-kit`. Block types: `paragraph`, `heading`, `image`, `quote`, `divider`. Serializes to HTML on change.
- **HTML mode**: Raw textarea for direct HTML input.

Switching between modes does not convert content — it re-parses existing HTML when switching back to blocks.

### Block serialization format
```html
<p>...</p>                                          <!-- paragraph -->
<h2>...</h2>                                        <!-- heading -->
<blockquote>...</blockquote>                        <!-- quote -->
<img src="..." alt="Blog Image" class="w-full ..." /> <!-- image -->
<hr class="my-12 border-gray-200" />               <!-- divider -->
```

## Open Graph / Social Metadata

- Default OG image: `/arody-portrait.jpg` (served from `public/`).
- Per-post OG image: the post's `coverImage` URL, resolved to an absolute URL with `https://arody.cloud` as the base.
- Site locale: `es_MX`.
- Twitter card: `summary_large_image`.
- Metadata base URL in root layout: `https://arody.cloud`.

## Comment System

`CommentSection.tsx` is a client component that:
- Fetches comments from Supabase on mount.
- Subscribes to realtime Postgres changes for the `comments` table filtered by `post_id`.
- Rate-limits submissions with a 3-minute cooldown stored in `localStorage`.
- Shows delete buttons only when an authenticated admin session is detected.

## Allowed Remote Image Domains

Configured in `next.config.ts`. Only images from the following hostname are allowed via `next/image`:

```
api-supabase.arody.cloud  (Supabase Storage CDN)
```

If the Supabase project URL changes, update `next.config.ts` accordingly.

## Legacy Files

- `src/content/posts/*.json` — Old file-based post system. Not used; the app now reads from Supabase. Can be deleted.
- `src/app/api/upload/route.ts` — Uploads files to `public/uploads/` locally. Superseded by direct Supabase Storage uploads in `PostEditor.tsx`. Not actively used.
- `src/app/api/posts/route.ts` — REST API for posts. Not used by the UI (which calls Supabase directly). Kept for potential external integrations.
