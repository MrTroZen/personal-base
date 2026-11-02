"use client";

import { FileText, FolderKanban, Search, SquareCheckBig } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import type { Note, Project, Task } from "@/lib/work-data";

export function GlobalSearch({ projects, tasks, notes, initialError }: { projects: Project[]; tasks: Task[]; notes: Note[]; initialError: string | null }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase();
  const results = useMemo(() => ({
    projects: normalized ? projects.filter((project) => `${project.name} ${project.description}`.toLocaleLowerCase().includes(normalized)).slice(0, 8) : [],
    tasks: normalized ? tasks.filter((task) => `${task.title} ${task.description}`.toLocaleLowerCase().includes(normalized)).slice(0, 8) : [],
    notes: normalized ? notes.filter((note) => `${note.title} ${note.content}`.toLocaleLowerCase().includes(normalized)).slice(0, 8) : [],
  }), [normalized, notes, projects, tasks]);
  const total = results.projects.length + results.tasks.length + results.notes.length;
  return <div className="space-y-6">
    <header><h1 className="text-2xl font-semibold tracking-tight text-fg">Search</h1><p className="mt-1 text-sm text-fg-muted">Find a project, task, or note by its words.</p></header>
    {initialError && <div role="alert" className="rounded-md border border-danger/40 bg-danger-soft p-3 text-sm text-danger">Some searchable data could not be loaded. Refresh to try again.</div>}
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-5" aria-labelledby="search-input-title"><h2 id="search-input-title" className="sr-only">Search your workspace</h2><label htmlFor="global-search" className="mb-2 block text-sm font-medium text-fg">Search your workspace</label><div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-fg-subtle" /><Input id="global-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="pl-10" placeholder="Project, task, or note…" autoComplete="off" /></div><p className="mt-2 text-xs text-fg-subtle" role="status">{normalized ? `${total} result${total === 1 ? "" : "s"} shown` : "Type to search titles, descriptions, and note content."}</p></section>
    {!normalized ? null : total === 0 ? <div className="rounded-xl border border-border bg-surface p-6 text-center"><p className="text-sm font-medium text-fg">No matches found</p><p className="mt-1 text-xs text-fg-subtle">Try fewer or more general words.</p></div> : <div className="grid items-start gap-4 xl:grid-cols-3">
      <ResultGroup title="Projects" icon={FolderKanban} rows={results.projects.map((project) => ({ id: project.id, href: `/projects/${project.id}`, title: project.name, detail: project.archived_at ? "Archived project" : project.description || "Active project" }))} />
      <ResultGroup title="Tasks" icon={SquareCheckBig} rows={results.tasks.map((task) => ({ id: task.id, href: "/work#tasks", title: task.title, detail: task.status === "in_progress" ? "In progress" : task.status === "done" ? "Done" : "To do" }))} />
      <ResultGroup title="Notes" icon={FileText} rows={results.notes.map((note) => ({ id: note.id, href: "/notes", title: note.title, detail: note.project?.name ?? "No project" }))} />
    </div>}
  </div>;
}

function ResultGroup({ title, icon: Icon, rows }: { title: string; icon: typeof Search; rows: { id: string; href: string; title: string; detail: string }[] }) {
  return <section className="rounded-xl border border-border bg-surface" aria-labelledby={`search-${title.toLowerCase()}`}><div className="flex items-center gap-2 border-b border-border px-4 py-3"><Icon aria-hidden="true" className="size-4 text-fg-subtle" /><h2 id={`search-${title.toLowerCase()}`} className="font-semibold text-fg">{title}</h2><span className="ml-auto text-xs text-fg-subtle tabular-nums">{rows.length}</span></div>{rows.length === 0 ? <p className="p-4 text-sm text-fg-subtle">No {title.toLowerCase()} match.</p> : <ul className="divide-y divide-border">{rows.map((row) => <li key={row.id}><Link href={row.href} className="block px-4 py-3 outline-none transition-colors duration-fast hover:bg-surface-2/60 focus-visible:bg-surface-2 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-focus"><p className="truncate text-sm font-medium text-fg">{row.title}</p><p className="mt-1 truncate text-xs text-fg-subtle">{row.detail}</p></Link></li>)}</ul>}</section>;
}
