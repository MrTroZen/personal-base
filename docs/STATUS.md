# Status

## Current repo state

A deployed Next.js App Router application provides an owner-protected, Supabase-backed personal workspace for projects, tasks, focus sessions, notes, and money. The dashboard is now the concise daily home screen: it combines the live persisted timer with real work-ahead, active-project, current-month money, and recent-note summaries without duplicating the full feature routes. The hosted database remains protected by the verified owner-only RLS model.

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
- Replaced the static timer preview with a real Supabase-backed focus timer that can start without context, with only a project, or from a task that supplies its project.
- Persisted `started_at` immediately, derive elapsed time from the stored timestamp across refreshes and reopened tabs, finish by setting `ended_at`, and cancel by deleting only the active session.
- Added a partial unique index for one active work session per owner after confirming the existing schema could not safely enforce the cross-tab invariant; dry-ran and applied only that migration to the linked hosted project.
- Added completed focus-session history plus overlap-aware today and Monday-based week totals, including sessions that cross a day boundary.
- Verified against the real hosted project: owner login, anonymous denial, context-free/project-only/task-linked starts, task-to-project selection, immediate persistence, refresh/reopen recovery, single-active-session enforcement, finish, cancel-without-history, history, and totals.
- Verified the focus workspace in system Edge at 1440 × 1000 and 390 × 844 with no relevant console errors or horizontal page overflow. The MCP browser runtime remained unavailable, so the approved regular-Playwright fallback was used.
- Visually reviewed the active desktop and ready mobile timer states, ran Taste lint with 0 failures (two intentional clock-format warnings plus two pre-existing shell warnings), and ran Impeccable detection with no findings.
- Reverified ESLint and the production build after the complete focus-tracking change.
- Added authenticated `/notes` and `/money` routes to the existing shell and made both destinations available in desktop and mobile navigation.
- Added Supabase-backed note creation, editing, deletion, optional project links, project filtering, text search, refresh persistence, and focused empty/error/pending states without rich-editor complexity.
- Added Supabase-backed income/expense creation, editing, deletion, optional project links, recent transaction filtering, and refresh persistence using only the existing transaction schema.
- Added current-month income, expense, and net figures computed from displayed transaction rows plus a current-month breakdown for projects with linked activity; no chart or currency field was invented.
- Verified real hosted behavior through the owner account for linked/unlinked note and transaction CRUD, search/filtering, monthly math, project summaries, persistence after refresh, and anonymous denial on both tables.
- Verified Notes and Money in system Edge at 1440 × 1000 and 390 × 844 with reduced motion and dark mode: no horizontal overflow, relevant console errors, or framework overlay. The MCP browser runtime again failed during Windows sandbox initialization, so the approved regular-Playwright fallback was used.
- Ran the final Taste app-screen lint with 0 failures, Impeccable detection with no findings, and reviewed the changed surfaces against the current Vercel Web Interface Guidelines.
- Kept `.env.owner-test.local` for repeat authenticated QA at the owner's request; `.gitignore` already excludes it and its value is never printed.
- Replaced the last dashboard preview with real Supabase-backed focus, task, project, transaction, and note data; moved the full Projects and Tasks workspace to `/work` so the dashboard remains concise.
- Added local-owner date handling for due-today and current-month summaries, bounded the dashboard transaction query to the displayed month, and preserved archived project context without allowing new links to archived projects.
- Simplified the navigation and desktop account area, removed redundant placeholder/search chrome and decorative noise, tightened the focus timer on mobile, and added explicit loading semantics plus Escape/focus-return behavior for mobile navigation.
- Verified owner authentication, session refresh, sign-out, and anonymous redirects for every private route against the real hosted project. Verified all feature routes with temporary owner-scoped Supabase records and cleaned those records afterward.
- Verified the dashboard and workspace at desktop and mobile widths in system Edge with no horizontal overflow, framework error overlay, or relevant console errors. The MCP browser runtime still failed during Windows sandbox initialization, so the approved regular-Playwright fallback was used.
- Completed independent Impeccable design and technical critiques with no release-blocking finding, ran the deterministic detector with no findings, and reviewed the final surfaces against the current Vercel Web Interface Guidelines. Taste's remaining hairline findings are intentional rules in the established T-frame visual direction rather than new decoration.
- Confirmed only `.env.example` is tracked, `.env.local`, `.env.owner-test.local`, and `.vercel` remain ignored, and no service-role key, password, test credential, or application secret is committed.
- Pushed the completed product to GitHub `main` in commit `4583adf` and confirmed the existing Vercel project automatically deployed that exact commit to production. Vercel reports the deployment `Ready`; its build completed compilation, TypeScript, route generation, and output deployment successfully.
- Verified the production alias at `https://personal-base-iota.vercel.app`: owner login works, the authenticated dashboard loads, the session survives refresh, sign-out returns to the owner screen, and anonymous private-route responses contain the expected Next.js redirect to `/sign-in`.
- Added an owner-only `user_preferences` table for appearance (`system`, `light`, `dark`), default currency, IANA timezone, and Monday/Sunday week start; enabled RLS, denied anonymous access, and applied the migration to the linked hosted Supabase project.
- Added `/settings` with compact preference controls, account email display, and sign-out. Appearance applies immediately without a theme flash, while currency, timezone, and week start now drive money formatting, local date boundaries, focus totals, and focus history.
- Added `/archive` using the existing `projects.archived_at` behavior. Archived projects show linked task, work-session, note, and transaction counts and can be restored by clearing only `archived_at`, leaving all historical rows intact.
- Added `/search` with fast in-memory substring search across project names/descriptions, task titles/descriptions, and note titles/content. It uses existing owner-scoped Supabase reads and adds no embeddings or AI dependency.
- Added `/data` with live owner record counts and a client-generated JSON export for projects, tasks, work sessions, notes, and transactions. Added `/about` with version, build commit when available, and the private single-owner architecture summary.
- Added Settings and Search to desktop/mobile navigation plus quiet secondary navigation for Preferences, Archive, Data, and About without redesigning the established shell.
- Verified the hosted migration list matches all three local migrations and confirmed the new preference migration is applied remotely.
- Verified against real Supabase with temporary owner-scoped records that were removed afterward: all appearance modes, persisted currency/timezone/week-start preferences, currency use in Money, archived history counts, restore persistence, project/task/note search, all five JSON export datasets, About metadata, and anonymous preference read/write denial.
- Verified the production build in system Edge at 375, 768, and 1280 px across Settings, Archive, Search, Data, and About with reduced motion: no horizontal overflow, framework overlay, relevant console error/warning, or automated WCAG A/AA violation.
- Fixed two review findings before release: removed forced search autofocus on mobile and added field-linked currency/timezone errors with focus moving to the first invalid setting.
- Ran the app-screen Taste lint across all supporting surfaces with 0 failures; its only warning is the intentional shadow on the skip link while it floats above content. Reviewed the changed surfaces against the current Vercel Web Interface Guidelines.
- Reverified `npm run build`; removed the temporary QA script after the final browser pass so it cannot pollute lint or the repository.
- Documented the Money V2 product direction in `docs/MONEY.md`, including the shared period model, investment semantics, summaries, visualizations, categories, project linkage, proposed page structure, and explicit exclusions before implementation began.
- Added and deployed the forward-only Money V2 foundation migration after a successful linked-project dry run. It preserves the `transactions` table and every existing row, extends `kind` with `investment`, renames `occurred_on` to `transaction_date`, renames the supporting date index, and adds a required text `category` defaulted to `Other`.
- Kept the existing optional project ownership foreign key and owner-only RLS policy unchanged; anonymous transaction reads expose no owner row and anonymous writes remain denied.
- Chose one constrained text category field instead of a category-management table. The form offers the documented defaults plus useful investment suggestions through a datalist while still accepting a custom value up to 60 characters.
- Updated Money create/edit/list behavior for investment, category, editable financial date, and project-linked or unlinked transactions. Updated current-month and project summaries so investment is separate from expense and net cash flow subtracts both.
- Verified the pre-existing transaction count and ID hash were identical before and after migration, and confirmed every existing row retained a financial date and received the safe `Other` category.
- Verified against real Supabase with temporary owner-scoped data that were removed afterward: income/expense/investment create/read/update/delete, category and `transaction_date` persistence, linked and unlinked project behavior, refresh persistence, and RLS denial for anonymous access.
- Verified the production build in system Edge at 1280 × 900 and 390 × 844 with reduced motion and dark mode: no horizontal overflow, relevant console errors, or automated WCAG A/AA violations. App-screen Taste lint reported 0 failures and 0 warnings.

