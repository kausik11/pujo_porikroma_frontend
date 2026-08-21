import Link from "next/link";

export type ShellProps = {
  children: React.ReactNode;
  variant?: "admin" | "public";
};

export function Shell({ children, variant = "admin" }: ShellProps) {
  const publicFacing = variant === "public";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="text-lg font-semibold text-slate-950">
            {publicFacing ? "PujaWay" : "PujaWay Admin"}
          </Link>
          <div className="flex flex-wrap gap-2 text-sm font-medium text-slate-700">
            <Link href="/locations" className="rounded-md px-3 py-2 hover:bg-slate-100">Pujas</Link>
            <Link href="/locations/near-me" className="rounded-md px-3 py-2 hover:bg-slate-100">Near Me</Link>
            <Link href="/route-planner" className="rounded-md px-3 py-2 hover:bg-slate-100">Puja Trails</Link>
            <Link href="/multi-office-route" className="rounded-md px-3 py-2 hover:bg-slate-100">Multi-Puja Route</Link>
            {publicFacing ? null : <Link href="/admin" className="rounded-md px-3 py-2 hover:bg-slate-100">Admin</Link>}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
