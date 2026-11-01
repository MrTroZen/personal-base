import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Circle,
  Clock3,
  Coffee,
  Play,
  Sparkles,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getOwnerIdentity } from "@/lib/auth";

const tasks = [
  { title: "Refine the dashboard visual system", project: "Personal Base", due: "Today", done: false },
  { title: "Review project priorities for the week", project: "Weekly planning", due: "Today", done: false },
  { title: "Archive last month’s completed notes", project: "Personal Base", due: "Done", done: true },
];

const projects = [
  { name: "Personal Base", description: "Design and build the private work dashboard.", progress: 28, tone: "bg-accent" },
  { name: "Portfolio refresh", description: "Tighten case studies and visual presentation.", progress: 64, tone: "bg-violet" },
];

export const dynamic = "force-dynamic";

function SectionHeading({ title, eyebrow }: { title: string; eyebrow: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-label text-accent">{eyebrow}</p>
      <h2 className="text-lg font-semibold tracking-tight text-fg">{title}</h2>
    </div>
  );
}

export default async function DashboardPage() {
  const owner = await getOwnerIdentity();

  if (!owner) {
    redirect("/sign-in");
  }

  return (
    <AppShell ownerEmail={owner.email} ownerInitial={owner.initial} signOutAction={signOut}>
      <div className="space-y-8">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end" aria-labelledby="dashboard-title">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-fg-muted">
              <CalendarDays aria-hidden="true" className="size-4 text-accent" />
              <span>Sunday, November 1</span>
            </div>
            <h1 id="dashboard-title" className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              Good morning. <span className="text-fg-muted">What matters today?</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-fg-muted">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-pulse motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            Ready to focus
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-dashboard" aria-label="Focus overview">
          <article className="relative isolate overflow-hidden rounded-xl border border-accent/20 bg-focus-card p-5 shadow-focus sm:p-7">
            <div aria-hidden="true" className="pointer-events-none absolute -right-glow -top-glow -z-10 size-glow rounded-full bg-accent-glow blur-glow" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-focus-line" />

            <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:justify-between">
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-8">
                <div>
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                      <Sparkles aria-hidden="true" className="size-3.5" />
                      Focus session
                    </span>
                    <span className="text-xs text-fg-subtle">Timer preview</span>
                  </div>
                  <p className="font-mono text-timer font-medium leading-none tracking-timer text-fg tabular-nums" aria-label="25 minutes">
                    25:00
                  </p>
                  <p className="mt-3 max-w-prose text-sm leading-relaxed text-fg-muted">
                    Settle into one meaningful task. The live timer and session saving will be connected in a later build step.
                  </p>
                </div>

                <div className="flex flex-col gap-4 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-surface-2 text-accent">
                      <BriefcaseBusiness aria-hidden="true" className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-fg">Personal Base</p>
                      <p className="truncate text-xs text-fg-subtle">Refine the dashboard visual system</p>
                    </div>
                  </div>
                  <Button className="shrink-0 whitespace-nowrap" size="lg" disabled title="The live timer is implemented in build step four">
                    <Play aria-hidden="true" className="fill-current" />
                    Start focus
                  </Button>
                </div>
              </div>

              <aside className="grid gap-3 border-t border-border/70 pt-5 lg:w-focus-aside lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0" aria-label="Focus session settings">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface/55 p-4">
                  <div>
                    <p className="text-xs text-fg-subtle">Duration</p>
                    <p className="mt-1 text-sm font-medium text-fg">25 minutes</p>
                  </div>
                  <Clock3 aria-hidden="true" className="size-4 text-accent" />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface/55 p-4">
                  <div>
                    <p className="text-xs text-fg-subtle">After focus</p>
                    <p className="mt-1 text-sm font-medium text-fg">5 minute break</p>
                  </div>
                  <Coffee aria-hidden="true" className="size-4 text-violet" />
                </div>
                <div className="rounded-lg border border-border bg-surface/55 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3 text-xs">
                    <span className="text-fg-subtle">Today’s rhythm</span>
                    <span className="font-medium text-fg">2 of 4</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5" role="img" aria-label="Two of four focus sessions complete">
                    {[true, true, false, false].map((complete, index) => (
                      <span key={index} className={`h-1.5 rounded-full ${complete ? "bg-accent" : "bg-surface-3"}`} />
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </article>

          <article className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <SectionHeading eyebrow="This week" title="Focused time" />
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                <TrendingUp aria-hidden="true" className="size-3.5" />
                18%
              </span>
            </div>
            <div className="mb-6">
              <p className="text-3xl font-semibold tracking-tight text-fg tabular-nums">12h 40m</p>
              <p className="mt-1 text-sm text-fg-subtle">Across 18 work sessions</p>
            </div>
            <div className="mt-auto flex h-chart items-end gap-2" role="img" aria-label="Focus time trend: Monday through Sunday">
              {[42, 68, 54, 82, 62, 38, 22].map((height, index) => (
                <div key={index} className="flex h-full flex-1 items-end">
                  <div
                    className={`w-full rounded-sm ${index === 3 ? "bg-accent" : "bg-surface-3"}`}
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2 text-center text-kbd text-fg-subtle" aria-hidden="true">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
            </div>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-content" aria-label="Work overview">
          <article className="rounded-xl border border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-border p-5 sm:p-6">
              <SectionHeading eyebrow="Priority" title="Today’s tasks" />
              <span className="text-xs font-medium text-fg-subtle">2 remaining</span>
            </div>
            <ul className="divide-y divide-border px-5 sm:px-6">
              {tasks.map((task) => (
                <li key={task.title} className="flex gap-3 py-4">
                  <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${task.done ? "border-success/40 bg-success-soft text-success" : "border-border-strong text-transparent"}`}>
                    {task.done ? <Check aria-hidden="true" className="size-3" /> : <Circle aria-hidden="true" className="size-2" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${task.done ? "text-fg-subtle line-through" : "text-fg"}`}>{task.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-subtle">
                      <span>{task.project}</span>
                      <span aria-hidden="true">·</span>
                      <span>{task.due}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <SectionHeading eyebrow="Active" title="Projects" />
              <BriefcaseBusiness aria-hidden="true" className="size-4 text-fg-subtle" />
            </div>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.name} className="rounded-lg border border-border bg-surface-2/50 p-4">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-fg">{project.name}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-subtle">{project.description}</p>
                    </div>
                    <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-fg-subtle" />
                  </div>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-fg-subtle">Progress</span>
                    <span className="font-medium text-fg">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <div className={`h-full rounded-full ${project.tone}`} style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Quick summaries">
          <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-5 grid size-9 place-items-center rounded-lg bg-accent-soft text-accent">
              <Clock3 aria-hidden="true" className="size-4" />
            </div>
            <p className="text-xs font-medium uppercase tracking-label text-fg-subtle">Last session</p>
            <p className="mt-2 text-lg font-semibold text-fg">48 minutes</p>
            <p className="mt-1 text-xs text-fg-subtle">Personal Base · Yesterday</p>
          </article>
          <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-5 grid size-9 place-items-center rounded-lg bg-violet-soft text-violet">
              <WalletCards aria-hidden="true" className="size-4" />
            </div>
            <p className="text-xs font-medium uppercase tracking-label text-fg-subtle">Month balance</p>
            <p className="mt-2 text-lg font-semibold text-fg tabular-nums">+$1,240</p>
            <p className="mt-1 text-xs text-fg-subtle">Preview data · November</p>
          </article>
          <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-5 grid size-9 place-items-center rounded-lg bg-success-soft text-success">
              <Check aria-hidden="true" className="size-4" />
            </div>
            <p className="text-xs font-medium uppercase tracking-label text-fg-subtle">Weekly progress</p>
            <p className="mt-2 text-lg font-semibold text-fg">14 tasks done</p>
            <p className="mt-1 text-xs text-fg-subtle">4 more than last week</p>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
