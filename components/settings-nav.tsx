"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const sections = [
  { href: "/settings", label: "Preferences" },
  { href: "/archive", label: "Archive" },
  { href: "/data", label: "Data" },
  { href: "/about", label: "About" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Settings sections" className="overflow-x-auto">
      <ul className="flex min-w-max gap-1 rounded-lg bg-surface-2 p-1">
        {sections.map((section) => <li key={section.href}><Link href={section.href} aria-current={pathname === section.href ? "page" : undefined} className={cn("block min-h-10 rounded-md px-3 py-2.5 text-sm font-medium text-fg-muted outline-none transition-colors duration-fast hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus", pathname === section.href && "bg-surface text-fg")}>{section.label}</Link></li>)}
      </ul>
    </nav>
  );
}
