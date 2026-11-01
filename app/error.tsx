"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="grid min-h-dvh place-items-center bg-bg p-6"><div className="max-w-md rounded-xl border border-danger/30 bg-surface p-6"><h1 className="text-xl font-semibold text-fg">Couldn’t load the workspace</h1><p className="mt-2 text-sm text-fg-muted">Your data is safe. Check the connection and try again.</p><Button className="mt-5" onClick={reset}>Try again</Button></div></main>; }
