import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import api from "./services/api";
import LoginPage from "./pages/LoginPage";
import ThemeSwitcher from "./components/ThemeSwitcher";
import { readStoredTheme, writeStoredTheme } from "./utils/themeStorage";
import {
  IconBook,
  IconHome,
  IconLogout,
  IconNotebook,
  IconSettings,
  IconSparkles,
} from "./components/Icons";

const LearningHub       = lazy(() => import("./pages/LearningHub.jsx"));
const LightNovelLibrary = lazy(() => import("./components/LightNovelLibrary.jsx"));
const VocabularyNotebook = lazy(() => import("./pages/VocabularyNotebook.jsx"));
const Leaderboard       = lazy(() => import("./pages/Leaderboard.jsx"));
const EditProfile       = lazy(() => import("./pages/EditProfile.jsx"));
const SentenceReaderWeb = lazy(() => import("./components/SentenceReaderWeb.jsx"));
const AdminLibrary      = lazy(() => import("./pages/AdminLibrary.jsx"));

function RouteFallback() {
  return (
    <div className="flex min-h-[30vh] items-center justify-center py-16 text-sm text-[var(--text-soft)]">
      Đang tải…
    </div>
  );
}

function readProfile() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); }
  catch { return {}; }
}

// ── Top Navbar ────────────────────────────────────────────────────────────────
function TopNav({ profile, onLogout, uiTheme, setUiTheme }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const path      = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef   = useRef(null);

  const displayName = profile?.username?.trim() || profile?.email?.split("@")[0] || "Reader";
  const initial     = displayName.charAt(0).toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { label: "Home",      path: "/",           icon: <IconHome /> },
    { label: "Analyze",   path: "/analyze",    icon: <IconSparkles /> },
    { label: "Read",      path: "/read",       icon: <IconBook /> },
    { label: "Notebook",  path: "/notebook",   icon: <IconNotebook /> },
    { label: "Rank",      path: "/leaderboard",icon: "🏆" },
  ];

  const isActive = (p) => p === "/" ? path === "/" : path.startsWith(p);

  return (
    <header className="top-nav sticky top-0 z-30 w-full">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-2 px-4 md:px-6 lg:px-8">

        {/* Brand */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex shrink-0 items-center gap-2.5 mr-4"
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-[12px] text-[11px] font-extrabold tracking-wider text-white shadow-[var(--shadow-soft)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            LQ
          </div>
          <span className="hidden font-display text-[15px] font-extrabold tracking-tight text-[var(--text)] sm:block">
            Learning Quest
          </span>
        </button>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1" aria-label="Main">
          {navLinks.map((l) => (
            <button
              key={l.path}
              type="button"
              onClick={() => navigate(l.path)}
              className={`top-nav-link ${isActive(l.path) ? "top-nav-link-active" : ""}`}
            >
              {l.label}
            </button>
          ))}
          {profile?.isAdmin && (
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className={`top-nav-link ${isActive("/admin") ? "top-nav-link-active" : ""}`}
            >
              Admin
            </button>
          )}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme switcher — compact on desktop */}
          <div className="hidden md:block">
            <ThemeSwitcher themeId={uiTheme} onChange={setUiTheme} />
          </div>

          {/* Avatar / user menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card)] text-sm font-bold text-[var(--text)] shadow-[var(--shadow-soft)] transition hover:border-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
              aria-label="User menu"
            >
              {initial}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--bg-card)] py-1.5 shadow-[var(--shadow-card)]">
                <div className="border-b border-[var(--border)] px-4 py-3">
                  <p className="font-display text-sm font-bold text-[var(--text)] truncate">{displayName}</p>
                  <p className="text-xs text-[var(--text-soft)] truncate">{profile?.email || ""}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { navigate("/profile"); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]"
                >
                  <span className="text-[16px]"><IconSettings /></span> Edit profile
                </button>
                <div className="px-3 py-2 md:hidden">
                  <ThemeSwitcher themeId={uiTheme} onChange={setUiTheme} />
                </div>
                <div className="border-t border-[var(--border)] mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => { onLogout(); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-[color-mix(in_srgb,#ef4444_6%,transparent)]"
                  >
                    <span className="text-[16px]"><IconLogout /></span> Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ── AppShell ──────────────────────────────────────────────────────────────────
function AppShell({ onLogout, profile, setProfile, uiTheme, setUiTheme }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const path      = location.pathname;

  const [sentence, setSentence]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [lnChapter, setLnChapter] = useState(null);
  const [lnZenMode, setLnZenMode] = useState(false);
  const [apiError, setApiError]   = useState("");

  useEffect(() => {
    if (!path.startsWith("/read")) { setLnZenMode(false); setLnChapter(null); }
  }, [path]);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      localStorage.setItem("user", JSON.stringify(data));
      setProfile(data);
    } catch { /* offline */ }
  }, [setProfile]);

  useEffect(() => { queueMicrotask(() => void refreshProfile()); }, [refreshProfile]);

  useEffect(() => {
    const refreshPaths = ["/notebook", "/leaderboard", "/profile", "/admin"];
    if (refreshPaths.some((p) => path.startsWith(p))) {
      queueMicrotask(() => void refreshProfile());
    }
  }, [path, refreshProfile]);

  const readApiMessage = (e) =>
    e?.response?.data?.error || e?.response?.data?.message || e?.message || "Request failed";

  const analyzeSentence = async () => {
    if (!sentence.trim()) return;
    setApiError("");
    try {
      setLoading(true);
      const { data } = await api.post("/sentences/analyze", { sentence });
      setResult(data);
      await refreshProfile();
    } catch (e) { setApiError(readApiMessage(e)); }
    finally { setLoading(false); }
  };

  const storyReading   = path.startsWith("/read") && Boolean(lnChapter);
  const hideMobileDock = storyReading || lnZenMode;
  const isRead         = path.startsWith("/read");

  const dockBtn = (active) =>
    `flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 text-[10px] font-bold transition ${
      active
        ? "bg-[color-mix(in_srgb,var(--primary)_22%,transparent)] text-[var(--text)]"
        : "text-[var(--text-soft)] hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
    }`;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)]">
      <div className="app-atmosphere" aria-hidden>
        <div className="stars-layer" />
        <div className="sparkles" />
      </div>

      {/* Top nav — hidden in zen mode */}
      {!(isRead && lnZenMode) && (
        <TopNav
          profile={profile}
          onLogout={onLogout}
          uiTheme={uiTheme}
          setUiTheme={setUiTheme}
        />
      )}

      {/* Main content */}
      <div
        className={
          storyReading
            ? "flex h-[calc(100dvh-60px)] max-h-[calc(100dvh-60px)] min-h-0 overflow-hidden"
            : isRead
              ? "flex min-h-[calc(100dvh-60px)] flex-col"
              : ""
        }
      >
        <main
          className={
            isRead
              ? "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-0"
              : path === "/"
                ? "relative w-full overflow-hidden"
                : "relative mx-auto w-full max-w-6xl px-4 py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-6 md:py-8 md:pb-10 lg:px-8"
          }
          style={path === "/" ? { height: "calc(100dvh - 60px)" } : undefined}
        >
          {apiError && (
            <div
              className="mb-6 rounded-2xl border border-red-400/30 bg-[color-mix(in_srgb,#ef4444_12%,var(--bg-card))] px-5 py-4 text-sm text-red-800 dark:text-red-100"
              role="alert"
            >
              {apiError}
            </div>
          )}

          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Home */}
              <Route path="/" element={<LearningHub profile={profile} />} />

              {/* Sentence Analyzer */}
              <Route
                path="/analyze"
                element={
                  <div className="surface-panel animate-fade-rise relative overflow-hidden p-6 md:p-9">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">Sentence study</p>
                    <h1 className="font-display mt-2 text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-tight tracking-tight text-[var(--text)]">
                      Sentence Analyzer
                    </h1>
                    <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--text-soft)]">
                      Analyze a sentence for contextual meaning, IPA, and quick vocabulary saving.
                    </p>
                    <div className="relative mt-8 flex flex-col gap-4 md:flex-row md:items-end">
                      <textarea
                        value={sentence}
                        onChange={(e) => setSentence(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); analyzeSentence(); } }}
                        placeholder="Paste a sentence to study…"
                        className="textarea-analyzer w-full md:flex-1"
                      />
                      <button type="button" onClick={analyzeSentence} className="btn-primary-glow shrink-0 rounded-2xl px-8 py-3.5 font-display text-sm font-bold md:mb-1">
                        {loading ? "Analyzing…" : "Analyze"}
                      </button>
                    </div>
                    {result && (
                      <div className="relative mt-10 overflow-visible">
                        <Suspense fallback={<RouteFallback />}>
                          <SentenceReaderWeb data={result} />
                        </Suspense>
                      </div>
                    )}
                  </div>
                }
              />

              {/* Read */}
              <Route
                path="/read"
                element={
                  <LightNovelLibrary
                    chapter={lnChapter}
                    onSelectChapter={setLnChapter}
                    zenMode={lnZenMode}
                    onZenModeChange={setLnZenMode}
                    nightMode={uiTheme === "night"}
                  />
                }
              />

              {/* Notebook */}
              <Route path="/notebook" element={<div className="surface-panel animate-fade-rise p-6 md:p-10"><VocabularyNotebook /></div>} />

              {/* Leaderboard */}
              <Route path="/leaderboard" element={<Leaderboard />} />

              {/* Profile */}
              <Route path="/profile" element={<EditProfile onProfileUpdated={(u) => setProfile(u)} />} />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  profile?.isAdmin
                    ? <div className="surface-panel animate-fade-rise p-6 md:p-10"><AdminLibrary /></div>
                    : <Navigate to="/" replace />
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Mobile bottom dock */}
      {!hideMobileDock && (
        <nav
          className="mobile-nav-dock fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--border)] bg-[var(--bg-card)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
          aria-label="Mobile"
        >
          {[
            { path: "/",           label: "Home",    icon: <IconHome /> },
            { path: "/analyze",    label: "Analyze", icon: <IconSparkles /> },
            { path: "/read",       label: "Read",    icon: <IconBook /> },
            { path: "/notebook",   label: "Words",   icon: <IconNotebook /> },
            { path: "/leaderboard",label: "Rank",    icon: "🏆" },
          ].map((l) => (
            <button
              key={l.path}
              type="button"
              className={dockBtn(l.path === "/" ? path === "/" : path.startsWith(l.path))}
              onClick={() => navigate(l.path)}
            >
              <span className="text-lg">{l.icon}</span>
              {l.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
function App() {
  const [uiTheme, setUiTheme] = useState(readStoredTheme);
  const [authed, setAuthed]   = useState(() => !!localStorage.getItem("token"));
  const [profile, setProfile] = useState(readProfile);

  useEffect(() => {
    const dark = !authed || uiTheme === "night";
    document.documentElement.classList.toggle("dark", dark);
    if (authed) writeStoredTheme(uiTheme);
  }, [uiTheme, authed]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthed(false);
    setProfile({});
  };

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />;

  return (
    <BrowserRouter>
      <AppShell
        onLogout={logout}
        profile={profile}
        setProfile={setProfile}
        uiTheme={uiTheme}
        setUiTheme={setUiTheme}
      />
    </BrowserRouter>
  );
}

export default App;
