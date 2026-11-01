import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { AppShell } from "@/components/app-shell";
import { Workspace } from "@/components/workspace";
import { getOwnerIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Project, Task } from "@/lib/work-data";

export const metadata: Metadata = { title: "Projects & tasks" };
export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const owner = await getOwnerIdentity();
  if (!owner) redirect("/sign-in");

  const supabase = await createClient();
  const [{ data: projects, error: projectsError }, { data: tasks, error: tasksError }] = await Promise.all([
    supabase.from("projects").select("*").order("updated_at", { ascending: false }),
    supabase.from("tasks").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
  ]);

  return (
    <AppShell ownerEmail={owner.email} ownerInitial={owner.initial} signOutAction={signOut}>
      <Workspace initialProjects={(projects ?? []) as Project[]} initialTasks={(tasks ?? []) as Task[]} initialError={projectsError?.message ?? tasksError?.message ?? null} />
    </AppShell>
  );
}
