import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { AppShell } from "@/components/app-shell";
import { DashboardHome } from "@/components/dashboard-home";
import { getOwnerIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { nextMonthStart, ownerDateKey } from "@/lib/time";
import type { Note, Project, Task, Transaction, WorkSession } from "@/lib/work-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { absolute: "Dashboard — Personal Base" } };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ focusTask?: string }> }) {
  const owner = await getOwnerIdentity();
  if (!owner) redirect("/sign-in");

  const { focusTask } = await searchParams;
  const supabase = await createClient();
  const monthStart = `${ownerDateKey().slice(0, 7)}-01`;
  const monthEnd = nextMonthStart(monthStart.slice(0, 7));
  const [{ data: projects, error: projectsError }, { data: tasks, error: tasksError }, { data: sessions, error: sessionsError }, { data: transactions, error: transactionsError }, { data: notes, error: notesError }] = await Promise.all([
    supabase.from("projects").select("*").order("updated_at", { ascending: false }),
    supabase.from("tasks").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
    supabase.from("work_sessions").select("*, project:projects(name), task:tasks(title)").order("started_at", { ascending: false }).limit(50),
    supabase.from("transactions").select("*").gte("occurred_on", monthStart).lt("occurred_on", monthEnd).order("occurred_on", { ascending: false }),
    supabase.from("notes").select("*, project:projects(name)").order("updated_at", { ascending: false }).limit(3),
  ]);

  return (
    <AppShell ownerEmail={owner.email} ownerInitial={owner.initial} signOutAction={signOut}>
      <DashboardHome
        projects={(projects ?? []) as Project[]}
        tasks={(tasks ?? []) as Task[]}
        sessions={(sessions ?? []) as unknown as WorkSession[]}
        transactions={(transactions ?? []) as Transaction[]}
        notes={(notes ?? []) as unknown as Note[]}
        requestedTaskId={focusTask ?? null}
        initialError={projectsError?.message ?? tasksError?.message ?? sessionsError?.message ?? transactionsError?.message ?? notesError?.message ?? null}
      />
    </AppShell>
  );
}
