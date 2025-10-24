import React from "react";
import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/auth";

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
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight" style={{color: '#7c3aed'}}>
              Patient Scheduler
            </span>
          </NavLink>

          {/* Desktop nav - only show when authenticated */}
          {typedUser && (
            <nav className="hidden md:flex items-center gap-1">
              {nav.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    cx(
                      "nav-link",
                      isActive ? "nav-link-active" : "nav-link-inactive"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {typedUser ? (
              /* Profile dropdown */
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex items-center rounded-xl pl-1 pr-3 py-2 transition-all duration-200"
                  style={{
                    backgroundColor: '#f3e8ff',
                    color: '#6b21a8',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e9d5ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3e8ff';
                  }}
                >
                  <img src="/avatar-female.svg" alt="User Avatar" className="h-8 w-8 rounded-full ring-2 ring-white/70" />
                  <span className="ml-3 hidden sm:inline text-sm font-medium">{typedUser.name || 'Demo User'}</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5"
                  >
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">{typedUser.name || 'Demo User'}</p>
                      <p className="text-sm text-slate-500">{typedUser.email || 'demo@example.com'}</p>
                    </div>
                    <NavLink to="/profile" role="menuitem" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      My Profile
                    </NavLink>
                    <NavLink to="/settings" role="menuitem" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      Settings
                    </NavLink>
                    <hr className="my-1 border-slate-200" />
                    <button 
                      onClick={logout}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
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
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  style={{color: '#374151'}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#7c3aed';
                    e.currentTarget.style.backgroundColor = '#faf5ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#374151';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Log In
                </NavLink>
                <NavLink
                  to="/signup"
                  className="btn-primary"
                >
                  Sign Up
                </NavLink>
              </div>
            )}

            {/* Mobile trigger */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 transition-all duration-200"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
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
          <nav className="container mx-auto max-w-7xl px-4 py-4 space-y-1">
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
                        "block rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                        isActive ? "nav-link-active" : "nav-link-inactive"
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500 mb-3">Signed in as</p>
                  <div className="flex items-center gap-3">
                    <img src="/avatar-female.svg" alt="User Avatar" className="h-10 w-10 rounded-full" />
                    <div className="text-sm">
                      <div className="font-medium text-slate-800">{typedUser.name || 'Demo User'}</div>
                      <div className="text-slate-500">{typedUser.email || 'demo@example.com'}</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <NavLink className={({ isActive }) => cx("block rounded-lg px-3 py-2 text-sm text-center transition-all duration-200", isActive ? "nav-link-active" : "nav-link-inactive")} to="/profile" onClick={() => setMobileOpen(false)}>
                      Profile
                    </NavLink>
                    <NavLink className={({ isActive }) => cx("block rounded-lg px-3 py-2 text-sm text-center transition-all duration-200", isActive ? "nav-link-active" : "nav-link-inactive")} to="/settings" onClick={() => setMobileOpen(false)}>
                      Settings
                    </NavLink>
                    <button 
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 transition-colors"
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
                  className="flex-1 text-center rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 transition-all duration-200"
                >
                  Log In
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary flex-1 text-center"
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

/* Icons */
const ChevronDown = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/>
  </svg>
);
const MenuIcon = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>
  </svg>
);
const CloseIcon = (p: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18"/>
  </svg>
);
