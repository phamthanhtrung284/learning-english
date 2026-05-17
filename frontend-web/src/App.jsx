import { lazy, Suspense, useCallback, useEffect, useState } from "react";
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

const LearningHub = lazy(() => import("./pages/LearningHub.jsx"));
const LightNovelLibrary = lazy(() => import("./components/LightNovelLibrary.jsx"));
const VocabularyNotebook = lazy(() => import("./pages/VocabularyNotebook.jsx"));
const Leaderboard = lazy(() => import("./pages/Leaderboard.jsx"));
const EditProfile = lazy(() => import("./pages/EditProfile.jsx"));
const SentenceReaderWeb = lazy(() => import("./components/SentenceReaderWeb.jsx"));

function RouteFallback() {
  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center py-16 text-sm text-[var(--text-soft)]">
      Đang tải…
    </div>
  );
}

function readProfile() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function App() {
  const [uiTheme, setUiTheme] = useState(readStoredTheme);
  const [authed, setAuthed] = useState(
    () => !!localStorage.getItem("token")
  );

  useEffect(() => {
    const shouldUseDark = !authed || uiTheme === "night";
    document.documentElement.classList.toggle("dark", shouldUseDark);
    if (authed) writeStoredTheme(uiTheme);
  }, [uiTheme, authed]);

  const [profile, setProfile] = useState(readProfile);
  const [mode, setMode] = useState("hub");
  const [sentence, setSentence] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [lnChapter, setLnChapter] = useState(null);
  const [lnZenMode, setLnZenMode] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (mode !== "story") queueMicrotask(() => setLnZenMode(false));
  }, [mode]);

  useEffect(() => {
    if (authed) queueMicrotask(() => setProfile(readProfile()));
  }, [authed]);

  const refreshProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      localStorage.setItem("user", JSON.stringify(data));
      setProfile(data);
    } catch {
      /* token invalid or offline */
    }
  }, []);

  useEffect(() => {
    if (authed) queueMicrotask(() => void refreshProfile());
  }, [authed, refreshProfile]);

  useEffect(() => {
    if (!authed) return;
    if (mode === "notebook" || mode === "leaderboard" || mode === "profile") {
      queueMicrotask(() => void refreshProfile());
    }
  }, [authed, mode, refreshProfile]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthed(false);
    setProfile({});
    setResult(null);
    setLnChapter(null);
    setApiError("");
  };

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />;
  }

  const displayName =
    profile?.username?.trim() ||
    profile?.email?.split("@")[0] ||
    "Reader";

  const readApiMessage = (error) =>
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Request failed";

  const analyzeSentence = async () => {
    if (!sentence.trim()) return;
    setApiError("");
    try {
      setLoading(true);
      const response = await api.post("/sentences/analyze", {
        sentence,
      });
      setResult(response.data);
      await refreshProfile();
    } catch (error) {
      setApiError(readApiMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const initial = displayName.charAt(0).toUpperCase();
  const navBtn = (active) => (active ? "nav-pill-active" : "nav-pill");

  const hideMobileDock =
    (mode === "story" && lnChapter) || (mode === "story" && lnZenMode);

  /** Cố định chiều cao viewport khi đọc LN — nếu không, flex kéo giãn theo cả chương và vùng overflow-y-auto không còn tác dụng. */
  const storyReading = mode === "story" && Boolean(lnChapter);

  const goHub = () => {
    setMode("hub");
    setLnChapter(null);
  };

  const dockBtn = (active) =>
    `flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-2 text-[10px] font-bold transition ${
      active
        ? "bg-[color-mix(in_srgb,var(--primary)_22%,transparent)] text-[var(--text)] shadow-[var(--shadow-soft)]"
        : "text-[var(--text-soft)] hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
    }`;

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[var(--bg)] text-[var(--text)]">
      <div className="app-atmosphere" aria-hidden>
        <div className="stars-layer" />
        <div className="sparkles" />
      </div>
      <div
        className={
          storyReading
            ? "flex h-[100dvh] max-h-[100dvh] min-h-0 overflow-hidden pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-3"
            : "flex min-h-screen min-h-[100dvh] overflow-visible md:pb-3"
        }
      >
        {!(mode === "story" && lnZenMode) ? (
          <aside className="glass-sidebar sticky top-0 z-20 hidden min-h-0 w-[min(100%,272px)] shrink-0 flex-col p-4 md:flex md:p-5">
            <div className="flex items-center gap-3">
              <div
                className="sidebar-brand-tile relative flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-[18px] text-[13px] font-extrabold tracking-[0.18em] text-white"
                style={{ background: "var(--gradient-primary)" }}
              >
                <span className="relative z-[1]">LQ</span>
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">
                  Learning Quest
                </div>
                <div className="font-display text-base font-extrabold tracking-tight text-[var(--text)]">
                  Learning Quest
                </div>
              </div>
            </div>

            <div className="surface-panel relative mt-5 overflow-hidden p-4">
              <div className="relative flex items-start gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-[var(--primary)] ring-2 ring-[var(--border)]"
                  style={{ background: "color-mix(in srgb, var(--primary) 12%, var(--bg-card))" }}
                >
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-sm font-bold text-[var(--text)]">
                    {displayName}
                  </div>
                  <p className="mt-1 text-xs leading-snug text-[var(--text-soft)]">
                    Pick one activity from the menu.
                  </p>
                </div>
              </div>
            </div>

            <nav className="mt-5 flex flex-col gap-1.5" aria-label="Main">
              <button
                type="button"
                onClick={goHub}
                className={`${navBtn(mode === "hub")} w-full`}
              >
                <span className="nav-icon-tile text-[17px]">
                  <IconHome />
                </span>
                Home
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("sentence");
                  setLnChapter(null);
                }}
                className={`${navBtn(mode === "sentence")} w-full`}
              >
                <span className="nav-icon-tile text-[17px]">
                  <IconSparkles />
                </span>
                Sentence Analyzer
              </button>
              <button
                type="button"
                onClick={() => setMode("story")}
                className={`${navBtn(mode === "story")} w-full`}
              >
                <span className="nav-icon-tile text-[17px]">
                  <IconBook />
                </span>
                Read
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("notebook");
                  setLnChapter(null);
                }}
                className={`${navBtn(mode === "notebook")} w-full`}
              >
                <span className="nav-icon-tile text-[17px]">
                  <IconNotebook />
                </span>
                Vocabulary Notebook
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("profile");
                  setLnChapter(null);
                }}
                className={`${navBtn(mode === "profile")} w-full`}
              >
                <span className="nav-icon-tile text-[17px]">
                  <IconSettings />
                </span>
                Edit profile
              </button>
            </nav>

            <div className="mt-auto space-y-3 pt-8">
              <ThemeSwitcher themeId={uiTheme} onChange={setUiTheme} />
              <button type="button" onClick={logout} className="btn-logout-magic">
                <span className="mr-2 inline-block align-[-0.15em] text-[18px]" aria-hidden>
                  <IconLogout />
                </span>
                Đăng xuất
              </button>
            </div>
          </aside>
        ) : null}

        <main
          className={
            mode === "story"
              ? "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--bg)] p-0 text-[var(--text)]"
              : "relative flex-1 overflow-visible px-4 py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-8 md:py-8 md:pb-8 lg:px-10"
          }
        >
          <div
            className={
              mode === "story"
                ? `flex min-h-0 flex-1 flex-col${storyReading ? " overflow-hidden" : ""}`
                : "mx-auto max-w-5xl"
            }
          >
            {apiError && (
              <div
                className={
                  mode === "story"
                    ? "mb-4 rounded-2xl border border-red-400/35 bg-red-950/50 px-4 py-3 text-sm text-red-100 backdrop-blur-md"
                    : "mb-6 rounded-2xl border border-red-400/30 bg-[color-mix(in_srgb,#ef4444_12%,var(--bg-card))] px-5 py-4 text-sm text-red-800 dark:text-red-100"
                }
                role="alert"
              >
                {apiError}
              </div>
            )}

            <Suspense key={mode + (lnChapter ? "-ch" : "")} fallback={<RouteFallback />}>
                {mode === "hub" && (
                  <LearningHub
                    profile={profile}
                    onNavigate={(next) => {
                      setMode(next);
                      if (next !== "story") setLnChapter(null);
                    }}
                  />
                )}

                {mode === "sentence" && (
                  <div className="surface-panel animate-fade-rise relative overflow-hidden p-6 md:p-9">
                    <div className="relative flex flex-col items-center text-center md:flex-row md:items-start md:text-left">
                      <div
                        className="mb-6 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-[36px] md:mb-0 md:mr-6"
                        style={{
                          background: "var(--gradient-primary)",
                          boxShadow: "var(--shadow-card)",
                        }}
                        aria-hidden
                      >
                        <IconSparkles />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--primary)]">
                          Workspace
                        </p>
                        <h1 className="font-display mt-2 text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold leading-tight tracking-tight text-[var(--text)]">
                          Sentence Analyzer
                        </h1>
                        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--text-soft)] md:mx-0">
                          Paste an English sentence and get a clean word-by-word breakdown.
                        </p>
                      </div>
                    </div>

                    <div className="relative mt-8 flex flex-col gap-4 md:flex-row md:items-end">
                      <textarea
                        value={sentence}
                        onChange={(e) => setSentence(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            analyzeSentence();
                          }
                        }}
                        placeholder="Type an English sentence..."
                        className="textarea-analyzer w-full md:flex-1"
                      />
                      <button
                        type="button"
                        onClick={analyzeSentence}
                        className="btn-primary-glow shrink-0 rounded-2xl px-8 py-3.5 font-display text-sm font-bold md:mb-1"
                      >
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
                )}

                {mode === "story" && (
                  <LightNovelLibrary
                    chapter={lnChapter}
                    onSelectChapter={setLnChapter}
                    zenMode={lnZenMode}
                    onZenModeChange={setLnZenMode}
                    nightMode={uiTheme === "night"}
                  />
                )}

                {mode === "profile" && (
                  <EditProfile
                    onProfileUpdated={(u) => {
                      setProfile(u);
                    }}
                  />
                )}

                {mode === "leaderboard" && <Leaderboard />}

                {mode === "notebook" && (
                  <div className="surface-panel animate-fade-rise p-6 md:p-10">
                    <VocabularyNotebook />
                  </div>
                )}
            </Suspense>
          </div>
        </main>
      </div>

      {!hideMobileDock && (
        <nav
          className="mobile-nav-dock fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-card)_86%,transparent)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-[18px] md:hidden"
          aria-label="Mobile"
        >
          <button type="button" className={dockBtn(mode === "hub")} onClick={goHub}>
            <span className="text-lg">
              <IconHome />
            </span>
            Home
          </button>
          <button
            type="button"
            className={dockBtn(mode === "sentence")}
            onClick={() => {
              setMode("sentence");
              setLnChapter(null);
            }}
          >
            <span className="text-lg">
              <IconSparkles />
            </span>
            Analyze
          </button>
          <button type="button" className={dockBtn(mode === "story")} onClick={() => setMode("story")}>
            <span className="text-lg">
              <IconBook />
            </span>
            Read
          </button>
          <button
            type="button"
            className={dockBtn(mode === "notebook")}
            onClick={() => {
              setMode("notebook");
              setLnChapter(null);
            }}
          >
            <span className="text-lg">
              <IconNotebook />
            </span>
            Words
          </button>
          <button
            type="button"
            className={dockBtn(mode === "leaderboard")}
            onClick={() => {
              setMode("leaderboard");
              setLnChapter(null);
            }}
          >
            <span className="text-lg">🏆</span>
            Rank
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;
