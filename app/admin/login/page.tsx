"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("kkausik11@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!response.ok) {
      const json = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(json?.message ?? "Unable to sign in.");
      return;
    }

    const nextPath = new URLSearchParams(window.location.search).get("next");
    router.replace(nextPath || "/admin");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10 text-white">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl border border-white/10 bg-white p-6 text-slate-950 shadow-2xl">
        <div className="mb-6">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-950 text-white">
            <LockKeyhole className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Admin Login</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to manage PujaWay listings, gallery images, and 360 panoramas.</p>
        </div>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Gmail ID
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
          />
        </label>

        <label className="mt-4 grid gap-2 text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
          />
        </label>

        {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
