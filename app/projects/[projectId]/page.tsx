import type { Metadata } from "next";
import { ArrowLeft, Archive, CheckCircle2, Circle, Clock3 } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getOwnerIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { statusLabels, taskStatuses, type Project, type Task } from "@/lib/work-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Project detail" };

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const owner = await getOwnerIdentity();
  if (!owner) redirect("/sign-in");
  const { projectId } = await params;
  const supabase = await createClient();
  const [{ data: project, error }, { data: tasks }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", projectId).single(),
    supabase.from("tasks").select("*").eq("project_id", projectId).order("sort_order"),
  ]);
  if (error || !project) notFound();
  const typedProject = project as Project;
  const typedTasks = (tasks ?? []) as Task[];
  const complete = typedTasks.filter((task) => task.status === "done").length;

  return <AppShell ownerEmail={owner.email} ownerInitial={owner.initial} signOutAction={signOut}>
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm"><Link href="/work#projects"><ArrowLeft aria-hidden="true" />Back to projects</Link></Button>
      <header className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight text-fg">{typedProject.name}</h1>{typedProject.archived_at && <span className="rounded-sm bg-warning-soft px-2 py-1 text-xs font-medium text-warning"><Archive aria-hidden="true" className="mr-1 inline size-3" />Archived</span>}</div><p className="mt-2 max-w-prose text-sm leading-relaxed text-fg-muted">{typedProject.description || "No description yet."}</p></div><p className="text-sm text-fg-muted tabular-nums">{complete} of {typedTasks.length} tasks complete</p></div>
      </header>
      <section aria-labelledby="project-tasks-title"><div className="mb-3"><h2 id="project-tasks-title" className="font-semibold text-fg">Project tasks</h2><p className="text-xs text-fg-subtle">Edit and move tasks from the main workspace.</p></div><div className="grid gap-3 lg:grid-cols-3">{taskStatuses.map((status) => <section key={status} className="rounded-xl bg-surface-2/60 p-3"><h3 className="mb-3 flex items-center justify-between text-sm font-semibold text-fg"><span>{statusLabels[status]}</span><span className="font-normal text-fg-subtle tabular-nums">{typedTasks.filter((task) => task.status === status).length}</span></h3><ul className="space-y-2">{typedTasks.filter((task) => task.status === status).map((task) => <li key={task.id} className="rounded-lg border border-border bg-surface p-3"><div className="flex gap-2">{status === "done" ? <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" /> : status === "in_progress" ? <Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" /> : <Circle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-fg-subtle" />}<div><p className="text-sm font-medium text-fg">{task.title}</p>{task.description && <p className="mt-1 text-xs leading-relaxed text-fg-subtle">{task.description}</p>}</div></div></li>)}{typedTasks.every((task) => task.status !== status) && <li className="rounded-md border border-dashed border-border-strong p-4 text-center text-xs text-fg-subtle">No tasks in this status.</li>}</ul></section>)}</div></section>
    </div>
  </AppShell>;
}
