# Product

## Purpose

A private, single-user dashboard for organizing personal work in one connected place. It should make the current focus obvious, reduce friction when starting work, and preserve a useful history of projects, tasks, sessions, notes, and money.

## Core experience

- **Dashboard:** current focus, active timer, priority tasks, recent projects, and concise work/money summaries.
- **Projects:** project overview connecting its tasks, work sessions, notes, and transactions.
- **Tasks / Kanban:** simple task capture, prioritization, and movement through a small set of statuses.
- **Focus timer:** prominent live timer tied to an optional project/task; completed runs become work sessions.
- **Money:** a visual personal finance dashboard connecting income, expenses, investments, cash flow, and project finances. `docs/MONEY.md` is the detailed product source of truth; its Money V2 direction is not fully implemented yet.
- **Notes:** fast personal notes, optionally linked to a project.
- **Authentication:** simple Supabase email authentication for one private owner account; protect all application data and routes.

## UX and visual direction

Dark, modern, polished, desktop-style UI with strong hierarchy, restrained color, excellent spacing, and high-quality empty/loading/error states. Motion should be smooth, subtle, and purposeful. The active focus timer is a persistent, visually important part of the experience. Desktop is primary, while layouts remain usable at smaller widths and accessible by keyboard.

## Data relationships

`Project` is the organizing center. Tasks, work sessions, notes, and transactions may belong to a project. A work session may also reference a task. Every record belongs to the authenticated user. Deleting or archiving a project must not silently destroy its history.

## Non-goals

No teams, organizations, invitations, roles, public profiles, client portal, admin console, subscriptions, billing, complex accounting, payroll, invoicing, chat, or enterprise workflow. Do not add broad customization or automation until a concrete personal need exists.

