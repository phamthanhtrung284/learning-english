"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)", color: "var(--text-soft)" }}>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b px-6 py-3" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="text-lg font-bold" style={{ color: "var(--primary)" }}>Admin Panel</span>
          <div className="flex gap-4 text-sm font-semibold" style={{ color: "var(--text-soft)" }}>
            <Link href="/admin" className="hover:text-[var(--text)] transition">Dashboard</Link>
            <Link href="/admin/users" className="hover:text-[var(--text)] transition">Users</Link>
            <Link href="/admin/library" className="hover:text-[var(--text)] transition">Library</Link>
            <Link href="/admin/courses" className="hover:text-[var(--text)] transition">Courses</Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
