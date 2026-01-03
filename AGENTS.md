# Livvay Workspace Instructions

Read this file before creating or changing anything in this repo.

## Design System (Supabase)
Use the Supabase Design System for layout, typography, color usage, accessibility, icons, and UI patterns.
Docs (reviewed and referenced for this project):
- https://supabase-design-system.vercel.app/design-system
- https://supabase-design-system.vercel.app/design-system/docs/accessibility
- https://supabase-design-system.vercel.app/design-system/docs/color-usage
- https://supabase-design-system.vercel.app/design-system/docs/copywriting
- https://supabase-design-system.vercel.app/design-system/docs/icons
- https://supabase-design-system.vercel.app/design-system/docs/tailwind-classes
- https://supabase-design-system.vercel.app/design-system/docs/theming
- https://supabase-design-system.vercel.app/design-system/docs/typography
- https://supabase-design-system.vercel.app/design-system/docs/ui-patterns/layout
- https://supabase-design-system.vercel.app/design-system/docs/ui-patterns/forms
- https://supabase-design-system.vercel.app/design-system/docs/ui-patterns/empty-states
- https://supabase-design-system.vercel.app/design-system/docs/ui-patterns/charts

## Product + Compliance
- "Vida eterna" is a manifesto/ambition, never a literal promise.
- Avoid terms like "garantido", "cura", "reverte idade", "imortalidade comprovada", "milagre".
- Any blood panel or estimates must be framed as probabilistic guidance, not diagnosis.
- Any mention of medical team/prescription needs a short responsibility note.

## Stack + Conventions
- Next.js App Router with TypeScript.
- TailwindCSS for styling; use existing tokens in `src/app/globals.css`.
- Components live in `src/components` and should be simple/reusable.
- Icons: `lucide-react`. Animations: `framer-motion` only when it adds value.
- Forms: `react-hook-form` + `zod` with accessible labels and focus states.

## Lead Capture
- Use `/api/lead` for email capture with `{ email, source, answers? }`.
- Persist leads to `data/leads.json` (already implemented).

## Content
- Tone: TikTok energy with health-tech credibility.
- Short sentences, no jargon. Add a practical example when introducing a feature.

