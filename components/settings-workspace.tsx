"use client";

import { LogOut, Save } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { applyAppearance } from "@/components/theme-preference-sync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { appearances, type Appearance, type UserPreferences, type WeekStart } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/client";

const fieldClass = "h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-fg outline-none transition-colors duration-fast focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30";

export function SettingsWorkspace({ ownerEmail, initialPreferences, initialError, signOutAction }: { ownerEmail: string; initialPreferences: Omit<UserPreferences, "user_id" | "updated_at"> & Partial<Pick<UserPreferences, "user_id" | "updated_at">>; initialError: string | null; signOutAction: () => Promise<void> }) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [fieldErrors, setFieldErrors] = useState<{ currency?: string; timezone?: string }>({});
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(initialError);
  const [messageKind, setMessageKind] = useState<"error" | "success">(initialError ? "error" : "success");
  const supabase = useMemo(() => createClient(), []);
  const timezones = useMemo(() => typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : ["Asia/Dhaka", "UTC"], []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null); setFieldErrors({});
    const form = new FormData(event.currentTarget);
    const appearance = String(form.get("appearance")) as Appearance;
    const currency = String(form.get("currency") ?? "").trim().toUpperCase();
    const timezone = String(form.get("timezone") ?? "").trim();
    const week_start = String(form.get("week_start")) as WeekStart;
    const errors: { currency?: string; timezone?: string } = {};
    if (!/^[A-Z]{3}$/.test(currency)) errors.currency = "Enter a three-letter ISO code such as BDT or USD.";
    try { new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(); } catch { errors.timezone = "Enter a valid IANA timezone such as Asia/Dhaka or UTC."; }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstField = errors.currency ? "currency" : "timezone";
      window.requestAnimationFrame(() => (event.currentTarget.elements.namedItem(firstField) as HTMLInputElement | null)?.focus());
      return;
    }
    setPending(true);
    try {
      if (!appearances.includes(appearance)) throw new Error("Choose a valid appearance preference.");
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Your session expired. Sign in again and retry.");
      const next = { user_id: auth.user.id, appearance, currency, timezone, week_start, updated_at: new Date().toISOString() };
      const { data, error } = await supabase.from("user_preferences").upsert(next).select("*").single();
      if (error) throw error;
      setPreferences(data as UserPreferences);
      applyAppearance(appearance);
      window.sessionStorage.setItem("personal-base-preferences-synced", "true");
      setMessageKind("success"); setMessage("Preferences saved.");
    } catch (error) {
      setMessageKind("error"); setMessage(error instanceof Error ? error.message : "Could not save preferences.");
    } finally { setPending(false); }
  }

  return <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
    <section className="rounded-xl border border-border bg-surface" aria-labelledby="preferences-title">
      <div className="border-b border-border px-4 py-3 sm:px-5"><h2 id="preferences-title" className="font-semibold text-fg">Preferences</h2><p className="text-xs text-fg-subtle">Used for display and time summaries across Personal Base.</p></div>
      <form onSubmit={save} className="grid gap-5 p-4 sm:p-5" noValidate>
        {message && <div role={messageKind === "error" ? "alert" : "status"} className={`rounded-md border p-3 text-sm ${messageKind === "error" ? "border-danger/40 bg-danger-soft text-danger" : "border-success/30 bg-success-soft text-success"}`}>{message}</div>}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-fg">Appearance<select name="appearance" defaultValue={preferences.appearance} className={fieldClass}><option value="system">Follow system</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
          <label className="grid gap-2 text-sm font-medium text-fg">Default currency<Input name="currency" required minLength={3} maxLength={3} defaultValue={preferences.currency} autoCapitalize="characters" aria-invalid={Boolean(fieldErrors.currency)} aria-describedby={fieldErrors.currency ? "currency-hint currency-error" : "currency-hint"} /><span id="currency-hint" className="text-xs font-normal text-fg-subtle">Three-letter ISO code, for example BDT or USD.</span>{fieldErrors.currency && <span id="currency-error" className="text-xs font-normal text-danger">{fieldErrors.currency}</span>}</label>
          <label className="grid gap-2 text-sm font-medium text-fg">Timezone<Input name="timezone" list="timezone-options" required defaultValue={preferences.timezone} autoComplete="off" aria-invalid={Boolean(fieldErrors.timezone)} aria-describedby={fieldErrors.timezone ? "timezone-error" : undefined} />{fieldErrors.timezone && <span id="timezone-error" className="text-xs font-normal text-danger">{fieldErrors.timezone}</span>}<datalist id="timezone-options">{timezones.map((timezone) => <option key={timezone} value={timezone} />)}</datalist></label>
          <label className="grid gap-2 text-sm font-medium text-fg">Week starts<select name="week_start" defaultValue={preferences.week_start} className={fieldClass}><option value="monday">Monday</option><option value="sunday">Sunday</option></select></label>
        </div>
        <div><Button type="submit" disabled={pending}><Save aria-hidden="true" />{pending ? "Saving…" : "Save preferences"}</Button></div>
      </form>
    </section>
    <aside className="rounded-xl border border-border bg-surface p-4" aria-labelledby="account-title"><h2 id="account-title" className="font-semibold text-fg">Account</h2><p className="mt-3 break-all text-sm text-fg-muted">{ownerEmail}</p><p className="mt-1 text-xs text-fg-subtle">Single owner · Supabase Auth</p><form action={signOutAction} className="mt-5"><Button type="submit" variant="secondary" className="w-full"><LogOut aria-hidden="true" />Sign out</Button></form></aside>
  </div>;
}
