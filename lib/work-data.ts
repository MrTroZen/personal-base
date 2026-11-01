export const taskStatuses = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = "low" | "medium" | "high";
export type Project = { id: string; user_id: string; name: string; description: string; archived_at: string | null; created_at: string; updated_at: string };
export type Task = { id: string; user_id: string; project_id: string | null; title: string; description: string; status: TaskStatus; priority: TaskPriority; sort_order: number; due_at: string | null; completed_at: string | null; created_at: string; updated_at: string };
export const statusLabels: Record<TaskStatus, string> = { todo: "To do", in_progress: "In progress", done: "Done" };
