"use client";

import { Check, Clock3, Play, Square, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { WeekStart } from "@/lib/preferences";
import { createClient } from "@/lib/supabase/client";
import { focusRangeStarts } from "@/lib/time";
import type { Project, Task, WorkSession } from "@/lib/work-data";

type FocusTimerProps = {
  projects: Project[];
  tasks: Task[];
  initialSessions: WorkSession[];
  requestedTaskId: string | null;
  timezone: string;
  weekStart: WeekStart;
};

const selectClass = "h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-fg outline-none transition-colors duration-fast focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30";

function elapsedMs(session: WorkSession, now: number) {
  return Math.max(0, (session.ended_at ? new Date(session.ended_at).getTime() : now) - new Date(session.started_at).getTime());
}

function overlapMs(session: WorkSession, rangeStart: number, rangeEnd: number, now: number) {
  const start = Math.max(new Date(session.started_at).getTime(), rangeStart);
  const end = Math.min(session.ended_at ? new Date(session.ended_at).getTime() : now, rangeEnd);
  return Math.max(0, end - start);
}

function formatTimer(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return [hours, minutes, remainder].map((value) => String(value).padStart(2, "0")).join(":");
}

function formatDuration(milliseconds: number) {
  const totalMinutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function FocusTimer({ projects, tasks, initialSessions, requestedTaskId, timezone, weekStart }: FocusTimerProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [now, setNow] = useState(0);
  const [pending, setPending] = useState(false);
  const [totalsLoading, setTotalsLoading] = useState(true);
  const [notice, setNotice] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const active = sessions.find((session) => !session.ended_at) ?? null;
  const completed = sessions.filter((session) => session.ended_at).slice(0, 3);

  useEffect(() => {
    const timeout = window.setTimeout(() => setNow(Date.now()), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const range = focusRangeStarts(new Date(), timezone, weekStart);
    void supabase.from("work_sessions").select("*, project:projects(name), task:tasks(title)").or(`started_at.gte.${new Date(range.week).toISOString()},ended_at.gte.${new Date(range.week).toISOString()},ended_at.is.null`).order("started_at", { ascending: false }).limit(500).then(({ data, error }) => {
      if (error) setNotice({ kind: "error", text: "Could not refresh focus totals. Retry by reloading the page." });
      else setSessions((current) => {
        const merged = new Map(current.map((session) => [session.id, session]));
        for (const session of data ?? []) merged.set(session.id, session as unknown as WorkSession);
        return [...merged.values()].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
      });
      setTotalsLoading(false);
    });
  }, [supabase, timezone, weekStart]);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => {
    if (!requestedTaskId || active) return;
    const task = tasks.find((item) => item.id === requestedTaskId);
    if (!task) return;
    const timeout = window.setTimeout(() => {
      setTaskId(task.id);
      setProjectId(task.project_id ?? "");
      document.getElementById("focus-task")?.focus();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [active, requestedTaskId, tasks]);

  const totals = useMemo(() => {
    const reference = now;
    const range = focusRangeStarts(new Date(reference), timezone, weekStart);
    return {
      today: sessions.reduce((sum, session) => sum + overlapMs(session, range.today, reference, reference), 0),
      week: sessions.reduce((sum, session) => sum + overlapMs(session, range.week, reference, reference), 0),
    };
  }, [now, sessions, timezone, weekStart]);

  function taskChanged(nextTaskId: string) {
    setTaskId(nextTaskId);
    const task = tasks.find((item) => item.id === nextTaskId);
    if (task?.project_id) setProjectId(task.project_id);
    if (task && !task.project_id) setProjectId("");
  }

  async function startSession() {
    setPending(true); setNotice(null);
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Your session expired. Sign in again and retry.");
      const { data: existing, error: existingError } = await supabase.from("work_sessions").select("*, project:projects(name), task:tasks(title)").is("ended_at", null).maybeSingle();
      if (existingError) throw existingError;
      if (existing) {
        setSessions((current) => [existing as unknown as WorkSession, ...current.filter((session) => session.id !== existing.id)]);
        throw new Error("A focus session is already running. It has been restored here.");
      }
      const selectedTask = tasks.find((task) => task.id === taskId);
      const effectiveProjectId = (selectedTask?.project_id ?? projectId) || null;
      const { data, error } = await supabase.from("work_sessions").insert({ user_id: auth.user.id, project_id: effectiveProjectId, task_id: taskId || null, started_at: new Date().toISOString() }).select("*, project:projects(name), task:tasks(title)").single();
      if (error) {
        if (error.code === "23505") {
          const { data: running } = await supabase.from("work_sessions").select("*, project:projects(name), task:tasks(title)").is("ended_at", null).maybeSingle();
          if (running) setSessions((current) => [running as unknown as WorkSession, ...current.filter((session) => session.id !== running.id)]);
          throw new Error("A focus session was already running in another tab and has been restored.");
        }
        throw error;
      }
      setSessions((current) => [data as unknown as WorkSession, ...current]);
      setNow(Date.now());
      setNotice({ kind: "success", text: "Focus session started." });
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "Could not start the focus session." });
    } finally { setPending(false); }
  }

  async function finishSession() {
    if (!active) return;
    setPending(true); setNotice(null);
    const ended_at = new Date().toISOString();
    const { error } = await supabase.from("work_sessions").update({ ended_at }).eq("id", active.id).is("ended_at", null);
    if (error) setNotice({ kind: "error", text: error.message });
    else {
      setSessions((current) => current.map((session) => session.id === active.id ? { ...session, ended_at } : session));
      setNotice({ kind: "success", text: "Session finished and added to history." });
      setTaskId(""); setProjectId("");
    }
    setPending(false);
  }

  async function cancelSession() {
    if (!active || !window.confirm("Cancel this focus session? It will not be kept in history.")) return;
    setPending(true); setNotice(null);
    const { error } = await supabase.from("work_sessions").delete().eq("id", active.id).is("ended_at", null);
    if (error) setNotice({ kind: "error", text: error.message });
    else {
      setSessions((current) => current.filter((session) => session.id !== active.id));
      setNotice({ kind: "success", text: "Session cancelled and removed." });
      setTaskId(""); setProjectId("");
    }
    setPending(false);
  }

  return (
    <section id="focus-timer" className="scroll-mt-header rounded-xl border border-accent/30 bg-surface p-5 sm:p-6" aria-labelledby="focus-title">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div><h2 id="focus-title" className="text-lg font-semibold text-fg">Focus timer</h2><p className="mt-1 text-sm text-fg-muted">Elapsed time follows the saved start time—even after a refresh.</p></div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-sm px-2.5 py-1 text-xs font-medium ${active ? "bg-success-soft text-success" : "bg-surface-2 text-fg-muted"}`}><span className={`size-1.5 rounded-full ${active ? "bg-success" : "bg-fg-subtle"}`} aria-hidden="true" />{active ? "Session running" : "Ready"}</span>
      </div>

      {notice && <div role={notice.kind === "error" ? "alert" : "status"} className={`mb-5 rounded-md border p-3 text-sm ${notice.kind === "error" ? "border-danger/40 bg-danger-soft text-danger" : "border-success/30 bg-success-soft text-success"}`}>{notice.text}</div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)]">
        <div className="flex flex-col justify-between rounded-lg bg-surface-2/55 p-5 sm:min-h-72 sm:p-6">
          {active ? <>
            <div><p className="font-mono text-timer font-medium leading-none tracking-timer text-fg tabular-nums" aria-live="off">{formatTimer(elapsedMs(active, now))}</p><p className="mt-4 text-base font-medium text-fg">{active.task?.title ?? "Open focus session"}</p><p className="mt-1 text-sm text-fg-muted">{active.project?.name ?? "No project selected"}</p><p className="mt-5 text-xs text-fg-subtle">Started {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: timezone }).format(new Date(active.started_at))}</p></div>{/* taste-skill-ignore: elapsed time is a clock */}
            <div className="mt-8 flex flex-wrap gap-2"><Button onClick={() => void finishSession()} disabled={pending}><Square aria-hidden="true" className="fill-current" />Finish session</Button><Button variant="ghost" className="text-danger" onClick={() => void cancelSession()} disabled={pending}><Trash2 aria-hidden="true" />Cancel session</Button></div>
          </> : <>
            <div><p className="text-2xl font-semibold tracking-tight text-fg">Ready when you are</p><p className="mt-2 max-w-prose text-sm leading-relaxed text-fg-muted">Choose context if it helps, or start without a project and task.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium text-fg">Project<select value={projectId} onChange={(event) => { setProjectId(event.target.value); const task = tasks.find((item) => item.id === taskId); if (task?.project_id && task.project_id !== event.target.value) setTaskId(""); }} className={selectClass}><option value="">No project</option>{projects.map((project) => <option key={project.id} value={project.id} disabled={Boolean(project.archived_at)}>{project.name}{project.archived_at ? " (archived)" : ""}</option>)}</select></label><label className="grid gap-2 text-sm font-medium text-fg">Task<select id="focus-task" value={taskId} onChange={(event) => taskChanged(event.target.value)} className={selectClass}><option value="">No task</option>{tasks.filter((task) => !projectId || !task.project_id || task.project_id === projectId).map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select></label></div></div>
            <div className="mt-8"><Button size="lg" onClick={() => void startSession()} disabled={pending}><Play aria-hidden="true" className="fill-current" />{pending ? "Starting…" : "Start focus"}</Button></div>
          </>}
        </div>

        <aside className="space-y-4" aria-label="Focus totals">
          <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-surface" aria-busy={totalsLoading}><div className="p-4"><p className="text-xs text-fg-subtle">Today</p><p className="mt-2 text-xl font-semibold text-fg tabular-nums">{totalsLoading ? <span className="inline-block h-6 w-12 animate-pulse rounded bg-surface-3"><span className="sr-only">Loading today total</span></span> : formatDuration(totals.today)}</p></div><div className="border-l border-border p-4"><p className="text-xs text-fg-subtle">This week</p><p className="mt-2 text-xl font-semibold text-fg tabular-nums">{totalsLoading ? <span className="inline-block h-6 w-12 animate-pulse rounded bg-surface-3"><span className="sr-only">Loading weekly total</span></span> : formatDuration(totals.week)}</p></div></div>
          <div id="focus-history" className="scroll-mt-header rounded-lg border border-border bg-surface p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-fg">Recent sessions</h3><Clock3 aria-hidden="true" className="size-4 text-fg-subtle" /></div>{completed.length === 0 ? <div className="rounded-md border border-dashed border-border-strong p-4 text-center"><p className="text-sm font-medium text-fg">No completed sessions</p><p className="mt-1 text-xs text-fg-subtle">Finished focus time will appear here.</p></div> : <ul className="divide-y divide-border">{completed.map((session) => <li key={session.id} className="flex items-start gap-3 py-3"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success"><Check aria-hidden="true" className="size-3" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-fg">{session.task?.title ?? session.project?.name ?? "Open focus session"}</p><p className="mt-1 truncate text-xs text-fg-subtle">{formatDuration(elapsedMs(session, now))} · {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: timezone }).format(new Date(session.started_at))}</p></div></li>)}</ul>}</div>
        </aside>
      </div>
    </section>
  );
}
