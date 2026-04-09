# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**MLMOTOSCAR** — sistema de gestão para uma concessionária de veículos (carros e motos). Inclui site público e painel administrativo.

## Commands

```bash
npm run dev       # Start dev server (Vite)
npm run build     # Build for production
npm run preview   # Preview production build
```

No test framework configured. There is a Supabase connection test: `npm run test:supabase`.

## Tech Stack

- **React 19** + **TypeScript** + **Vite** (not Next.js — ignore the `.cursorrules` references to Next.js)
- **React Router v7** with `HashRouter` (all routes use `#` prefix)
- **Supabase** for database + auth + storage
- **Tailwind CSS** + shadcn/ui component patterns (components built manually in `components/ui/`)
- **Yup** for form validation schemas (`validations/`)
- **jsPDF** for contract/PDF generation

## Architecture

### Routing (App.tsx)

Two layouts:
- `PublicLayout` — wraps public pages with `Navbar`, `Footer`, `FloatingChat`
- `AdminLayout` (pages/admin/AdminLayout.tsx) — protected sidebar layout for admin pages

Admin is protected by Supabase auth (`services/authService.ts`). Login at `/admin/login`.

### State Management

No global state library. Two React Contexts at the root (`index.tsx`):
- `SettingsProvider` — loads store settings from Supabase `settings` table on mount; applies CSS custom properties (`--primary`, `--navbar-bg`, etc.) dynamically from the DB. Access via `useSettings()`.
- `ThemeProvider` — dark/light theme via `localStorage`. Access via `useTheme()`.

### Services Layer (`services/`)

All Supabase queries are isolated here. Services return typed data from `types.ts`.

- `vehicleService.ts` — CRUD + paginated listing with filters
- `salesService.ts` — sales with payment details (stored as JSONB)
- `customerService.ts` — customer management
- `brandService.ts` — brands and models (hierarchical: brand → model)
- `imageService.ts` — Supabase Storage operations for vehicle images
- `settingsService.ts` — store configuration (single row in `settings` table, id = `'main'`)
- `authService.ts` — Supabase auth (sign in/out, session check)
- `reviewsService.ts` — Google-style reviews for the public home page

### Database

Full schema is in `supabase-schema.sql`. Migrations are in `migration-*.sql` files at project root. **Always run migrations in Supabase after schema changes.**

Key tables: `vehicles`, `brands`, `models`, `customers`, `sales`, `payment_history`, `settings`, (reviews).

RLS is enabled: `vehicles`, `brands`, `models`, `settings` are publicly readable; all writes and other tables require `auth.role() = 'authenticated'`.

### Types (`types.ts`)

Central type definitions. Key types: `Vehicle`, `Brand`, `Model`, `Customer`, `Sale`, `PaymentDetails`, `AppSettings`, `Review`.

Vehicle images are stored as `string[]` (Supabase Storage URLs) in the `images` column.

`PaymentDetails` is stored as JSONB in the `sales.payment` column and supports: `cash`, `financing`, `trade_in`, `promissory`.

### UI Components

- `components/ui/` — shadcn-style primitives (Button, Card, Input, etc.)
- `components/ui/core.tsx` — barrel export for common UI primitives
- Custom components: `ImageUpload`, `SingleImageUpload`, `AdminPageComponents`, `FloatingChat`, `Navbar`, `Footer`

### Dynamic Theming

`SettingsProvider` converts hex colors from the DB to HSL and injects them as CSS variables on `document.documentElement`. This makes the store's branding fully configurable from the admin panel without a deploy.

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Language Convention

Code variables and file names: English. UI text and comments: Portuguese (PT-BR). Respond to the user in PT-BR.
