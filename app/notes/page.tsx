import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { AppShell } from "@/components/app-shell";
import { NotesWorkspace } from "@/components/notes-workspace";
import { getOwnerIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Note, Project } from "@/lib/work-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Notes" };

export default async function NotesPage() {
  const owner = await getOwnerIdentity();
  if (!owner) redirect("/sign-in");

  const supabase = await createClient();
  const [{ data: projects, error: projectsError }, { data: notes, error: notesError }] = await Promise.all([
    supabase.from("projects").select("*").order("updated_at", { ascending: false }),
    supabase.from("notes").select("*, project:projects(name)").order("updated_at", { ascending: false }),
  ]);

  return (
    <AppShell ownerEmail={owner.email} ownerInitial={owner.initial} signOutAction={signOut}>
      <NotesWorkspace
        projects={(projects ?? []) as Project[]}
        initialNotes={(notes ?? []) as unknown as Note[]}
        initialError={projectsError?.message ?? notesError?.message ?? null}
      />
    </AppShell>
  );
}
