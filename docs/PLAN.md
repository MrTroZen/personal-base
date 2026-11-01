# Build Plan

Each step must leave a usable, verified slice of the product.

1. **DONE — Establish the application shell and visual foundation.** Initialized Next.js with TypeScript and Tailwind CSS, added shadcn/ui, defined the dark design tokens, and built a responsive authenticated-shell mock with sidebar, top bar, dashboard route, and a prominent non-functional focus-timer card.
2. **DONE — Add single-owner Supabase authentication.** Added Supabase SSR clients and cookie refresh, owner-only email/password sign-in, protected dashboard access, sign-out, and a polished sign-in screen.
3. **DONE — Add and deploy the initial data model.** Added and deployed the migration for projects, tasks, work sessions, notes, and transactions with user ownership, relationships, constraints, focused indexes, and row-level security. Verified the hosted tables, anonymous denial, owner authentication, and authenticated create/read/delete behavior.
4. **DONE — Make projects and tasks usable.** Added Supabase-backed project creation, editing, archival and detail views plus task creation, editing, deletion, assignment, persisted ordering, and movement through the three schema-backed Kanban statuses.
5. **DONE — Make focus tracking usable.** Added a resilient live timer linked to an optional project/task, immediate timestamp persistence, refresh/reopen recovery, one-active-session enforcement, finish/cancel behavior, completed session history, and today/week totals.
6. **DONE — Complete the connected project workspace.** Added Supabase-backed project-linked and unlinked notes plus income/expense records, complete CRUD, focused search/filtering, current-month totals, recent activity, and project-level money summaries.
7. **DONE — Finish the dashboard and product polish.** Replaced the preview dashboard with concise connected focus, work, project, money, and note summaries; tightened the product shell and states; completed responsive, accessibility, security, and real-data route verification; and prepared the existing GitHub/Vercel delivery path.
8. **CURRENT — Use the finished workspace in normal daily work.** Exercise the deployed product with real projects, sessions, notes, and transactions; record only issues that appear in actual use; and defer new feature systems until that observation produces a clear priority.

