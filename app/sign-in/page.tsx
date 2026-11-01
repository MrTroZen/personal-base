import type { Metadata } from "next";
import { Check, Clock3, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { SignInForm } from "@/app/sign-in/sign-in-form";
import { getOwnerIdentity, isAuthConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in — Personal Base",
  description: "Sign in to your private personal work dashboard.",
};

export const dynamic = "force-dynamic";

const highlights = [
  { icon: Clock3, label: "Keep focused work visible" },
  { icon: Sparkles, label: "Connect the details that matter" },
  { icon: ShieldCheck, label: "Private by design" },
];

export default async function SignInPage() {
  const owner = await getOwnerIdentity();

  if (owner) {
    redirect("/");
  }

  const configured = isAuthConfigured();

  return (
    <main className="relative isolate grid min-h-dvh overflow-hidden bg-bg lg:grid-cols-auth">
      <div aria-hidden="true" className="pointer-events-none absolute -left-glow -top-glow -z-10 size-auth-glow rounded-full bg-accent-glow blur-glow" />

      <section className="hidden border-r border-border bg-sidebar/70 p-10 lg:flex lg:flex-col lg:justify-between xl:p-16" aria-labelledby="sign-in-context-title">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg border border-accent/30 bg-accent-soft text-sm font-semibold text-accent shadow-accent">
            PB
          </div>
          <div>
            <p className="text-sm font-semibold text-fg">Personal Base</p>
            <p className="text-xs text-fg-subtle">Private workspace</p>
          </div>
        </div>

        <div className="max-w-auth-copy">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            <LockKeyhole aria-hidden="true" className="size-3.5" />
            Owner access only
          </span>
          <h2 id="sign-in-context-title" className="text-3xl font-semibold tracking-tight text-fg">
            Everything you need to move meaningful work forward.
          </h2>
          <p className="mt-5 max-w-prose text-base leading-relaxed text-fg-muted">
            One calm, connected place for projects, tasks, focus sessions, notes, and money.
          </p>
          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-fg-muted">
                <span className="grid size-8 place-items-center rounded-md border border-border bg-surface text-accent">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="flex items-center gap-2 text-xs text-fg-subtle">
          <Check aria-hidden="true" className="size-3.5 text-success" />
          Secured with Supabase Auth
        </p>
      </section>

      <section className="flex min-w-0 items-center justify-center px-4 py-10 sm:px-8 lg:px-12" aria-labelledby="sign-in-title">
        <div className="w-full max-w-sign-in">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center rounded-lg border border-accent/30 bg-accent-soft text-sm font-semibold text-accent shadow-accent">
              PB
            </div>
            <div>
              <p className="text-sm font-semibold text-fg">Personal Base</p>
              <p className="text-xs text-fg-subtle">Private workspace</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 shadow-focus sm:p-8">
            <div className="mb-8">
              <div className="mb-5 grid size-11 place-items-center rounded-lg border border-border bg-surface-2 text-accent">
                <LockKeyhole aria-hidden="true" className="size-5" />
              </div>
              <h1 id="sign-in-title" className="text-2xl font-semibold tracking-tight text-fg">
                Welcome back
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                Sign in with the single owner account to open your dashboard.
              </p>
            </div>

            {!configured ? (
              <div id="auth-configuration-message" className="mb-5 rounded-md border border-warning/35 bg-warning-soft p-3 text-sm text-warning">
                Authentication setup is incomplete. Add the required environment variables before signing in.
              </div>
            ) : null}

            <SignInForm configured={configured} />
          </div>

          <p className="mt-5 text-center text-xs leading-relaxed text-fg-subtle">
            No public signup. Access is limited to the configured owner account.
          </p>
        </div>
      </section>
    </main>
  );
}
