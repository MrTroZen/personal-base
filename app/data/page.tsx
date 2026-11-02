import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { AppShell } from "@/components/app-shell";
import { DataWorkspace } from "@/components/data-workspace";
import { SettingsNav } from "@/components/settings-nav";
import { getOwnerIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Data" };

export default async function DataPage() {
  const owner = await getOwnerIdentity();
  if (!owner) redirect("/sign-in");
  const supabase = await createClient();
  const tables = ["projects", "tasks", "work_sessions", "notes", "transactions"] as const;
  const results = await Promise.all(tables.map((table) => supabase.from(table).select("id", { count: "exact", head: true })));
  const counts = Object.fromEntries(tables.map((table, index) => [table, results[index].count ?? 0]));
  const initialError = results.find((result) => result.error)?.error?.message ?? null;
  return <AppShell ownerEmail={owner.email} ownerInitial={owner.initial} signOutAction={signOut}><div className="space-y-6"><header><h1 className="text-2xl font-semibold tracking-tight text-fg">Data</h1><p className="mt-1 text-sm text-fg-muted">A simple view of what this owner account stores.</p></header><SettingsNav /><DataWorkspace ownerEmail={owner.email} counts={counts} initialError={initialError} /></div></AppShell>;
}
