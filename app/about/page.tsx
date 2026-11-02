import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { AppShell } from "@/components/app-shell";
import { SettingsNav } from "@/components/settings-nav";
import { getOwnerIdentity } from "@/lib/auth";
import packageJson from "@/package.json";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const owner = await getOwnerIdentity();
  if (!owner) redirect("/sign-in");
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "Local build";
  return <AppShell ownerEmail={owner.email} ownerInitial={owner.initial} signOutAction={signOut}><div className="space-y-6"><header><h1 className="text-2xl font-semibold tracking-tight text-fg">About</h1><p className="mt-1 text-sm text-fg-muted">Small, private software for focused personal work.</p></header><SettingsNav /><section className="max-w-2xl rounded-xl border border-border bg-surface p-5 sm:p-6" aria-labelledby="about-product-title"><h2 id="about-product-title" className="text-lg font-semibold text-fg">Personal Base</h2><p className="mt-2 text-sm leading-relaxed text-fg-muted">A single-owner workspace connecting projects, tasks, focused time, notes, and lightweight money records. It uses Supabase Auth and row-level security so the signed-in owner sees only their own data.</p><dl className="mt-6 divide-y divide-border border-y border-border text-sm"><div className="flex justify-between gap-4 py-3"><dt className="text-fg-muted">Version</dt><dd className="font-medium text-fg tabular-nums">{packageJson.version}</dd></div><div className="flex justify-between gap-4 py-3"><dt className="text-fg-muted">Build</dt><dd className="font-medium text-fg tabular-nums">{commit}</dd></div><div className="flex justify-between gap-4 py-3"><dt className="text-fg-muted">Architecture</dt><dd className="text-right font-medium text-fg">Private · Single owner</dd></div></dl></section></div></AppShell>;
}
