import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { AppShell } from "@/components/app-shell";
import { ArchiveWorkspace, type ArchiveCounts } from "@/components/archive-workspace";
import { SettingsNav } from "@/components/settings-nav";
import { getOwnerIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/work-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Archive" };

export default async function ArchivePage() {
  const owner = await getOwnerIdentity();
  if (!owner) redirect("/sign-in");
  const supabase = await createClient();
  const [projectsResult, tasksResult, sessionsResult, notesResult, transactionsResult] = await Promise.all([
    supabase.from("projects").select("*").not("archived_at", "is", null).order("archived_at", { ascending: false }),
    supabase.from("tasks").select("project_id").not("project_id", "is", null),
    supabase.from("work_sessions").select("project_id").not("project_id", "is", null),
    supabase.from("notes").select("project_id").not("project_id", "is", null),
    supabase.from("transactions").select("project_id").not("project_id", "is", null),
  ]);
  const counts: ArchiveCounts = {};
  for (const [key, rows] of [["tasks", tasksResult.data], ["sessions", sessionsResult.data], ["notes", notesResult.data], ["transactions", transactionsResult.data]] as const) {
    for (const row of rows ?? []) {
      if (!row.project_id) continue;
      counts[row.project_id] ??= { tasks: 0, sessions: 0, notes: 0, transactions: 0 };
      counts[row.project_id][key] += 1;
    }
  }
  const initialError = projectsResult.error?.message ?? tasksResult.error?.message ?? sessionsResult.error?.message ?? notesResult.error?.message ?? transactionsResult.error?.message ?? null;
  return <AppShell ownerEmail={owner.email} ownerInitial={owner.initial} signOutAction={signOut}><div className="space-y-6"><header><h1 className="text-2xl font-semibold tracking-tight text-fg">Archive</h1><p className="mt-1 text-sm text-fg-muted">Inactive projects stay out of daily work without losing their history.</p></header><SettingsNav /><ArchiveWorkspace initialProjects={(projectsResult.data ?? []) as Project[]} counts={counts} initialError={initialError} /></div></AppShell>;
}
