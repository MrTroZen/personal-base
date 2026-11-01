"use client";

import { Archive, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type DragEvent, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { statusLabels, taskStatuses, type Project, type Task, type TaskPriority, type TaskStatus } from "@/lib/work-data";

type WorkspaceProps = { initialProjects: Project[]; initialTasks: Task[]; initialError: string | null };
const fieldClass = "w-full rounded-md border border-border-strong bg-surface px-3 py-2.5 text-sm text-fg outline-none transition-colors duration-fast placeholder:text-fg-subtle focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30";

export function Workspace({ initialProjects, initialTasks, initialError }: WorkspaceProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [tasks, setTasks] = useState(initialTasks);
  const [projectScope, setProjectScope] = useState<string>("all");
  const [projectEditor, setProjectEditor] = useState<Project | "new" | null>(null);
  const [taskEditor, setTaskEditor] = useState<Task | "new" | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(initialError);
  const [messageKind, setMessageKind] = useState<"error" | "success">(initialError ? "error" : "success");
  const supabase = useMemo(() => createClient(), []);
  const visibleTasks = projectScope === "all" ? tasks : tasks.filter((task) => task.project_id === projectScope);
  const projectById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);

  function notify(text: string, kind: "error" | "success" = "success") { setMessage(text); setMessageKind(kind); }

  async function ownerId() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error("Your session expired. Sign in again and retry.");
    return data.user.id;
  }

  async function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage(null);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    try {
      if (projectEditor === "new") {
        const user_id = await ownerId();
        const { data, error } = await supabase.from("projects").insert({ user_id, name, description }).select("*").single();
        if (error) throw error; setProjects((current) => [data as Project, ...current]); notify("Project created.");
      } else if (projectEditor) {
        const { data, error } = await supabase.from("projects").update({ name, description, updated_at: new Date().toISOString() }).eq("id", projectEditor.id).select("*").single();
        if (error) throw error; setProjects((current) => current.map((project) => project.id === data.id ? data as Project : project)); notify("Project updated.");
      }
      setProjectEditor(null);
    } catch (error) { notify(error instanceof Error ? error.message : "Could not save the project.", "error"); } finally { setPending(false); }
  }

  async function archiveProject(project: Project) {
    if (!window.confirm(`Archive “${project.name}”? Its tasks and history will be preserved.`)) return;
    setPending(true); setMessage(null);
    const { error } = await supabase.from("projects").update({ archived_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", project.id);
    if (error) notify(error.message, "error"); else { setProjects((current) => current.filter((item) => item.id !== project.id)); if (projectScope === project.id) setProjectScope("all"); notify("Project archived. Its tasks remain available in All tasks."); }
    setPending(false);
  }

  async function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage(null);
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const project_id = String(form.get("project_id") ?? "") || null;
    const priority = String(form.get("priority")) as TaskPriority;
    const status = String(form.get("status")) as TaskStatus;
    const dueValue = String(form.get("due_at") ?? "");
    const due_at = dueValue ? new Date(`${dueValue}T12:00:00`).toISOString() : null;
    const completed_at = status === "done" ? taskEditor !== "new" && taskEditor?.completed_at || new Date().toISOString() : null;
    try {
      if (taskEditor === "new") {
        const user_id = await ownerId();
        const sort_order = tasks.filter((task) => task.status === status).length;
        const { data, error } = await supabase.from("tasks").insert({ user_id, title, description, project_id, priority, status, due_at, completed_at, sort_order }).select("*").single();
        if (error) throw error; setTasks((current) => [...current, data as Task]); notify("Task created.");
      } else if (taskEditor) {
        const { data, error } = await supabase.from("tasks").update({ title, description, project_id, priority, status, due_at, completed_at, updated_at: new Date().toISOString() }).eq("id", taskEditor.id).select("*").single();
        if (error) throw error; setTasks((current) => current.map((task) => task.id === data.id ? data as Task : task)); notify("Task updated.");
      }
      setTaskEditor(null);
    } catch (error) { notify(error instanceof Error ? error.message : "Could not save the task.", "error"); } finally { setPending(false); }
  }

  async function deleteTask(task: Task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    setPending(true); const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) notify(error.message, "error"); else { setTasks((current) => current.filter((item) => item.id !== task.id)); notify("Task deleted."); }
    setPending(false);
  }

  async function persistOrder(nextTasks: Task[]) {
    setTasks(nextTasks);
    const updates = nextTasks.map((task) => supabase.from("tasks").update({ status: task.status, sort_order: task.sort_order, completed_at: task.completed_at, updated_at: new Date().toISOString() }).eq("id", task.id));
    const results = await Promise.all(updates);
    const failure = results.find((result) => result.error)?.error;
    if (failure) { setTasks(tasks); notify(failure.message, "error"); } else notify("Task order saved.");
  }

  async function moveTask(task: Task, status: TaskStatus, targetIndex?: number) {
    const without = tasks.filter((item) => item.id !== task.id);
    const target = without.filter((item) => item.status === status);
    target.splice(targetIndex ?? target.length, 0, { ...task, status, completed_at: status === "done" ? task.completed_at ?? new Date().toISOString() : null });
    const targetIds = new Set(target.map((item) => item.id));
    const next = without.filter((item) => item.status !== status).concat(target).map((item) => targetIds.has(item.id) ? { ...item, sort_order: target.findIndex((targetTask) => targetTask.id === item.id) } : item);
    await persistOrder(next);
  }

  function dropTask(event: DragEvent, status: TaskStatus) { event.preventDefault(); const task = tasks.find((item) => item.id === event.dataTransfer.getData("text/task-id")); if (task) void moveTask(task, status); }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight text-fg">Projects and tasks</h1><p className="mt-1 text-sm text-fg-muted">Choose the work that matters, then move it forward.</p></div>
        <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setProjectEditor("new")}><Plus aria-hidden="true" />New project</Button><Button onClick={() => setTaskEditor("new")}><Plus aria-hidden="true" />New task</Button></div>
      </header>

      {message && <div role={messageKind === "error" ? "alert" : "status"} className={`flex items-start justify-between gap-3 rounded-md border p-3 text-sm ${messageKind === "error" ? "border-danger/40 bg-danger-soft text-danger" : "border-success/30 bg-success-soft text-success"}`}><span>{message}</span><button type="button" aria-label="Dismiss message" onClick={() => setMessage(null)}><X aria-hidden="true" className="size-4" /></button></div>}

      {(projectEditor || taskEditor) && <section aria-label={projectEditor ? "Project editor" : "Task editor"} className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold text-fg">{projectEditor ? `${projectEditor === "new" ? "Create" : "Edit"} project` : `${taskEditor === "new" ? "Create" : "Edit"} task`}</h2><Button variant="ghost" size="icon" onClick={() => { setProjectEditor(null); setTaskEditor(null); }} aria-label="Close editor"><X aria-hidden="true" /></Button></div>
        {projectEditor ? <ProjectForm project={projectEditor === "new" ? null : projectEditor} pending={pending} onSubmit={saveProject} /> : <TaskForm task={taskEditor === "new" ? null : taskEditor as Task} projects={projects} defaultProject={projectScope} pending={pending} onSubmit={saveTask} />}
      </section>}

      <div className="grid items-start gap-4 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <aside id="projects" className="rounded-xl border border-border bg-surface p-4" aria-labelledby="projects-title">
          <div className="mb-3 flex items-center justify-between"><div><h2 id="projects-title" className="font-semibold text-fg">Projects</h2><p className="text-xs text-fg-subtle">{projects.length} active</p></div></div>
          <button type="button" onClick={() => setProjectScope("all")} className={`mb-1 flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm ${projectScope === "all" ? "bg-surface-2 font-medium text-fg" : "text-fg-muted hover:bg-surface-2/60"}`}><span>All tasks</span><span className="tabular-nums">{tasks.length}</span></button>
          {projects.length === 0 ? <EmptyState title="No projects yet" action="Create a project to give related tasks a home." /> : <ul className="space-y-1">{projects.map((project) => { const projectTasks = tasks.filter((task) => task.project_id === project.id); const done = projectTasks.filter((task) => task.status === "done").length; return <li key={project.id} className={`rounded-md ${projectScope === project.id ? "bg-surface-2" : "hover:bg-surface-2/60"}`}><button type="button" onClick={() => setProjectScope(project.id)} className="w-full px-3 py-2.5 text-left"><span className="block truncate text-sm font-medium text-fg">{project.name}</span><span className="mt-0.5 block text-xs text-fg-subtle tabular-nums">{done} of {projectTasks.length} done</span></button><div className="flex items-center gap-1 px-2 pb-2"><Button asChild variant="ghost" size="sm"><Link href={`/projects/${project.id}`}><ExternalLink aria-hidden="true" />Open</Link></Button><Button variant="ghost" size="icon" className="size-8 min-h-8" onClick={() => setProjectEditor(project)} aria-label={`Edit ${project.name}`}><Pencil aria-hidden="true" /></Button><Button variant="ghost" size="icon" className="size-8 min-h-8" onClick={() => void archiveProject(project)} disabled={pending} aria-label={`Archive ${project.name}`}><Archive aria-hidden="true" /></Button></div></li>; })}</ul>}
        </aside>

        <section id="tasks" aria-labelledby="board-title" className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3"><div><h2 id="board-title" className="font-semibold text-fg">{projectScope === "all" ? "Task board" : projectById.get(projectScope)?.name}</h2><p className="text-xs text-fg-subtle">{visibleTasks.length} tasks in view</p></div></div>
          <div className="grid gap-3 lg:grid-cols-3">{taskStatuses.map((status) => { const columnTasks = visibleTasks.filter((task) => task.status === status).sort((a, b) => a.sort_order - b.sort_order); return <section key={status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropTask(event, status)} className="min-h-56 rounded-xl bg-surface-2/60 p-3" aria-labelledby={`${status}-title`}><div className="mb-3 flex items-center justify-between px-1"><h3 id={`${status}-title`} className="text-sm font-semibold text-fg">{statusLabels[status]}</h3><span className="text-xs text-fg-subtle tabular-nums">{columnTasks.length}</span></div>{columnTasks.length === 0 ? <EmptyState title="Nothing here" action={status === "todo" ? "Create a task or move one into this column." : "Move a task here when its status changes."} /> : <ul className="space-y-2">{columnTasks.map((task, index) => <TaskCard key={task.id} task={task} project={task.project_id ? projectById.get(task.project_id) : undefined} index={index} count={columnTasks.length} onEdit={() => setTaskEditor(task)} onDelete={() => void deleteTask(task)} onMove={(nextStatus) => void moveTask(task, nextStatus)} onReorder={(nextIndex) => void moveTask(task, status, nextIndex)} />)}</ul>}</section>; })}</div>
        </section>
      </div>
    </div>
  );
}