## Currently working on

- `CURRENT` in `docs/PLAN.md`: add one shared Money period control and make the existing summary, project figures, and transaction results respect it, without adding charts yet.

## Known issues

- A full local `supabase db reset` and live RLS behavior test require Docker/Postgres, which is not installed in this environment.
- The development-only ESLint toolchain reports 16 moderate npm audit advisories. npm's proposed automatic fixes include incompatible major downgrades, so no automatic dependency rewrites were applied; `npm audit --omit=dev` reports zero vulnerabilities.

## Next exact task

Implement the shared Money period state and query boundaries for This month, Last month, 3 months, 6 months, Year to date, 1 year, All time, and Custom range, including previous/next month navigation. Apply that one period to the existing summary, project figures, and transaction list; do not add charts, comparison metrics, or breakdown panels yet.

## Technical decisions

- Stack: Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase Postgres/Auth, GitHub, and Vercel.
- Next.js App Router is the default routing model.
- Tailwind CSS 4 provides the token-backed styling layer; shadcn/ui conventions and primitives are used for reusable controls.
- Supabase Auth will provide simple email authentication for the single owner.
- Supabase sessions use `@supabase/ssr` cookies; Next.js `proxy.ts` refreshes them, while protected pages independently authorize with verified `getClaims()` results.
- `OWNER_EMAIL` is a server-only allowlist in addition to disabling public signups; no service-role or secret key is exposed to the application.
- Every persisted row uses `user_id -> auth.users.id`; RLS grants authenticated users access only where `user_id = auth.uid()`.
- Projects are optional parents for tasks, sessions, notes, and transactions; sessions may also reference tasks. Composite ownership foreign keys prevent cross-user links, while project/task deletion clears optional links instead of deleting history.
- A partial unique index on `work_sessions (user_id) where ended_at is null` enforces one active session per owner even across tabs; the UI also restores the winning active row after a concurrent-start conflict.
- Focus elapsed time is never stored as a client counter. The UI derives it from persisted `started_at`/`ended_at` timestamps so refresh and reopen do not reset it.
- Notes remain plain text/Markdown-lite source rather than rendered rich content; project links are optional and archived links remain visible but cannot be newly selected.
- Transaction amounts remain positive numeric values; `kind` distinguishes income, expense, and investment. `transaction_date` is the financial date source, `category` is a required customizable text value, and the UI uses the owner's display-currency preference without adding a per-transaction currency field.
- Dashboard due-date and month boundaries use the single owner's configured `Asia/Dhaka` timezone rather than server UTC, preventing midnight-boundary summary errors.
- Owner preferences live in one `user_preferences` row keyed by `auth.users.id`; the browser uses the publishable client under the same owner-only RLS boundary, with no service-role access.
- Appearance persists in Supabase and mirrors to local storage only for pre-paint theme application. `system` removes the manual `data-theme` override.
- Search remains a bounded single-owner client filter over ordinary Supabase rows, and export remains an on-demand JSON snapshot generated in the browser. No import, indexing service, embeddings, or backup system was added.
- Desktop-first dark UI, with accessible responsive behavior and restrained motion.
