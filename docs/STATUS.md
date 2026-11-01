# Status

## Current repo state

A runnable Next.js App Router application provides an owner-protected, Supabase-backed projects and tasks workspace. Active projects can be created, edited, archived, opened in a detail view, and used to scope a three-column task Kanban. Tasks can be created, edited, deleted, assigned, reordered, and moved between persisted schema statuses. The hosted database remains protected by the verified owner-only RLS model.

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
- Installed Supabase CLI 2.122.0 as a local development dependency.
- Authenticated the Supabase CLI and linked the repository to the configured `personal-base` hosted project.
- Dry-ran the existing migration, confirmed it was the only pending migration with no seeds or role changes, and applied it successfully.
- Verified through remote database inspection that `projects`, `tasks`, `work_sessions`, `notes`, and `transactions` all exist.
- Verified the applied migration enables RLS on all five tables and confirmed anonymous reads against every table fail with HTTP 401 / PostgreSQL 42501.
- Verified the configured owner can authenticate against the real project using the publishable key.
- Verified authenticated project create/read/delete through RLS using a temporary test row, then deleted the row and removed the temporary credential and test script.
- Verified `npm run lint` and the Next.js production build pass with the real local Supabase environment.
- Reviewed the current dependency warnings: the production dependency audit is clean, while 16 moderate advisories are confined to the ESLint development toolchain. Deferred ESLint 10 because `eslint-plugin-react` and `eslint-plugin-import` bundled by `eslint-config-next` 16.4.3 do not declare ESLint 10 support and an npm dry run emits peer-resolution overrides.
- Added ownership-preserving relationships, validation constraints, focused indexes, RLS on every table, authenticated owner-only policies, and no anonymous table grants.
- Parsed all migration statements with a PostgreSQL grammar and structurally verified ownership, relationships, RLS, policies, and grants across all five tables.
- Replaced the static project/task previews with real Supabase reads and owner-scoped project/task mutations using the publishable client and existing RLS policies.
- Added active project listing, creation, editing, archival, project scoping, and a project detail route without changing the database schema.
- Added task creation, editing, deletion, project assignment, priority/due-date editing, three Kanban statuses, drag movement, keyboard/button movement, and persisted ordering/status updates.
- Added workspace loading, empty, success, and recoverable error states plus responsive desktop/mobile layouts using the existing shell, components, and token system.
- Applied Taste app-screen direction `true-black-flat` (seed `912238135`) with a ruled T-frame redraw to preserve the established labelled sidebar; Impeccable detection reported no changed-file violations.
- Verified authenticated project create/edit/archive/detail and task create/edit/delete/assignment/status movement against the real Supabase project with Playwright, including persistence after refresh.
- Verified the rendered workspace at 1280 × 900 and 390 × 844 in dark mode with reduced motion: no horizontal overflow, framework overlay, or relevant console warning/error. The Playwright MCP runtime failed during sandbox initialization, so the same checks ran through a temporary regular-Playwright fallback using system Edge; all temporary credentials, browser packages, scripts, screenshots, and QA database rows were removed afterward.
- Ran the final Taste app-screen lint on the new surfaces with 0 failures and 0 warnings, completed the Vercel Web Interface Guidelines review, and reverified ESLint and the production build.

## Currently working on

- `CURRENT` in `docs/PLAN.md`: usable focus tracking.

## Known issues

- Timer, sessions, notes, and money remain intentionally unavailable until their later build steps.
- A full local `supabase db reset` and live RLS behavior test require Docker/Postgres, which is not installed in this environment.
- GitHub repository and Vercel project are not configured.
- The development-only ESLint toolchain reports 16 moderate npm audit advisories. npm's proposed automatic fixes include incompatible major downgrades, so no automatic dependency rewrites were applied; `npm audit --omit=dev` reports zero vulnerabilities.

## Next exact task

Implement a resilient live focus timer linked to an optional project and task, persist completed runs as work sessions, and add session history. Keep notes and money CRUD out of this step.

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
