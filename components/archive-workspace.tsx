"use client";

import { ArchiveRestore } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/work-data";

export type ArchiveCounts = Record<string, { tasks: number; sessions: number; notes: number; transactions: number }>;

export function ArchiveWorkspace({ initialProjects, counts, initialError }: { initialProjects: Project[]; counts: ArchiveCounts; initialError: string | null }) {
  const [projects, setProjects] = useState(initialProjects);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState(initialError);
  const [messageKind, setMessageKind] = useState<"error" | "success">(initialError ? "error" : "success");
  const supabase = useMemo(() => createClient(), []);
  async function restore(project: Project) {
    setPendingId(project.id); setMessage(null);
    const { error } = await supabase.from("projects").update({ archived_at: null, updated_at: new Date().toISOString() }).eq("id", project.id);
    if (error) { setMessageKind("error"); setMessage(error.message); }
    else { setProjects((current) => current.filter((item) => item.id !== project.id)); setMessageKind("success"); setMessage(`${project.name} restored.`); }
    setPendingId(null);
  }
  return <section className="rounded-xl border border-border bg-surface" aria-labelledby="archived-projects-title">
    <div className="border-b border-border px-4 py-3 sm:px-5"><h2 id="archived-projects-title" className="font-semibold text-fg">Archived projects</h2><p className="text-xs text-fg-subtle">{projects.length} project{projects.length === 1 ? "" : "s"}</p></div>
    <div className="sr-only" role="status">{messageKind === "success" ? message : ""}</div>
    {message && messageKind === "error" && <div role="alert" className="m-4 rounded-md border border-danger/40 bg-danger-soft p-3 text-sm text-danger">{message}</div>}
    {projects.length === 0 ? <div className="p-5"><div className="rounded-md border border-dashed border-border-strong p-6 text-center"><p className="text-sm font-medium text-fg">Archive is empty</p><p className="mt-1 text-xs text-fg-subtle">Archived projects will appear here with their related history intact.</p></div></div> : <ul className="divide-y divide-border">{projects.map((project) => { const history = counts[project.id] ?? { tasks: 0, sessions: 0, notes: 0, transactions: 0 }; return <li key={project.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div className="min-w-0"><h3 className="truncate text-sm font-semibold text-fg">{project.name}</h3>{project.description && <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{project.description}</p>}<p className="mt-2 text-xs text-fg-subtle tabular-nums">{history.tasks} tasks · {history.sessions} sessions · {history.notes} notes · {history.transactions} transactions</p></div><Button variant="secondary" size="sm" onClick={() => void restore(project)} disabled={pendingId === project.id}><ArchiveRestore aria-hidden="true" />{pendingId === project.id ? "Restoring…" : "Restore"}</Button></li>; })}</ul>}
  </section>;
}
