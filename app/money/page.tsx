import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { AppShell } from "@/components/app-shell";
import { MoneyWorkspace } from "@/components/money-workspace";
import { getOwnerIdentity } from "@/lib/auth";
import { preferencesWithDefaults, type UserPreferences } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";
import type { Project, Transaction } from "@/lib/work-data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Money" };

export default async function MoneyPage() {
  const owner = await getOwnerIdentity();
  if (!owner) redirect("/sign-in");

  const supabase = await createClient();
  const [{ data: projects, error: projectsError }, { data: transactions, error: transactionsError }, { data: preferenceRow, error: preferencesError }] = await Promise.all([
    supabase.from("projects").select("*").order("updated_at", { ascending: false }),
    supabase.from("transactions").select("*, project:projects(name)").order("transaction_date", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("user_preferences").select("*").maybeSingle(),
  ]);
  const preferences = preferencesWithDefaults(preferenceRow as UserPreferences | null);

  return (
    <AppShell ownerEmail={owner.email} ownerInitial={owner.initial} signOutAction={signOut}>
      <MoneyWorkspace
        projects={(projects ?? []) as Project[]}
        initialTransactions={(transactions ?? []) as unknown as Transaction[]}
        currency={preferences.currency}
        timezone={preferences.timezone}
        initialError={projectsError?.message ?? transactionsError?.message ?? preferencesError?.message ?? null}
      />
    </AppShell>
  );
}
