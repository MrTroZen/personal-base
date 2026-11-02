"use client";

import { Download } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const tableLabels = { projects: "Projects", tasks: "Tasks", work_sessions: "Work sessions", notes: "Notes", transactions: "Transactions" } as const;

export function DataWorkspace({ ownerEmail, counts, initialError }: { ownerEmail: string; counts: Record<string, number>; initialError: string | null }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(initialError);
  const [messageKind, setMessageKind] = useState<"error" | "success">(initialError ? "error" : "success");
  const supabase = useMemo(() => createClient(), []);
  async function exportJson() {
    setPending(true); setMessage(null);
    try {
      const tables = Object.keys(tableLabels) as (keyof typeof tableLabels)[];
      const results = await Promise.all(tables.map((table) => supabase.from(table).select("*").order("created_at", { ascending: true })));
      const failure = results.find((result) => result.error)?.error;
      if (failure) throw failure;
      const payload = { exported_at: new Date().toISOString(), account_email: ownerEmail, data: Object.fromEntries(tables.map((table, index) => [table, results[index].data ?? []])) };
      const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `personal-base-export-${new Date().toISOString().slice(0, 10)}.json`; anchor.click();
      URL.revokeObjectURL(url);
      setMessageKind("success"); setMessage("JSON export downloaded.");
    } catch (error) {
      setMessageKind("error"); setMessage(error instanceof Error ? error.message : "Could not export your data.");
    } finally { setPending(false); }
  }
  return <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
    <section className="rounded-xl border border-border bg-surface" aria-labelledby="stored-data-title"><div className="border-b border-border px-4 py-3 sm:px-5"><h2 id="stored-data-title" className="font-semibold text-fg">Stored records</h2><p className="text-xs text-fg-subtle">Live counts for the signed-in owner.</p></div>{initialError ? <div role="alert" className="m-4 rounded-md border border-danger/40 bg-danger-soft p-3 text-sm text-danger">Could not load every record count. Refresh to retry.</div> : <dl className="divide-y divide-border">{Object.entries(tableLabels).map(([key, label]) => <div key={key} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5"><dt className="text-sm text-fg-muted">{label}</dt><dd className="font-semibold text-fg tabular-nums">{counts[key] ?? 0}</dd></div>)}</dl>}</section>
    <aside className="rounded-xl border border-border bg-surface p-4" aria-labelledby="export-title"><h2 id="export-title" className="font-semibold text-fg">Export</h2><p className="mt-2 text-sm leading-relaxed text-fg-muted">Download projects, tasks, work sessions, notes, and transactions as one readable JSON file.</p><p className="mt-3 break-all text-xs text-fg-subtle">Owner: {ownerEmail}</p><Button className="mt-5 w-full" variant="secondary" onClick={() => void exportJson()} disabled={pending}><Download aria-hidden="true" />{pending ? "Preparing…" : "Download JSON"}</Button><div className="mt-3 min-h-5 text-xs" role={messageKind === "error" ? "alert" : "status"}><span className={messageKind === "error" ? "text-danger" : "text-success"}>{message}</span></div></aside>
  </div>;
}
