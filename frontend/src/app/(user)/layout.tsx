"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const READ_ROUTES = ["/read"];
const FULL_ROUTES = ["/read", "/"];

function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, refreshProfile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = user?.username?.trim() || user?.email?.split("@")[0] || "Reader";
  const initial = displayName.charAt(0).toUpperCase();
  const avatarSrc = user?.avatar
    ? `${process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:4000"}${user.avatar}`
    : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Analyze", path: "/analyze" },
    { label: "Translate", path: "/translate" },
    { label: "Read", path: "/read" },
  ];

  return (
    <header className="sword-nav sticky top-0 z-30 hidden w-full md:block" style={{ height: 72 }}>
      <div className="relative h-full w-full">
        <Image
          src="/sword.png"
          alt=""
          draggable={false}
          className="pointer-events-none absolute top-0 select-none"
          style={{ height: "100%", width: "auto", left: "50%", transform: "translateX(-50%)" }}
          aria-hidden
          width={250}
          height={72}
          loading="eager"
          priority
        />
        <nav
          className="absolute hidden md:flex items-center gap-1"
          style={{ left: "calc(50% - 247px)", top: "50%", transform: "translateY(-50%)" }}
          aria-label="Main"
        >
          {navLinks.map((l) => (
            <button
              key={l.path}
              type="button"
              onClick={() => router.push(l.path)}
              className="sword-nav-link"
              data-active={isActive(l.path) ? "true" : undefined}
            >
              {l.label}
              {isActive(l.path) && <span className="sword-nav-underline" />}
            </button>
          ))}
          {user?.isAdmin && (
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="sword-nav-admin"
              data-active={isActive("/admin") ? "true" : undefined}
            >
              Admin
            </button>
          )}
        </nav>

        <div className="absolute right-0 top-0 flex h-full items-center gap-3 px-5" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[#2a2a2e] text-sm font-bold text-[#ede9e0] transition hover:border-white/40"
            aria-label="User menu"
          >
            {avatarSrc ? (
              <Image src={avatarSrc} alt="" className="h-full w-full object-cover" width={36} height={36} />
            ) : (
              initial
            )}
          </button>
          {menuOpen && (
            <div className="absolute right-4 top-full mt-2 z-50 w-52 overflow-hidden rounded-[16px] border border-white/10 bg-[#1a1a1e] py-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.7)]">
              <div className="border-b border-white/8 px-4 py-3">
                <p className="text-sm font-bold text-[#ede9e0] truncate">{displayName}</p>
                <p className="text-xs text-[#6b6860] truncate">{user?.email || ""}</p>
              </div>
              <button
                type="button"
                onClick={() => { router.push("/profile"); setMenuOpen(false); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#ede9e0] hover:bg-white/5"
              >
                Edit profile
              </button>
              <button
                type="button"
                onClick={() => { router.push("/notebook"); setMenuOpen(false); }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#ede9e0] hover:bg-white/5"
              >
                Vocabulary
              </button>
              <div className="border-t border-white/8 mt-1 pt-1">
                <button
                  type="button"
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#c0392b] hover:bg-[#c0392b]/8"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isReadRoute = mounted && READ_ROUTES.some((r) => pathname.startsWith(r));
  const isFullRoute = mounted && FULL_ROUTES.some((r) => pathname === r || (r !== "/" && pathname.startsWith(r)));

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg)", color: "var(--text-soft)" }}>
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="relative overflow-x-hidden"
      style={{
        background: "var(--bg)",
        color: "var(--text)",
        height: isFullRoute ? "100dvh" : undefined,
        minHeight: isFullRoute ? undefined : "100dvh",
        display: isFullRoute ? "flex" : undefined,
        flexDirection: isFullRoute ? "column" : undefined,
      }}
    >
      <div className="app-atmosphere" aria-hidden>
        <div className="stars-layer" />
      </div>
      <TopNav />
      <main
        className={
          isReadRoute
            ? "relative flex-1 min-h-0 overflow-hidden"
            : isFullRoute
            ? "relative flex-1 min-h-0 overflow-hidden"
            : "relative mx-auto w-full max-w-6xl px-4 py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-6 md:py-8 md:pb-10 lg:px-8"
        }
      >
        {children}
      </main>
    </div>
  );
}
