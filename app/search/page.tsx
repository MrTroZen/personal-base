import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { AppShell } from "@/components/app-shell";
import { GlobalSearch } from "@/components/global-search";
import { getOwnerIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Note, Project, Task } from "@/lib/work-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search" };

export default async function SearchPage() {
  const owner = await getOwnerIdentity();
  if (!owner) redirect("/sign-in");
  const supabase = await createClient();
  const [projectsResult, tasksResult, notesResult] = await Promise.all([
    supabase.from("projects").select("*").order("updated_at", { ascending: false }),
    supabase.from("tasks").select("*").order("updated_at", { ascending: false }),
    supabase.from("notes").select("*, project:projects(name)").order("updated_at", { ascending: false }),
  ]);
  return <AppShell ownerEmail={owner.email} ownerInitial={owner.initial} signOutAction={signOut}><GlobalSearch projects={(projectsResult.data ?? []) as Project[]} tasks={(tasksResult.data ?? []) as Task[]} notes={(notesResult.data ?? []) as unknown as Note[]} initialError={projectsResult.error?.message ?? tasksResult.error?.message ?? notesResult.error?.message ?? null} /></AppShell>;
}
