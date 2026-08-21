"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, ListPlus, LogOut, MapPinned, Plus, Route, Settings } from "lucide-react";
import styles from "@/app/pujaway.module.css";
import { PujaWayHeader } from "@/components/pujaway/PujaWayHeader";

export type ShellProps = {
  children: React.ReactNode;
  variant?: "admin" | "public";
};

export function Shell({ children, variant = "admin" }: ShellProps) {
  const publicFacing = variant === "public";
  const pathname = usePathname();

  if (publicFacing) {
    return (
      <div className={styles.page}>
        <PujaWayHeader />
        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[1230px] px-6 py-12 sm:py-16">
          {children}
        </main>
      </div>
    );
  }

  const adminLinks = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Manage Pujas", href: "/admin/locations", icon: MapPinned },
    { label: "Add Puja", href: "/admin/locations/new", icon: Plus },
  ];
  const publicLinks = [
    { label: "Public Home", href: "/", icon: Home },
    { label: "Browse Pujas", href: "/locations", icon: MapPinned },
    { label: "Near Me", href: "/locations/near-me", icon: ListPlus },
    { label: "Puja Trails", href: "/route-planner", icon: Route },
  ];

  function isActive(href: string) {
    if (href === "/admin") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-b border-slate-200 bg-slate-950 text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex min-h-full flex-col gap-6 px-4 py-5">
          <Link href="/admin" className="rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
            <span className="block text-xl font-semibold">PujaWay Admin</span>
            <span className="mt-1 block text-xs font-medium text-slate-400">Manage Puja listings</span>
          </Link>

          <nav aria-label="Admin navigation" className="grid gap-6">
            <div>
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Admin</p>
              <div className="mt-2 grid gap-1">
                {adminLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                        active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Public Site</p>
              <div className="mt-2 grid gap-1">
                {publicLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="mt-auto rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
            <div className="mb-2 flex items-center gap-2 font-semibold text-white">
              <Settings className="h-4 w-4" aria-hidden="true" />
              Admin Access
            </div>
            Signed in with protected dashboard access.
            <a
              href="/api/admin/logout"
              className="mt-3 flex min-h-10 items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </a>
          </div>
        </div>
      </aside>
      <main className="w-full min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
    </div>
  );
}
