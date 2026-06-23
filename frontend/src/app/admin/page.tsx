"use client";

import { useEffect, useState } from "react";
import api from "@share/services/api";

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    api.get("/auth/admin/users", { params: { page: 0, limit: 1 } })
      .then(({ data }) => setUserCount(data.total ?? 0))
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Users", value: userCount, href: "/admin/users", color: "var(--primary)" },
    { label: "Library", value: null, href: "/admin/library", color: "#8b5cf6" },
    { label: "Courses", value: null, href: "/admin/courses", color: "#6b7280" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold" style={{ color: "var(--text)" }}>Admin Dashboard</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-soft)" }}>Manage users, library, and site content.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {cards.map((c) => (
          <a
            key={c.label}
            href={c.href}
            className="group flex flex-col gap-3 rounded-2xl border p-6 transition-all hover:shadow-lg"
            style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
          >
            <p className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>{c.label}</p>
            <p className="text-4xl font-extrabold" style={{ color: c.color }}>
              {c.value === null ? "—" : c.value}
            </p>
            <p className="text-xs font-semibold transition-opacity group-hover:opacity-100 opacity-60" style={{ color: c.color }}>
              Manage {c.label} →
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
