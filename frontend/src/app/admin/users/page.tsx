"use client";

import { useEffect, useState } from "react";
import api from "@share/services/api";

interface User {
  id: string;
  username: string;
  email: string;
  level: string;
  isAdmin: boolean;
  isPremium: boolean;
  dailyUsage: { used: number; limit: number | null; remaining: number | null };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");

  const LIMIT = 20;

  const fetchUsers = () => {
    setLoading(true);
    setError("");
    api
      .get("/auth/admin/users", { params: { page, limit: LIMIT, search } })
      .then(({ data }) => {
        setUsers(data.users || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput);
  };

  const deleteUser = async (userId: string, username: string) => {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    setUpdating(userId + "delete");
    try {
      await api.delete(`/auth/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotal((t) => t - 1);
    } catch {
      setError("Failed to delete user");
    } finally {
      setUpdating(null);
    }
  };

  const resetUsage = async (userId: string) => {
    setUpdating(userId + "reset");
    try {
      await api.post(`/auth/admin/users/${userId}/reset-usage`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, dailyUsage: { ...u.dailyUsage, used: 0 } } : u
        )
      );
    } catch {
      setError("Failed to reset usage");
    } finally {
      setUpdating(null);
    }
  };

  const toggleField = async (userId: string, field: "isPremium" | "isAdmin", current: boolean) => {
    // Optimistic update immediately
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, [field]: !current } : u))
    );
    setUpdating(userId + field);
    try {
      await api.patch(`/auth/admin/users/${userId}`, { [field]: !current });
    } catch {
      // Revert on failure
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, [field]: current } : u))
      );
      setError("Failed to update user");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--text)" }}>Users</h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-soft)" }}>{total} total</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name or email…"
            className="input-magic h-9 w-64 text-sm"
          />
          <button type="submit" className="btn-primary-glow h-9 rounded-xl px-4 text-sm font-bold">
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-400/30 bg-red-400/8 px-4 py-2.5 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>User</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>Level</th>
              <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>Usage today</th>
              <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>Premium</th>
              <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>Admin</th>
              <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-soft)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm" style={{ color: "var(--text-soft)" }}>
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm" style={{ color: "var(--text-soft)" }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    background: i % 2 === 0 ? "var(--bg)" : "var(--bg-card)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold" style={{ color: "var(--text)" }}>{u.username}</p>
                    <p className="text-xs" style={{ color: "var(--text-soft)" }}>{u.email}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text)" }}>{u.level}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-soft)" }}>
                    {u.dailyUsage.used} / {u.dailyUsage.limit ?? "∞"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      disabled={updating === u.id + "isPremium"}
                      onClick={() => toggleField(u.id, "isPremium", u.isPremium)}
                      className={`inline-flex h-6 w-11 items-center rounded-full border transition-all ${
                        u.isPremium
                          ? "border-yellow-500/40 bg-yellow-500/20"
                          : "border-[var(--border)] bg-[var(--bg-soft)]"
                      } disabled:opacity-40`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full transition-transform ${
                          u.isPremium ? "translate-x-5 bg-yellow-400" : "translate-x-1 bg-[var(--text-soft)]"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      disabled={updating === u.id + "isAdmin"}
                      onClick={() => toggleField(u.id, "isAdmin", u.isAdmin)}
                      className={`inline-flex h-6 w-11 items-center rounded-full border transition-all ${
                        u.isAdmin
                          ? "border-[color-mix(in_srgb,var(--primary)_40%,transparent)] bg-[color-mix(in_srgb,var(--primary)_15%,transparent)]"
                          : "border-[var(--border)] bg-[var(--bg-soft)]"
                      } disabled:opacity-40`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full transition-transform ${
                          u.isAdmin ? "translate-x-5 bg-[var(--primary)]" : "translate-x-1 bg-[var(--text-soft)]"
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--text-soft)" }}>
            Page {page + 1} of {pages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 rounded-xl border px-3 text-xs font-semibold disabled:opacity-30"
              style={{ borderColor: "var(--border)", color: "var(--text-soft)" }}
            >
              ← Prev
            </button>
            <button
              type="button"
              disabled={page >= pages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 rounded-xl border px-3 text-xs font-semibold disabled:opacity-30"
              style={{ borderColor: "var(--border)", color: "var(--text-soft)" }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
