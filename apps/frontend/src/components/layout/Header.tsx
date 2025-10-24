import React from "react";
import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const nav = [
  { label: "Dashboard", href: "/" },
  { label: "Providers", href: "/providers" },
  { label: "Appointments", href: "/appointments" },
  { label: "AI Assistant", href: "/chat" },
];

const cx = (...v: (string | false | undefined)[]) => v.filter(Boolean).join(" ");

export default function AppHeader() {
  const { user, logout } = useAuth();
  const typedUser = user as User | null;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setMenuOpen(false), setMobileOpen(false));
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("click", onClick); };
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/95 border-b border-slate-200">
      <div className="container">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <Logo className="h-6 w-6" />
            <span className="text-base font-semibold tracking-tight text-violet-700 group-hover:text-violet-800">
              Patient Scheduler
            </span>
          </NavLink>

          {/* Desktop nav - only show when authenticated */}
          {typedUser && (
            <nav className="hidden md:flex items-center gap-2">
              {nav.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    cx(
                      "rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70",
                      isActive
                        ? "text-violet-800 bg-violet-100 ring-1 ring-violet-200"
                        : "text-slate-700 hover:text-violet-700 hover:bg-violet-50"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {typedUser ? (
              /* Profile dropdown */
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex items-center rounded-full bg-violet-100 text-violet-800 pl-1 pr-2 py-1.5 shadow-sm hover:bg-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70"
                >
                  <img src="/avatar-female.svg" alt="User Avatar" className="h-8 w-8 rounded-full ring-1 ring-white/70" />
                  <span className="ml-2 hidden sm:inline text-sm font-medium">{typedUser.name || 'Demo User'}</span>
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5"
                  >
                    <NavLink to="/profile" role="menuitem" className="block px-3 py-2 text-sm hover:bg-slate-50">My Profile</NavLink>
                    <NavLink to="/settings" role="menuitem" className="block px-3 py-2 text-sm hover:bg-slate-50">Settings</NavLink>
                    <hr className="my-1 border-slate-200" />
                    <button 
                      onClick={logout}
                      className="block w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Auth buttons when not logged in */
              <div className="flex items-center gap-2">
                <NavLink
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition"
                >
                  Log In
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-3 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition"
                >
                  Sign Up
                </NavLink>
              </div>
            )}

            {/* Mobile trigger */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Open menu"
            >
              {mobileOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="container py-3 space-y-1">
            {typedUser ? (
              /* Authenticated mobile nav */
              <>
                {nav.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === "/"}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cx(
                        "block rounded-lg px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70",
                        isActive ? "bg-violet-100 text-violet-800 ring-1 ring-violet-200" : "text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <div className="mt-2 rounded-xl border border-slate-200 p-3">
                  <p className="text-xs text-slate-500 mb-2">Signed in as</p>
                  <div className="flex items-center gap-3">
                    <img src="/avatar-female.svg" alt="User Avatar" className="h-9 w-9 rounded-full" />
                    <div className="text-sm">
                      <div className="font-medium text-slate-800">{typedUser.name || 'Demo User'}</div>
                      <div className="text-slate-500">{typedUser.email || 'demo@example.com'}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <NavLink className={({ isActive }) => cx("block rounded-lg px-3 py-2 text-sm text-center transition", isActive ? "bg-violet-100 text-violet-800 ring-1 ring-violet-200" : "text-slate-700 hover:bg-violet-50 hover:text-violet-700")} to="/profile" onClick={() => setMobileOpen(false)}>
                      Profile
                    </NavLink>
                    <NavLink className={({ isActive }) => cx("block rounded-lg px-3 py-2 text-sm text-center transition", isActive ? "bg-violet-100 text-violet-800 ring-1 ring-violet-200" : "text-slate-700 hover:bg-violet-50 hover:text-violet-700")} to="/settings" onClick={() => setMobileOpen(false)}>
                      Settings
                    </NavLink>
                    <button 
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 hover:bg-rose-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Unauthenticated mobile nav */
              <div className="mt-2 flex gap-2">
                <NavLink
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Log In
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center rounded-lg bg-violet-600 px-3 py-2 text-sm text-white hover:bg-violet-700"
                >
                  Sign Up
                </NavLink>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

/* Icons & Logo */
function Logo({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id="g" x1="0" x2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path d="M6 3l4 7H6l4 11L3 10h5L3 3z" fill="url(#g)" />
      <path d="M15 2l-2 5h3l-3 6 8-8h-4l2-3z" fill="#facc15" />
    </svg>
  );
}
const ChevronDown = (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/></svg>);
const MenuIcon = (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>);
const CloseIcon = (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18"/></svg>);
