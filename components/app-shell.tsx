"use client";

import {
  BriefcaseBusiness,
  CircleDollarSign,
  Clock3,
  FileText,
  LayoutDashboard,
  Menu,
  LogOut,
  PanelLeftClose,
  Search,
  SquareKanban,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, current: true },
  { label: "Projects", icon: BriefcaseBusiness },
  { label: "Tasks", icon: SquareKanban },
  { label: "Sessions", icon: Clock3 },
  { label: "Money", icon: CircleDollarSign },
  { label: "Notes", icon: FileText },
];

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-accent/30 bg-accent-soft text-accent shadow-accent">
        <span className="text-sm font-semibold tracking-tight">PB</span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-fg">Personal Base</p>
        <p className="truncate text-xs text-fg-subtle">Private workspace</p>
      </div>
    </div>
  );
}

function Navigation({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  return (
    <nav aria-label={mobile ? "Mobile primary" : "Primary"}>
      <ul className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label}>
              {item.current ? (
                <Link
                  href="/"
                  aria-current="page"
                  onClick={onNavigate}
                  className="group relative flex min-h-10 items-center gap-3 rounded-md bg-surface-2 px-3 text-sm font-medium text-fg outline-none transition-colors duration-fast before:absolute before:inset-y-2 before:left-0 before:w-border-active before:rounded-full before:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  <Icon aria-hidden="true" className="size-4 text-accent" />
                  {item.label}
                </Link>
              ) : (
                <span
                  className="flex min-h-10 cursor-not-allowed items-center gap-3 rounded-md px-3 text-sm font-medium text-fg-muted"
                  title={`${item.label} will be added in a later build step`}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

type AppShellProps = {
  children: ReactNode;
  ownerEmail: string;
  ownerInitial: string;
  signOutAction: () => Promise<void>;
};

export function AppShell({ children, ownerEmail, ownerInitial, signOutAction }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <a
        href="#main-content"
        className="fixed left-2 top-2 z-toast -translate-y-[200%] rounded-md bg-surface px-4 py-2 text-sm font-medium text-fg shadow-lg outline-none transition-transform focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-focus"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-sticky hidden w-sidebar flex-col border-r border-border bg-sidebar lg:flex">
        <div className="flex h-header items-center border-b border-border px-5">
          <Brand />
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-between gap-8 overflow-y-auto p-4">
          <Navigation />
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-surface/60 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-fg-muted">
                <span className="size-1.5 rounded-full bg-success shadow-status" />
                Secure session
              </div>
              <p className="text-xs leading-relaxed text-fg-subtle">
                Verified with Supabase Auth for the configured owner.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-3 text-xs font-semibold text-fg">
                {ownerInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">Your workspace</p>
                <p className="truncate text-xs text-fg-subtle" title={ownerEmail}>{ownerEmail}</p>
              </div>
              <form action={signOutAction}>
                <Button variant="ghost" size="icon" type="submit" aria-label="Sign out" title="Sign out">
                  <LogOut aria-hidden="true" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[var(--width-sidebar)]">
        <header className="sticky top-0 z-sticky border-b border-border bg-bg-translucent backdrop-blur-xl">
          <div className="flex h-header items-center gap-3 px-4 sm:px-6 lg:px-8">
            <div className="mr-auto flex min-w-0 items-center gap-3 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
              </Button>
              <Brand />
            </div>

            <div className="hidden items-center gap-2 text-sm lg:flex">
              <span className="text-fg-subtle">Workspace</span>
              <span aria-hidden="true" className="text-border-strong">/</span>
              <span className="font-medium text-fg">Dashboard</span>
            </div>

            <div className="ml-auto hidden items-center gap-2 sm:flex">
              <div className="hidden items-center gap-2 rounded-md border border-border bg-surface/70 px-3 py-2 text-xs text-fg-subtle md:flex">
                <Search aria-hidden="true" className="size-3.5" />
                <span>Search coming later</span>
                <kbd className="ml-2 rounded-sm border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-kbd">⌘ K</kbd>
              </div>
              <Button variant="ghost" size="icon" disabled title="Sidebar controls are unavailable in this preview">
                <span className="sr-only">Collapse sidebar unavailable in preview</span>
                <PanelLeftClose aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div
            id="mobile-navigation"
            hidden={!menuOpen}
            className={cn("border-t border-border bg-sidebar p-4 lg:hidden", menuOpen && "animate-menu-in")}
          >
            <Navigation mobile onNavigate={() => setMenuOpen(false)} />
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-page px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