function ProjectForm({ project, pending, onSubmit }: { project: Project | null; pending: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <form onSubmit={onSubmit} className="grid gap-4" autoComplete="off"><label className="grid gap-2 text-sm font-medium text-fg">Name<Input name="name" required maxLength={120} defaultValue={project?.name} autoComplete="off" /></label><label className="grid gap-2 text-sm font-medium text-fg">Description<textarea name="description" rows={3} defaultValue={project?.description} className={fieldClass} autoComplete="off" /></label><div><Button type="submit" disabled={pending}>{pending ? "Saving…" : project ? "Save project" : "Create project"}</Button></div></form>; }

function TaskForm({ task, projects, defaultProject, pending, onSubmit }: { task: Task | null; projects: Project[]; defaultProject: string; pending: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) { return <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2" autoComplete="off"><label className="grid gap-2 text-sm font-medium text-fg md:col-span-2">Title<Input name="title" required maxLength={200} defaultValue={task?.title} autoComplete="off" /></label><label className="grid gap-2 text-sm font-medium text-fg md:col-span-2">Description<textarea name="description" rows={3} defaultValue={task?.description} className={fieldClass} autoComplete="off" /></label><label className="grid gap-2 text-sm font-medium text-fg">Project<select name="project_id" defaultValue={task?.project_id ?? (defaultProject === "all" ? "" : defaultProject)} className={fieldClass}><option value="">No project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label className="grid gap-2 text-sm font-medium text-fg">Status<select name="status" defaultValue={task?.status ?? "todo"} className={fieldClass}>{taskStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></label><label className="grid gap-2 text-sm font-medium text-fg">Priority<select name="priority" defaultValue={task?.priority ?? "medium"} className={fieldClass}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label className="grid gap-2 text-sm font-medium text-fg">Due date<Input name="due_at" type="date" defaultValue={task?.due_at?.slice(0, 10)} /></label><div className="md:col-span-2"><Button type="submit" disabled={pending}>{pending ? "Saving…" : task ? "Save task" : "Create task"}</Button></div></form>; }

function EmptyState({ title, action }: { title: string; action: string }) { return <div className="rounded-md border border-dashed border-border-strong px-3 py-5 text-center"><p className="text-sm font-medium text-fg">{title}</p><p className="mt-1 text-xs leading-relaxed text-fg-subtle">{action}</p></div>; }

function TaskCard({ task, project, index, count, onEdit, onDelete, onMove, onReorder }: { task: Task; project?: Project; index: number; count: number; onEdit: () => void; onDelete: () => void; onMove: (status: TaskStatus) => void; onReorder: (index: number) => void }) {
  const statusIndex = taskStatuses.indexOf(task.status);
  return <li draggable onDragStart={(event) => { event.dataTransfer.setData("text/task-id", task.id); event.dataTransfer.effectAllowed = "move"; }} className="group rounded-lg border border-border bg-surface p-3 transition-colors duration-fast hover:border-border-strong"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm font-medium text-fg">{task.title}</p>{task.description && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-subtle">{task.description}</p>}</div><span className={`shrink-0 rounded-sm px-2 py-0.5 text-xs font-medium ${task.priority === "high" ? "bg-danger-soft text-danger" : task.priority === "low" ? "bg-surface-2 text-fg-muted" : "bg-warning-soft text-warning"}`}>{task.priority}</span></div><div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-fg-subtle"><span>{project?.name ?? "No project"}</span>{task.due_at && <><span aria-hidden="true">·</span><time dateTime={task.due_at}>{new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(task.due_at))}</time></>}</div><div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2"><div className="flex"><Button variant="ghost" size="icon" className="size-8 min-h-8" disabled={index === 0} onClick={() => onReorder(index - 1)} aria-label={`Move ${task.title} up`}><ChevronUp aria-hidden="true" /></Button><Button variant="ghost" size="icon" className="size-8 min-h-8" disabled={index === count - 1} onClick={() => onReorder(index + 1)} aria-label={`Move ${task.title} down`}><ChevronDown aria-hidden="true" /></Button>{statusIndex > 0 && <Button variant="ghost" size="icon" className="size-8 min-h-8" onClick={() => onMove(taskStatuses[statusIndex - 1])} aria-label={`Move ${task.title} to ${statusLabels[taskStatuses[statusIndex - 1]]}`}><ArrowLeft aria-hidden="true" /></Button>}{statusIndex < taskStatuses.length - 1 && <Button variant="ghost" size="icon" className="size-8 min-h-8" onClick={() => onMove(taskStatuses[statusIndex + 1])} aria-label={`Move ${task.title} to ${statusLabels[taskStatuses[statusIndex + 1]]}`}><ArrowRight aria-hidden="true" /></Button>}</div><div className="flex"><Button variant="ghost" size="icon" className="size-8 min-h-8" onClick={onEdit} aria-label={`Edit ${task.title}`}><Pencil aria-hidden="true" /></Button><Button variant="ghost" size="icon" className="size-8 min-h-8 text-danger" onClick={onDelete} aria-label={`Delete ${task.title}`}><Trash2 aria-hidden="true" /></Button></div></div></li>;
}
