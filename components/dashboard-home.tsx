import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { FocusTimer } from "@/components/focus-timer";
import { Button } from "@/components/ui/button";
import { ownerDateKey } from "@/lib/time";
import type { Note, Project, Task, Transaction, WorkSession } from "@/lib/work-data";

type DashboardHomeProps = {
  projects: Project[];
  tasks: Task[];
  sessions: WorkSession[];
  transactions: Transaction[];
  notes: Note[];
  requestedTaskId: string | null;
  initialError: string | null;
};

function formatAmount(value: number) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function taskUrgency(task: Task, today: string) {
  if (task.due_at) {
    const due = task.due_at.slice(0, 10);
    if (due < today) return { label: "Overdue", className: "text-danger", rank: 0 };
    if (due === today) return { label: "Due today", className: "text-warning", rank: 1 };
    return { label: new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(task.due_at)), className: "text-fg-subtle", rank: 2 };
  }
  return { label: "In progress", className: "text-accent", rank: 3 };
}

export function DashboardHome({ projects, tasks, sessions, transactions, notes, requestedTaskId, initialError }: DashboardHomeProps) {
  const now = new Date();
  const today = ownerDateKey(now);
  const month = today.slice(0, 7);
  const activeProjects = projects.filter((project) => !project.archived_at);
  const projectById = new Map(projects.map((project) => [project.id, project]));
  const attentionTasks = tasks
    .filter((task) => task.status !== "done" && (task.status === "in_progress" || Boolean(task.due_at)))
    .sort((a, b) => taskUrgency(a, today).rank - taskUrgency(b, today).rank || (a.due_at ?? "9999").localeCompare(b.due_at ?? "9999"))
    .slice(0, 5);
  const monthTransactions = transactions.filter((transaction) => transaction.occurred_on.startsWith(month));
  const money = monthTransactions.reduce((totals, transaction) => {
    const amount = Number(transaction.amount);
    if (transaction.kind === "income") totals.income += amount;
    else totals.expenses += amount;
    return totals;
  }, { income: 0, expenses: 0 });
  const net = money.income - money.expenses;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight text-fg">Dashboard</h1><p className="mt-1 text-sm text-fg-muted">Focus now, then keep the rest of the day in view.</p></div>
        <Button asChild variant="secondary" className="lg:hidden"><Link href="/work">Open projects & tasks<ArrowRight aria-hidden="true" /></Link></Button>
      </header>

      {initialError && <div role="alert" className="rounded-md border border-danger/40 bg-danger-soft p-3 text-sm text-danger">Some dashboard data could not be loaded. Refresh to try again.</div>}

      <FocusTimer projects={projects} tasks={tasks} initialSessions={sessions} requestedTaskId={requestedTaskId} />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
        <section className="rounded-xl border border-border bg-surface" aria-labelledby="attention-title">
          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5"><div><h2 id="attention-title" className="font-semibold text-fg">Work ahead</h2><p className="text-xs text-fg-subtle">Active and dated tasks</p></div><Button asChild variant="ghost" size="sm"><Link href="/work#tasks">View board<ArrowRight aria-hidden="true" /></Link></Button></div>
          {attentionTasks.length === 0 ? <div className="p-5"><div className="rounded-md border border-dashed border-border-strong p-5 text-center"><p className="text-sm font-medium text-fg">Nothing needs attention</p><p className="mt-1 text-xs text-fg-subtle">Start a task or add a due date when work becomes time-sensitive.</p></div></div> : <ul className="divide-y divide-border">{attentionTasks.map((task) => { const urgency = taskUrgency(task, today); return <li key={task.id} className="flex items-start justify-between gap-4 px-4 py-3 sm:px-5"><div className="min-w-0"><p className="truncate text-sm font-medium text-fg">{task.title}</p><p className="mt-1 truncate text-xs text-fg-subtle">{task.project_id ? projectById.get(task.project_id)?.name ?? "Archived project" : "No project"}</p></div><span className={`shrink-0 text-xs font-medium ${urgency.className}`}>{urgency.label}</span></li>; })}</ul>}
        </section>

        <section className="rounded-xl border border-border bg-surface" aria-labelledby="active-projects-title">
          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3"><div><h2 id="active-projects-title" className="font-semibold text-fg">Active projects</h2><p className="text-xs text-fg-subtle">{activeProjects.length} open</p></div><Button asChild variant="ghost" size="sm"><Link href="/work#projects">All projects<ArrowRight aria-hidden="true" /></Link></Button></div>
          {activeProjects.length === 0 ? <div className="p-4"><div className="rounded-md border border-dashed border-border-strong p-4 text-center"><p className="text-sm font-medium text-fg">No active projects</p><p className="mt-1 text-xs text-fg-subtle">Create one when a body of work needs a shared home.</p></div></div> : <ul className="divide-y divide-border">{activeProjects.slice(0, 4).map((project) => { const projectTasks = tasks.filter((task) => task.project_id === project.id); const open = projectTasks.filter((task) => task.status !== "done").length; return <li key={project.id}><Link href={`/projects/${project.id}`} className="flex items-center justify-between gap-4 px-4 py-3 outline-none transition-colors duration-fast hover:bg-surface-2/60 focus-visible:bg-surface-2 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-focus"><span className="min-w-0 truncate text-sm font-medium text-fg">{project.name}</span><span className="shrink-0 text-xs text-fg-subtle tabular-nums">{open} open</span></Link></li>; })}</ul>}
        </section>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
        <section className="rounded-xl border border-border bg-surface" aria-labelledby="month-money-title">
          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5"><div><h2 id="month-money-title" className="font-semibold text-fg">This month</h2><p className="text-xs text-fg-subtle">{monthTransactions.length} transaction{monthTransactions.length === 1 ? "" : "s"}</p></div><Button asChild variant="ghost" size="sm"><Link href="/money">Open money<ArrowRight aria-hidden="true" /></Link></Button></div>
          <dl className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0"><div className="p-4 sm:p-5"><dt className="text-xs text-fg-subtle">Income</dt><dd className="mt-2 text-xl font-semibold text-success tabular-nums">+{formatAmount(money.income)}</dd></div><div className="p-4 sm:p-5"><dt className="text-xs text-fg-subtle">Expenses</dt><dd className="mt-2 text-xl font-semibold text-fg tabular-nums">−{formatAmount(money.expenses)}</dd></div><div className="p-4 sm:p-5"><dt className="text-xs text-fg-subtle">Net</dt><dd className={`mt-2 text-xl font-semibold tabular-nums ${net < 0 ? "text-danger" : "text-fg"}`}>{net > 0 ? "+" : net < 0 ? "−" : ""}{formatAmount(Math.abs(net))}</dd></div></dl>
        </section>

        <section className="rounded-xl border border-border bg-surface" aria-labelledby="recent-notes-title">
          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3"><div><h2 id="recent-notes-title" className="font-semibold text-fg">Recent notes</h2><p className="text-xs text-fg-subtle">Last updated</p></div><Button asChild variant="ghost" size="sm"><Link href="/notes">Open notes<ArrowRight aria-hidden="true" /></Link></Button></div>
          {notes.length === 0 ? <div className="p-4"><div className="rounded-md border border-dashed border-border-strong p-4 text-center"><p className="text-sm font-medium text-fg">No notes yet</p><p className="mt-1 text-xs text-fg-subtle">Capture the next decision or detail worth keeping.</p></div></div> : <ul className="divide-y divide-border">{notes.slice(0, 3).map((note) => <li key={note.id} className="px-4 py-3"><p className="truncate text-sm font-medium text-fg">{note.title}</p><p className="mt-1 truncate text-xs text-fg-subtle">{note.project?.name ?? "No project"} · <time dateTime={note.updated_at}>{new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(note.updated_at))}</time></p></li>)}</ul>}
        </section>
      </div>
    </div>
  );
}
