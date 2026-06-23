"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import api from "@share/services/api";

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2l1.2 4.2L17.4 7.4l-4.2 1.2L12 12.8 10.8 8.6 6.6 7.4l4.2-1.2L12 2Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path
        d="M19 11l.8 2.8 2.8.8-2.8.8L19 18l-.8-2.6-2.6-.8 2.6-.8L19 11Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [formMode, setFormMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRegister = formMode === "register";

  const readError = (e: unknown) =>
    (e as { response?: { data?: { error?: string } } })?.response?.data?.error
    || (e as Error)?.message
    || "Something went wrong";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.token, data.user);
      router.push("/");
    } catch (err) {
      setError(readError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const { data } = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      setAuth(data.token, data.user);
      router.push("/");
    } catch (err) {
      setError(readError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-scene relative grid min-h-screen min-h-[100dvh] grid-cols-1 overflow-hidden bg-[var(--bg)] text-[var(--text)] lg:grid-cols-2">
      <div className="relative hidden items-center justify-center p-10 lg:flex">
        <div className="auth-island relative w-full max-w-xl overflow-hidden rounded-[26px] border border-[var(--border)] bg-[var(--bg-card)] p-9 shadow-[var(--shadow-card)]">
          <div className="auth-stars" aria-hidden />

          <div
            className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-[28px] border border-[color-mix(in_srgb,var(--border)_80%,transparent)]"
            style={{ background: "var(--gradient-primary)" }}
            aria-hidden
          >
            <div className="text-[42px] text-white">
              <SparklesIcon />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-white/15" />
          </div>

          <div className="relative mt-8">
            <h2 className="font-display text-center text-2xl font-extrabold tracking-tight text-[var(--text)]">
              Focused, premium reading
            </h2>
            <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-[var(--text-soft)]">
              Glass UI. Cinematic dark mode. Instant word lookup while you read.
            </p>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="relative z-[1] w-full max-w-[460px]">
          <div className="surface-panel animate-fade-rise relative overflow-hidden p-[1px]">
            <div className="relative rounded-[1.35rem] bg-[var(--bg-card)] px-7 py-9 sm:px-10 sm:py-11">
              <form onSubmit={isRegister ? handleRegister : handleLogin} className="mt-8 sm:mt-4">
                <div className="text-center">
                  <div className="sidebar-brand-tile mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] text-xl">
                    <span className="text-[18px] text-[var(--primary)]">
                      <SparklesIcon />
                    </span>
                  </div>
                  <h1 className="font-display text-[1.85rem] font-extrabold tracking-tight md:text-[2.05rem]">
                    <span className="text-gradient-hero">
                      {isRegister ? "Create account" : "Welcome back"}
                    </span>
                  </h1>
                  <p className="mt-3 text-[15px] text-[var(--text-soft)]">
                    {isRegister
                      ? "Create an account to start your learning workspace."
                      : "Sign in to continue learning."}
                  </p>
                </div>

                <div className="mt-6 space-y-2.5">
                  <div className="py-1 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                    sign in with email
                  </div>
                </div>

                {error && (
                  <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
                    {error}
                  </div>
                )}

                <div className="mt-6 space-y-5">
                  {isRegister && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-soft)]">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="input-magic mt-2"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-soft)]">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input-magic mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-soft)]">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="input-magic mt-2"
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="btn-primary-glow mt-10 w-full rounded-[14px] py-4 font-display text-[15px] font-bold disabled:pointer-events-none disabled:opacity-45"
                >
                  {loading
                    ? isRegister
                      ? "Creating…"
                      : "Signing in…"
                    : isRegister
                      ? "Create account"
                      : "Sign in"}
                </button>

                <p className="mt-8 text-center text-sm text-[var(--text-soft)]">
                  {isRegister ? "Already have an account? " : "New here? "}
                  <button
                    type="button"
                    className="font-bold text-[var(--primary)] underline decoration-[color-mix(in_srgb,var(--primary)_40%,transparent)] underline-offset-2 transition hover:opacity-90"
                    onClick={() => {
                      setFormMode(isRegister ? "login" : "register");
                      setError("");
                    }}
                  >
                    {isRegister ? "Sign in" : "Register"}
                  </button>
                </p>
              </form>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-[var(--text-soft)]">
            English Studio · Learn at your pace
          </p>
        </div>
      </div>
    </div>
  );
}
