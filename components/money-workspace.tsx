"use client";

import { Pencil, Plus, Trash2, WalletCards, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { Project, Transaction, TransactionKind } from "@/lib/work-data";

type MoneyWorkspaceProps = {
  initialTransactions: Transaction[];
  projects: Project[];
  initialError: string | null;
};

const fieldClass = "w-full rounded-md border border-border-strong bg-surface px-3 py-2.5 text-sm text-fg outline-none transition-colors duration-fast focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30";

function localDateInput(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function sortTransactions(rows: Transaction[]) {
  return [...rows].sort((a, b) => b.occurred_on.localeCompare(a.occurred_on) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function MoneyWorkspace({ initialTransactions, projects, initialError }: MoneyWorkspaceProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [editor, setEditor] = useState<Transaction | "new" | null>(null);
  const [projectFilter, setProjectFilter] = useState("all");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(initialError);
  const [messageKind, setMessageKind] = useState<"error" | "success">(initialError ? "error" : "success");
  const supabase = useMemo(() => createClient(), []);
  const currentMonthKey = localDateInput().slice(0, 7);
  const currentMonthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date());
  const currentMonthTransactions = transactions.filter((transaction) => transaction.occurred_on.startsWith(currentMonthKey));
  const totals = currentMonthTransactions.reduce((summary, transaction) => {
    const amount = Number(transaction.amount);
    if (transaction.kind === "income") summary.income += amount;
    else summary.expenses += amount;
    return summary;
  }, { income: 0, expenses: 0 });
  const net = totals.income - totals.expenses;
  const recentTransactions = (projectFilter === "all" ? transactions : transactions.filter((transaction) => projectFilter === "none" ? !transaction.project_id : transaction.project_id === projectFilter)).slice(0, 12);
  const projectSummaries = projects.map((project) => {
    const rows = currentMonthTransactions.filter((transaction) => transaction.project_id === project.id);
    const income = rows.filter((transaction) => transaction.kind === "income").reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const expenses = rows.filter((transaction) => transaction.kind === "expense").reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    return { project, income, expenses, net: income - expenses, count: rows.length };
  }).filter((summary) => summary.count > 0);

  function notify(text: string, kind: "error" | "success" = "success") {
    setMessage(text);
    setMessageKind(kind);
  }

  async function ownerId() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error("Your session expired. Sign in again and retry.");
    return data.user.id;
  }

  async function saveTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const description = String(form.get("description") ?? "").trim();
    const kind = String(form.get("kind")) as TransactionKind;
    const amount = Number(form.get("amount"));
    const occurred_on = String(form.get("occurred_on"));
    const project_id = String(form.get("project_id") ?? "") || null;

    try {
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be greater than zero.");
      if (editor === "new") {
        const user_id = await ownerId();
        const { data, error } = await supabase.from("transactions").insert({ user_id, description, kind, amount, occurred_on, project_id }).select("*, project:projects(name)").single();
        if (error) throw error;
        setTransactions((current) => sortTransactions([data as unknown as Transaction, ...current]));
        notify("Transaction added.");
      } else if (editor) {
        const { data, error } = await supabase.from("transactions").update({ description, kind, amount, occurred_on, project_id, updated_at: new Date().toISOString() }).eq("id", editor.id).select("*, project:projects(name)").single();
        if (error) throw error;
        setTransactions((current) => sortTransactions(current.map((transaction) => transaction.id === data.id ? data as unknown as Transaction : transaction)));
        notify("Transaction updated.");
      }
      setEditor(null);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not save the transaction.", "error");
    } finally {
      setPending(false);
    }
  }

  async function deleteTransaction(transaction: Transaction) {
    if (!window.confirm(`Delete “${transaction.description}”? This cannot be undone.`)) return;
    setPending(true);
    setMessage(null);
    const { error } = await supabase.from("transactions").delete().eq("id", transaction.id);
    if (error) notify(error.message, "error");
    else {
      setTransactions((current) => current.filter((item) => item.id !== transaction.id));
      if (editor !== "new" && editor?.id === transaction.id) setEditor(null);
      notify("Transaction deleted.");
    }
    setPending(false);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight text-fg">Money</h1><p className="mt-1 text-sm text-fg-muted">A concise record of what came in, what went out, and where it belongs.</p></div>
        <Button onClick={() => setEditor("new")}><Plus aria-hidden="true" />Add transaction</Button>
      </header>

      {message && <div role={messageKind === "error" ? "alert" : "status"} className={`flex items-start justify-between gap-3 rounded-md border p-3 text-sm ${messageKind === "error" ? "border-danger/40 bg-danger-soft text-danger" : "border-success/30 bg-success-soft text-success"}`}><span>{message}</span><button type="button" aria-label="Dismiss message" onClick={() => setMessage(null)}><X aria-hidden="true" className="size-4" /></button></div>}

      {editor && <section aria-labelledby="transaction-editor-title" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4"><div><h2 id="transaction-editor-title" className="text-lg font-semibold text-fg">{editor === "new" ? "Add transaction" : "Edit transaction"}</h2><p className="mt-1 text-xs text-fg-subtle">Amounts are stored without a currency field, so values are shown without a currency symbol.</p></div><Button variant="ghost" size="icon" onClick={() => setEditor(null)} aria-label="Close transaction editor"><X aria-hidden="true" /></Button></div>
        <form key={editor === "new" ? "new" : editor.id} onSubmit={saveTransaction} className="grid gap-4" autoComplete="off">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_minmax(9rem,0.5fr)_minmax(10rem,0.6fr)]">
            <label className="grid gap-2 text-sm font-medium text-fg">Description<Input name="description" required maxLength={200} defaultValue={editor === "new" ? "" : editor.description} /></label>
            <label className="grid gap-2 text-sm font-medium text-fg">Type<select name="kind" defaultValue={editor === "new" ? "expense" : editor.kind} className={fieldClass}><option value="income">Income</option><option value="expense">Expense</option></select></label>
            <label className="grid gap-2 text-sm font-medium text-fg">Amount<Input name="amount" type="number" min="0.01" step="0.01" inputMode="decimal" required defaultValue={editor === "new" ? "" : Number(editor.amount).toFixed(2)} /></label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-fg">Date<Input name="occurred_on" type="date" required defaultValue={editor === "new" ? localDateInput() : editor.occurred_on} /></label>
            <label className="grid gap-2 text-sm font-medium text-fg">Project<select name="project_id" defaultValue={editor === "new" ? "" : editor.project_id ?? ""} className={fieldClass}><option value="">No project</option>{projects.map((project) => <option key={project.id} value={project.id} disabled={Boolean(project.archived_at)}>{project.name}{project.archived_at ? " (archived)" : ""}</option>)}</select></label>
          </div>
          <div className="flex flex-wrap gap-2"><Button type="submit" disabled={pending}>{pending ? "Saving…" : editor === "new" ? "Add transaction" : "Save changes"}</Button><Button type="button" variant="ghost" onClick={() => setEditor(null)}>Cancel</Button></div>
        </form>
      </section>}

      <section aria-labelledby="month-summary-title" className="rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3 sm:px-5"><h2 id="month-summary-title" className="font-semibold text-fg">{currentMonthLabel}</h2><p className="text-xs text-fg-subtle">Current month from {currentMonthTransactions.length} transaction{currentMonthTransactions.length === 1 ? "" : "s"}</p></div>
        <dl className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-4 sm:p-5"><dt className="text-sm text-fg-muted">Income</dt><dd className="mt-2 text-2xl font-semibold text-success tabular-nums">+{formatAmount(totals.income)}</dd></div>
          <div className="p-4 sm:p-5"><dt className="text-sm text-fg-muted">Expenses</dt><dd className="mt-2 text-2xl font-semibold text-fg tabular-nums">−{formatAmount(totals.expenses)}</dd></div>
          <div className="p-4 sm:p-5"><dt className="text-sm text-fg-muted">Net</dt><dd className={`mt-2 text-2xl font-semibold tabular-nums ${net < 0 ? "text-danger" : "text-fg"}`}>{net > 0 ? "+" : net < 0 ? "−" : ""}{formatAmount(Math.abs(net))}</dd></div>
        </dl>
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <section aria-labelledby="recent-transactions-title" className="min-w-0 rounded-xl border border-border bg-surface">
          <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div><h2 id="recent-transactions-title" className="font-semibold text-fg">Recent transactions</h2><p className="text-xs text-fg-subtle">{recentTransactions.length} shown</p></div><label className="flex items-center gap-2 text-sm text-fg-muted"><span>Project</span><select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className={`${fieldClass} min-w-44 py-2`}><option value="all">All projects</option><option value="none">No project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}{project.archived_at ? " (archived)" : ""}</option>)}</select></label></div>
          {recentTransactions.length === 0 ? <div className="p-5"><div className="rounded-md border border-dashed border-border-strong p-6 text-center"><p className="text-sm font-medium text-fg">{transactions.length === 0 ? "No transactions yet" : "No transactions match"}</p><p className="mt-1 text-xs text-fg-subtle">{transactions.length === 0 ? "Add the next income or expense when it happens." : "Choose another project filter."}</p>{transactions.length === 0 && <Button className="mt-4" variant="secondary" size="sm" onClick={() => setEditor("new")}><Plus aria-hidden="true" />Add transaction</Button>}</div></div> : <ul className="divide-y divide-border">{recentTransactions.map((transaction) => <li key={transaction.id} className="p-4 sm:px-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-medium text-fg">{transaction.description}</h3><span className={`text-xs font-medium ${transaction.kind === "income" ? "text-success" : "text-fg-subtle"}`}>{transaction.kind === "income" ? "Income" : "Expense"}</span></div><p className="mt-1 truncate text-xs text-fg-subtle">{transaction.project?.name ?? "No project"} · <time dateTime={transaction.occurred_on}>{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${transaction.occurred_on}T00:00:00Z`))}</time></p></div><p className={`shrink-0 text-sm font-semibold tabular-nums ${transaction.kind === "income" ? "text-success" : "text-fg"}`}>{transaction.kind === "income" ? "+" : "−"}{formatAmount(Number(transaction.amount))}</p></div><div className="mt-2 flex justify-end"><Button variant="ghost" size="icon" className="size-8 min-h-8" onClick={() => setEditor(transaction)} aria-label={`Edit ${transaction.description}`}><Pencil aria-hidden="true" /></Button><Button variant="ghost" size="icon" className="size-8 min-h-8 text-danger" onClick={() => void deleteTransaction(transaction)} disabled={pending} aria-label={`Delete ${transaction.description}`}><Trash2 aria-hidden="true" /></Button></div></li>)}</ul>}
        </section>

        <aside className="rounded-xl border border-border bg-surface" aria-labelledby="project-money-title">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3"><div><h2 id="project-money-title" className="font-semibold text-fg">Projects this month</h2><p className="text-xs text-fg-subtle">Linked transactions only</p></div><WalletCards aria-hidden="true" className="size-4 text-fg-subtle" /></div>
          {projectSummaries.length === 0 ? <div className="p-4"><div className="rounded-md border border-dashed border-border-strong p-4 text-center"><p className="text-sm font-medium text-fg">No project activity</p><p className="mt-1 text-xs text-fg-subtle">Link a transaction to a project to see its monthly summary.</p></div></div> : <ul className="divide-y divide-border">{projectSummaries.map(({ project, income, expenses, net: projectNet, count }) => <li key={project.id} className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-fg">{project.name}</p><p className="mt-1 text-xs text-fg-subtle">{count} transaction{count === 1 ? "" : "s"}</p></div><p className={`shrink-0 text-sm font-semibold tabular-nums ${projectNet < 0 ? "text-danger" : "text-fg"}`}>{projectNet > 0 ? "+" : projectNet < 0 ? "−" : ""}{formatAmount(Math.abs(projectNet))}</p></div><dl className="mt-3 grid grid-cols-2 gap-3 text-xs"><div><dt className="text-fg-subtle">Income</dt><dd className="mt-1 text-success tabular-nums">+{formatAmount(income)}</dd></div><div className="text-right"><dt className="text-fg-subtle">Expenses</dt><dd className="mt-1 text-fg-muted tabular-nums">−{formatAmount(expenses)}</dd></div></dl></li>)}</ul>}
        </aside>
      </div>
    </div>
  );
}
