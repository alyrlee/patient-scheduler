import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

// Navigation items
const nav = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Providers", href: "/providers" },
  { label: "Appointments", href: "/appointments" },
  { label: "AI Assistant", href: "/chat" },
];

// Helper to conditionally join classes
const cx = (...v) => v.filter(Boolean).join(" ");

export default function Header({ user, onSignOut }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && (setMenuOpen(false), setMobileOpen(false));
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => { 
      window.removeEventListener("keydown", onKey); 
      window.removeEventListener("click", onClick); 
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/80 bg-white/95 border-b border-slate-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <Logo className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight text-violet-700 group-hover:text-violet-800 transition-colors">
              Patient Scheduler
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cx(
                    "rounded-lg px-4 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 transition-all duration-200",
                    isActive
                      ? "text-violet-800 bg-violet-100 ring-1 ring-violet-200 shadow-sm"
                      : "text-slate-700 hover:text-violet-700 hover:bg-violet-50 hover:shadow-sm"
                  )
                }
                end={item.href === "/dashboard"}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Search"
              className="hidden sm:inline-flex rounded-full p-2.5 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 transition-colors"
              onClick={() => alert("Search functionality coming soon")}
            >
              <SearchIcon className="h-5 w-5 text-slate-600" />
            </button>

            {/* Profile */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex items-center rounded-full bg-violet-100 text-violet-800 pl-1 pr-3 py-2 shadow-sm hover:bg-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 transition-all duration-200"
                >
                  <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center ring-2 ring-white">
                    <span className="text-white text-sm font-semibold">
                      {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'DU'}
                    </span>
                  </div>
                  <span className="ml-3 hidden sm:inline text-sm font-medium">{user.name || 'Demo User'}</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5"
                  >
                    <NavLink to="/profile" role="menuitem" className="block px-3 py-2 text-sm hover:bg-slate-50">
                      My Profile
                    </NavLink>
                    <NavLink to="/settings" role="menuitem" className="block px-3 py-2 text-sm hover:bg-slate-50">
                      Settings
                    </NavLink>
                    <hr className="my-1 border-slate-200" />
                    <button 
                      onClick={onSignOut}
                      className="block w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <NavLink
                  to="/login"
                  className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-all duration-200 hover:shadow-sm"
                >
                  Log In
                </NavLink>
                <NavLink
                  to="/signup"
                  className="px-4 py-2.5 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-all duration-200 hover:shadow-md"
                >
                  Sign Up
                </NavLink>
              </div>
            )}

            {/* Mobile Trigger */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2.5 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Open menu"
            >
              {mobileOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <MobileSheet open={mobileOpen} onClose={() => setMobileOpen(false)} user={user} onSignOut={onSignOut} />
    </header>
  );
}

/* Mobile Sheet Component */
function MobileSheet({ open, onClose, user, onSignOut }) {
  if (!open) return null;
  const base = "block rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70";
  const active = "bg-violet-100 text-violet-800 ring-1 ring-violet-200 shadow-sm";
  const idle = "text-slate-700 hover:bg-violet-50 hover:text-violet-700 hover:shadow-sm";

  return (
    <div className="md:hidden border-t border-slate-200 bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 py-4 space-y-2">
        {nav.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/dashboard"}
            className={({ isActive }) => cx(base, isActive ? active : idle)}
            onClick={onClose}
          >
            {item.label}
          </NavLink>
        ))}
        {user ? (
          <div className="mt-2 rounded-xl border border-slate-200 p-3">
            <p className="text-xs text-slate-500 mb-2">Signed in as</p>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-violet-600 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'DU'}
                </span>
              </div>
              <div className="text-sm">
                <div className="font-medium text-slate-800">{user.name || 'Demo User'}</div>
                <div className="text-slate-500">{user.email || 'demo@example.com'}</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <NavLink className={({ isActive }) => cx(base, "text-center", isActive ? active : idle)} to="/profile" onClick={onClose}>
                Profile
              </NavLink>
              <NavLink className={({ isActive }) => cx(base, "text-center", isActive ? active : idle)} to="/settings" onClick={onClose}>
                Settings
              </NavLink>
              <button 
                onClick={() => { onSignOut(); onClose(); }}
                className="col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 hover:bg-rose-100"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex gap-2">
            <NavLink
              to="/login"
              onClick={onClose}
              className="flex-1 text-center rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Log In
            </NavLink>
            <NavLink
              to="/signup"
              onClick={onClose}
              className="flex-1 text-center rounded-lg bg-violet-600 px-3 py-2 text-sm text-white hover:bg-violet-700"
            >
              Sign Up
            </NavLink>
          </div>
        )}
      </nav>
    </div>
  );
}

/* Icons and Logo */
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

function SearchIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
    </svg>
  );
}

const ChevronDown = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
  </svg>
);

const MenuIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
  </svg>
);