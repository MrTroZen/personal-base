export default function Loading() {
  return <div className="space-y-6 p-6" aria-label="Loading workspace"><div className="h-8 w-64 rounded-md bg-surface-3" /><div className="grid gap-4 lg:grid-cols-3">{[0,1,2].map((item) => <div key={item} className="h-80 rounded-xl bg-surface-2" />)}</div></div>;
}
