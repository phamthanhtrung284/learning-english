import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";

export default function EditProfile({ onProfileUpdated }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (cancelled) return;
        setUsername(data.username || "");
        setEmail(data.email || "");
      } catch {
        if (!cancelled) setError("Could not load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
      if (!currentPassword) {
        setError("Enter your current password to set a new one.");
        return;
      }
    }
    try {
      setSaving(true);
      const payload = { username, email };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const { data } = await api.patch("/auth/profile", payload);
      const u = data.user;
      localStorage.setItem("user", JSON.stringify(u));
      onProfileUpdated?.(u);
      setMessage("Profile updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="surface-panel p-14 text-center text-[var(--text-soft)]">
        <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-[color-mix(in_srgb,var(--primary)_22%,transparent)]" />
        Loading profile…
      </div>
    );
  }

  return (
    <div className="surface-panel animate-fade-rise relative overflow-hidden p-6 md:p-10">
      <p className="font-mascot relative text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">Profile</p>
      <h1 className="font-display relative mt-3 text-3xl font-extrabold tracking-tight text-[var(--text)] md:text-[2.25rem]">
        Edit profile
      </h1>
      <p className="relative mt-3 max-w-md text-[15px] leading-relaxed text-[var(--text-soft)]">
        Update your public information and account details.
      </p>

      {message && (
        <div className="relative mt-6 rounded-[18px] border border-[color-mix(in_srgb,var(--green)_45%,transparent)] bg-[color-mix(in_srgb,var(--green)_12%,var(--bg-card))] px-4 py-3 text-sm font-semibold text-[var(--text)]">
          {message}
        </div>
      )}
      {error && (
        <div className="relative mt-6 rounded-[18px] border border-red-400/35 bg-[color-mix(in_srgb,#ef4444_12%,var(--bg-card))] px-4 py-3 text-sm text-red-800 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="relative mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-soft)]">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
              className="input-magic mt-2"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-soft)]">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-magic mt-2" />
          </div>

          <div className="border-t border-[var(--border)] pt-8">
            <p className="font-display font-bold text-[var(--text)]">Change password</p>
            <p className="mt-1 text-sm text-[var(--text-soft)]">Leave blank to keep your current password.</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-soft)]">Current password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="input-magic mt-2"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-soft)]">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  autoComplete="new-password"
                  className="input-magic mt-2"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-soft)]">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="input-magic mt-2"
                />
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={saving}
            className="btn-primary-glow mt-4 w-full rounded-[14px] py-3.5 font-display text-sm font-bold disabled:opacity-45"
            whileHover={{ scale: saving ? 1 : 1.01 }}
            whileTap={{ scale: saving ? 1 : 0.99 }}
          >
            {saving ? "Saving…" : "Save changes"}
          </motion.button>
        </form>

        <aside className="surface-panel h-fit p-5">
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-[var(--primary)] ring-1 ring-[var(--border)]"
              style={{ background: "var(--surface-elevated)" }}
              whileHover={{ scale: 1.02 }}
            >
              {username.charAt(0).toUpperCase() || "?"}
            </motion.div>
            <div className="min-w-0">
              <p className="truncate font-display text-base font-bold text-[var(--text)]">{username || "Username"}</p>
              <p className="truncate text-sm text-[var(--text-soft)]">{email || "Email"}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[var(--text-soft)]">
            Quiet progress, steady learning. Keep your profile simple and clear.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2">
              <span className="text-[var(--text-soft)]">Level</span>
              <span className="font-semibold text-[var(--text)]">Learner</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2">
              <span className="text-[var(--text-soft)]">Weekly goal</span>
              <span className="font-semibold text-[var(--text)]">5 sessions</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
