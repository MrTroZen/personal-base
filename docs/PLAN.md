# Build Plan

Each step must leave a usable, verified slice of the product.

1. **DONE — Establish the application shell and visual foundation.** Initialized Next.js with TypeScript and Tailwind CSS, added shadcn/ui, defined the dark design tokens, and built a responsive authenticated-shell mock with sidebar, top bar, dashboard route, and a prominent non-functional focus-timer card.
2. **DONE — Add single-owner Supabase authentication.** Added Supabase SSR clients and cookie refresh, owner-only email/password sign-in, protected dashboard access, sign-out, and a polished sign-in screen.
3. **DONE — Add the initial data model.** Added migrations for projects, tasks, work sessions, notes, and transactions with user ownership, relationships, constraints, focused indexes, and row-level security.
4. **CURRENT — Make projects and tasks usable.** Add project creation/detail views and a simple Kanban with task creation, editing, and status movement.
5. **Make focus tracking usable.** Implement a resilient live timer linked to a project/task, persist completed work sessions, and show session history.
6. **Complete the connected project workspace.** Add project-linked notes and income/expense entry with focused lists and summaries.
7. **Finish the dashboard and product polish.** Replace placeholders with connected summaries, refine motion and states, verify accessibility/responsiveness, and prepare GitHub/Vercel deployment configuration.

