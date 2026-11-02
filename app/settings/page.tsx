import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { AppShell } from "@/components/app-shell";
import { SettingsNav } from "@/components/settings-nav";
import { SettingsWorkspace } from "@/components/settings-workspace";
import { getOwnerIdentity } from "@/lib/auth";
import { preferencesWithDefaults, type UserPreferences } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const owner = await getOwnerIdentity();
  if (!owner) redirect("/sign-in");
  const supabase = await createClient();
  const { data, error } = await supabase.from("user_preferences").select("*").maybeSingle();
  return <AppShell ownerEmail={owner.email} ownerInitial={owner.initial} signOutAction={signOut}><div className="space-y-6"><header><h1 className="text-2xl font-semibold tracking-tight text-fg">Settings</h1><p className="mt-1 text-sm text-fg-muted">Personal defaults for this private workspace.</p></header><SettingsNav /><SettingsWorkspace ownerEmail={owner.email} initialPreferences={preferencesWithDefaults(data as UserPreferences | null)} initialError={error?.message ?? null} signOutAction={signOut} /></div></AppShell>;
}
