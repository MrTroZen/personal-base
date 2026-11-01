# Status

## Current repo state

A runnable Next.js App Router application provides an owner-protected dashboard, Supabase SSR authentication, and a static dashboard preview. Versioned migrations now define the five core user-owned tables with row-level security; they have not yet been applied to a hosted project.

## Completed

- Defined the product purpose, scope, UX direction, relationships, and non-goals.
- Defined the build sequence and permanent coding rules.
- Initialized Next.js 16 with TypeScript, Tailwind CSS 4, ESLint, and shadcn/ui conventions.
- Added a semantic responsive shell with desktop sidebar, mobile navigation disclosure, top bar, and skip link.
- Added dark/light design tokens and a polished static dashboard centered on a prominent non-functional focus timer.
- Verified the production UI at 320, 375, 768, and 1280 px, in light and dark schemes, with reduced motion; axe reported no violations.
- Added current `@supabase/ssr` browser/server clients and Next.js 16 request proxy cookie refresh using verified claims.
- Added server-only owner-email allowlisting, email/password sign-in, protected dashboard access, and local-session sign-out with no public signup flow.
- Added a responsive sign-in screen with configured, unconfigured, pending, and generic error states.
- Verified protected-route redirects and sign-in states at 375, 768, and 1280 px in light/dark schemes; axe reported no violations.
- Added the standard Supabase CLI project configuration and an initial migration for projects, tasks, work sessions, notes, and transactions.
- Added ownership-preserving relationships, validation constraints, focused indexes, RLS on every table, authenticated owner-only policies, and no anonymous table grants.
- Parsed all migration statements with a PostgreSQL grammar and structurally verified ownership, relationships, RLS, policies, and grants across all five tables.

## Currently working on

- `CURRENT` in `docs/PLAN.md`: usable projects and tasks.

## Known issues

- Dashboard content is representative static preview data; feature navigation and the timer remain intentionally unavailable.
- Supabase credentials, owner account, and production environment variables must be configured manually; successful sign-in/sign-out cannot be exercised until then.
- The migration has not been applied to a hosted Supabase project.
- A full local `supabase db reset` and live RLS behavior test require Docker/Postgres, which is not installed in this environment.
- GitHub repository and Vercel project are not configured.
- The initial dependency install reported 16 moderate npm audit advisories; no automatic dependency rewrites were applied.

## Next exact task

Replace the static project/task previews with Supabase-backed project creation and detail views plus a simple task Kanban with create, edit, and status movement. Keep timer, notes, and money CRUD out of this step.

## Technical decisions

- Stack: Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase Postgres/Auth, GitHub, and Vercel.
- Next.js App Router is the default routing model.
- Tailwind CSS 4 provides the token-backed styling layer; shadcn/ui conventions and primitives are used for reusable controls.
- Supabase Auth will provide simple email authentication for the single owner.
- Supabase sessions use `@supabase/ssr` cookies; Next.js `proxy.ts` refreshes them, while protected pages independently authorize with verified `getClaims()` results.
- `OWNER_EMAIL` is a server-only allowlist in addition to disabling public signups; no service-role or secret key is exposed to the application.
- Every persisted row uses `user_id -> auth.users.id`; RLS grants authenticated users access only where `user_id = auth.uid()`.
- Projects are optional parents for tasks, sessions, notes, and transactions; sessions may also reference tasks. Composite ownership foreign keys prevent cross-user links, while project/task deletion clears optional links instead of deleting history.
- Desktop-first dark UI, with accessible responsive behavior and restrained motion.
