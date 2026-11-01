"use client";

import {
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  Menu,
  LogOut,
  SquareKanban,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Projects & tasks", icon: SquareKanban, href: "/work" },
  { label: "Money", icon: CircleDollarSign, href: "/money" },
  { label: "Notes", icon: FileText, href: "/notes" },
];

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-accent/30 bg-accent-soft text-accent">
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
  const pathname = usePathname();
  return (
    <nav aria-label={mobile ? "Mobile primary" : "Primary"}>
      <ul className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const baseHref = item.href?.split("#")[0] ?? "";
          const isCurrent = item.label === "Projects & tasks" ? pathname === "/work" || pathname.startsWith("/projects/") : Boolean(item.href && !item.href.includes("#") && (baseHref === "/" ? pathname === "/" : pathname.startsWith(baseHref)));
          return (
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={onNavigate}
                  className={cn("group relative flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-fg-muted outline-none transition-colors duration-fast hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus", isCurrent && "bg-surface-2 text-fg")}
                >
                  <Icon aria-hidden="true" className="size-4" />
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

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
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-3 text-xs font-semibold text-fg">
                {ownerInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-medium text-fg"><span className="size-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />Your workspace</p>
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
        <header className="sticky top-0 z-sticky border-b border-border bg-bg">
          <div className="flex h-header items-center gap-3 px-4 sm:px-6 lg:px-8">
            <div className="mr-auto flex min-w-0 items-center gap-3 lg:hidden">
              <Button
                ref={menuButtonRef}
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
              <span className="text-fg-subtle">Personal Base</span>
              <span aria-hidden="true" className="text-border-strong">/</span>
              <span className="font-medium text-fg">{pathname.startsWith("/projects/") ? "Project detail" : pathname === "/work" ? "Projects & tasks" : pathname === "/notes" ? "Notes" : pathname === "/money" ? "Money" : "Dashboard"}</span>
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
