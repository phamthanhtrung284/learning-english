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

// ── Sword Navbar ──────────────────────────────────────────────────────────────
function TopNav({ profile, onLogout }) {
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
    { label: "Home",     path: "/" },
    { label: "Analyze",  path: "/analyze" },
    { label: "Read",     path: "/read" },
    { label: "Notebook", path: "/notebook" },
  ];

  const isActive = (p) => p === "/" ? path === "/" : path.startsWith(p);

  return (
    <header className="sword-nav sticky top-0 z-30 hidden w-full md:block" style={{ height: 72 }}>
      <div className="relative h-full w-full">

        {/* Kiếm: giữ nguyên tỉ lệ, căn giữa màn hình */}
        <img
          src="/sword.png"
          alt=""
          draggable={false}
          className="pointer-events-none absolute top-0 select-none"
          style={{ height: "100%", width: "auto", left: "50%", transform: "translateX(-50%)" }}
          aria-hidden
        />

        {/* Nav links đè lên blade đen — căn theo vị trí blade trong ảnh đã center
            Blade center ≈ 190px từ trái ảnh → offset từ center màn = -190px + 80px = -110px
            Dùng left: calc(50% - 110px) để pin vào blade */}
        <nav
          className="absolute hidden md:flex items-center gap-1"
          style={{ left: "calc(50% - 247px)", top: "50%", transform: "translateY(-50%)" }}
          aria-label="Main"
        >
          {navLinks.map((l) => (
            <button key={l.path} type="button" onClick={() => navigate(l.path)}
              className="sword-nav-link" data-active={isActive(l.path) ? "true" : undefined}>
              {l.label}
              {isActive(l.path) && <span className="sword-nav-underline" />}
            </button>
          ))}
          {profile?.isAdmin && (
            <button type="button" onClick={() => navigate("/admin")}
              className="sword-nav-admin" data-active={isActive("/admin") ? "true" : undefined}>
              Admin
            </button>
          )}
        </nav>

        {/* Theme + Avatar sát phải */}
        <div className="absolute right-0 top-0 flex h-full items-center gap-3 px-5" ref={menuRef}>
          <button type="button" onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#2a2a2e] text-sm font-bold text-[#ede9e0] transition hover:border-white/40"
            aria-label="User menu">
            {initial}
          </button>
          {menuOpen && (
            <div className="absolute right-4 top-full mt-2 z-50 w-52 overflow-hidden rounded-[16px] border border-white/10 bg-[#1a1a1e] py-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.7)]">
              <div className="border-b border-white/8 px-4 py-3">
                <p className="text-sm font-bold text-[#ede9e0] truncate">{displayName}</p>
                <p className="text-xs text-[#6b6860] truncate">{profile?.email || ""}</p>
              </div>
              <button type="button" onClick={() => { navigate("/profile"); setMenuOpen(false); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#ede9e0] hover:bg-white/5">
                <span className="text-[16px]"><IconSettings /></span> Edit profile
              </button>
              <div className="border-t border-white/8 mt-1 pt-1">
                <button type="button" onClick={() => { onLogout(); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#c0392b] hover:bg-[#c0392b]/8">
                  <span className="text-[16px]"><IconLogout /></span> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ── AppShell ──────────────────────────────────────────────────────────────────
function AppShell({ onLogout, profile, setProfile }) {
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
    const refreshPaths = ["/notebook", "/profile", "/admin"];
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
  const hideMobileDock = lnZenMode; // chỉ ẩn dock khi zen, không ẩn khi đọc thường
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
        />
      )}

      {/* Main content */}
      <div
        className={
          lnZenMode
            ? "flex h-[100dvh] max-h-[100dvh] min-h-0 overflow-hidden"
            : storyReading
              ? "flex min-h-0 overflow-hidden" 
              : isRead
                ? "flex min-h-[calc(100dvh-clamp(60px,14.47vw,100px))] flex-col"
                : ""
        }
        style={storyReading && !lnZenMode ? {
          height: "calc(100dvh - clamp(60px, 14.47vw, 100px))",
          maxHeight: "calc(100dvh - clamp(60px, 14.47vw, 100px))",
        } : undefined}
      >
        <main
          className={
            isRead
              ? "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-0"
              : path === "/"
                ? "relative w-full overflow-hidden"
                : "relative mx-auto w-full max-w-6xl px-4 py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-6 md:py-8 md:pb-10 lg:px-8"
          }
          style={path === "/" ? { height: "calc(100dvh - clamp(60px, 14.47vw, 100px))" } : undefined}
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
                    nightMode={false}
                  />
                }
              />

              {/* Notebook */}
              <Route path="/notebook" element={<div className="surface-panel animate-fade-rise p-6 md:p-10"><VocabularyNotebook /></div>} />

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
  const [authed, setAuthed]   = useState(() => !!localStorage.getItem("token"));
  const [profile, setProfile] = useState(readProfile);

  useEffect(() => {
    // Luôn dùng light theme — xóa class dark nếu còn sót
    document.documentElement.classList.remove("dark");
  }, []);

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
      />
    </BrowserRouter>
  );
}

export default App;
