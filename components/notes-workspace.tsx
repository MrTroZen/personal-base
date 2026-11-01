"use client";

import { FileText, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { Note, Project } from "@/lib/work-data";

type NotesWorkspaceProps = {
  initialNotes: Note[];
  projects: Project[];
  initialError: string | null;
};

const fieldClass = "w-full rounded-md border border-border-strong bg-surface px-3 py-2.5 text-sm text-fg outline-none transition-colors duration-fast placeholder:text-fg-subtle focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-focus/30";

function noteTimestamp(note: Note) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(note.updated_at));
}

export function NotesWorkspace({ initialNotes, projects, initialError }: NotesWorkspaceProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [editor, setEditor] = useState<Note | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(initialError);
  const [messageKind, setMessageKind] = useState<"error" | "success">(initialError ? "error" : "success");
  const supabase = useMemo(() => createClient(), []);

  const visibleNotes = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return notes.filter((note) => {
      const matchesProject = projectFilter === "all" || (projectFilter === "none" ? !note.project_id : note.project_id === projectFilter);
      const matchesQuery = !normalized || note.title.toLocaleLowerCase().includes(normalized) || note.content.toLocaleLowerCase().includes(normalized);
      return matchesProject && matchesQuery;
    });
  }, [notes, projectFilter, query]);

  function notify(text: string, kind: "error" | "success" = "success") {
    setMessage(text);
    setMessageKind(kind);
  }

  async function ownerId() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error("Your session expired. Sign in again and retry.");
    return data.user.id;
  }

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const content = String(form.get("content") ?? "").trim();
    const project_id = String(form.get("project_id") ?? "") || null;

    try {
      if (editor === "new") {
        const user_id = await ownerId();
        const { data, error } = await supabase.from("notes").insert({ user_id, title, content, project_id }).select("*, project:projects(name)").single();
        if (error) throw error;
        setNotes((current) => [data as unknown as Note, ...current]);
        notify("Note created.");
      } else if (editor) {
        const { data, error } = await supabase.from("notes").update({ title, content, project_id, updated_at: new Date().toISOString() }).eq("id", editor.id).select("*, project:projects(name)").single();
        if (error) throw error;
        setNotes((current) => current.map((note) => note.id === data.id ? data as unknown as Note : note));
        notify("Note updated.");
      }
      setEditor(null);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not save the note.", "error");
    } finally {
      setPending(false);
    }
  }

  async function deleteNote(note: Note) {
    if (!window.confirm(`Delete “${note.title}”? This cannot be undone.`)) return;
    setPending(true);
    setMessage(null);
    const { error } = await supabase.from("notes").delete().eq("id", note.id);
    if (error) notify(error.message, "error");
    else {
      setNotes((current) => current.filter((item) => item.id !== note.id));
      if (editor !== "new" && editor?.id === note.id) setEditor(null);
      notify("Note deleted.");
    }
    setPending(false);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Notes</h1>
          <p className="mt-1 text-sm text-fg-muted">Capture the details worth keeping close to the work.</p>
        </div>
        <Button onClick={() => setEditor("new")}><Plus aria-hidden="true" />New note</Button>
      </header>

      {message && <div role={messageKind === "error" ? "alert" : "status"} className={`flex items-start justify-between gap-3 rounded-md border p-3 text-sm ${messageKind === "error" ? "border-danger/40 bg-danger-soft text-danger" : "border-success/30 bg-success-soft text-success"}`}><span>{message}</span><button type="button" aria-label="Dismiss message" onClick={() => setMessage(null)}><X aria-hidden="true" className="size-4" /></button></div>}

      {editor && <section aria-labelledby="note-editor-title" className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div><h2 id="note-editor-title" className="text-lg font-semibold text-fg">{editor === "new" ? "Create note" : "Edit note"}</h2><p className="mt-1 text-xs text-fg-subtle">Plain text and light Markdown notation are kept as written.</p></div>
          <Button variant="ghost" size="icon" onClick={() => setEditor(null)} aria-label="Close note editor"><X aria-hidden="true" /></Button>
        </div>
        <form key={editor === "new" ? "new" : editor.id} onSubmit={saveNote} className="grid gap-4" autoComplete="off">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.45fr)]">
            <label className="grid gap-2 text-sm font-medium text-fg">Title<Input name="title" required maxLength={200} defaultValue={editor === "new" ? "" : editor.title} /></label>
            <label className="grid gap-2 text-sm font-medium text-fg">Project<select name="project_id" defaultValue={editor === "new" ? "" : editor.project_id ?? ""} className={fieldClass}><option value="">No project</option>{projects.map((project) => <option key={project.id} value={project.id} disabled={Boolean(project.archived_at)}>{project.name}{project.archived_at ? " (archived)" : ""}</option>)}</select></label>
          </div>
          <label className="grid gap-2 text-sm font-medium text-fg">Content<textarea name="content" rows={9} defaultValue={editor === "new" ? "" : editor.content} className={fieldClass} placeholder="Write a useful detail or decision…" /></label>
          <div className="flex flex-wrap gap-2"><Button type="submit" disabled={pending}>{pending ? "Saving…" : editor === "new" ? "Create note" : "Save changes"}</Button><Button type="button" variant="ghost" onClick={() => setEditor(null)}>Cancel</Button></div>
        </form>
      </section>}

      <div className="grid items-start gap-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="rounded-xl border border-border bg-surface p-4" aria-labelledby="note-filters-title">
          <h2 id="note-filters-title" className="font-semibold text-fg">Find a note</h2>
          <p className="mt-1 text-xs text-fg-subtle">{visibleNotes.length} of {notes.length} notes</p>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-fg"><span className="flex items-center gap-2"><Search aria-hidden="true" className="size-4 text-fg-subtle" />Search</span><Input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notes…" autoComplete="off" /></label>
            <label className="grid gap-2 text-sm font-medium text-fg">Project<select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className={fieldClass}><option value="all">All projects</option><option value="none">No project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}{project.archived_at ? " (archived)" : ""}</option>)}</select></label>
          </div>
        </aside>

        <section aria-labelledby="notes-list-title" className="min-w-0 rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5"><div><h2 id="notes-list-title" className="font-semibold text-fg">Your notes</h2><p className="text-xs text-fg-subtle">Most recently updated first</p></div><FileText aria-hidden="true" className="size-4 text-fg-subtle" /></div>
          {visibleNotes.length === 0 ? <div className="p-5"><div className="rounded-md border border-dashed border-border-strong p-6 text-center"><p className="text-sm font-medium text-fg">{notes.length === 0 ? "No notes yet" : "No notes match"}</p><p className="mt-1 text-xs text-fg-subtle">{notes.length === 0 ? "Create a note for the next detail you want to remember." : "Try a different search or project filter."}</p>{notes.length === 0 && <Button className="mt-4" variant="secondary" size="sm" onClick={() => setEditor("new")}><Plus aria-hidden="true" />Create note</Button>}</div></div> : <ul className="divide-y divide-border">{visibleNotes.map((note) => <li key={note.id} className="p-4 sm:p-5"><article><div className="flex items-start justify-between gap-4"><div className="min-w-0"><h3 className="text-sm font-semibold text-fg">{note.title}</h3><p className="mt-1 text-xs text-fg-subtle"><span>{note.project?.name ?? "No project"}</span><span aria-hidden="true"> · </span><time dateTime={note.updated_at}>Updated {noteTimestamp(note)}</time></p></div><div className="flex shrink-0"><Button variant="ghost" size="icon" className="size-8 min-h-8" onClick={() => setEditor(note)} aria-label={`Edit ${note.title}`}><Pencil aria-hidden="true" /></Button><Button variant="ghost" size="icon" className="size-8 min-h-8 text-danger" onClick={() => void deleteNote(note)} disabled={pending} aria-label={`Delete ${note.title}`}><Trash2 aria-hidden="true" /></Button></div></div>{note.content ? <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">{note.content}</p> : <p className="mt-3 text-sm text-fg-subtle">No content.</p>}</article></li>)}</ul>}
        </section>
      </div>
    </div>
  );
}
