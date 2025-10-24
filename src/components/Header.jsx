import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [avatarUrl]
 */

/**
 * @typedef {Object} HeaderProps
 * @property {string} [appName] - App name to display
 * @property {string} [logoSrc] - Logo image source
 * @property {User|null} user - User object from auth context
 * @property {Function} [onSignOut] - Sign out handler
 */

export default function Header({
  appName = "Patient Scheduler",
  logoSrc = "/logo.svg",
  user,
  onSignOut,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const btnRef = useRef(null);
  const popRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMobileMenuOpen(false);
      }
    }
    function onClick(e) {
      if (!menuOpen) return;
      const t = e.target;
      if (popRef.current && !popRef.current.contains(t) && btnRef.current && !btnRef.current.contains(t)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menuOpen]);

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()
    : "👤";

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img src={logoSrc} alt="" className="h-7 w-7 rounded-md" />
            <span className="truncate font-semibold text-gray-800">{appName}</span>
          </Link>

          {/* Main Navigation - Center */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink 
              to="/providers" 
              className={({isActive}) => isActive ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"}
            >
              Providers
            </NavLink>
            <NavLink 
              to="/appointments" 
              className={({isActive}) => isActive ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"}
            >
              Appointments
            </NavLink>
            <NavLink 
              to="/chat" 
              className={({isActive}) => isActive ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"}
            >
              AI Assistant
            </NavLink>
            <NavLink 
              to="/settings" 
              className={({isActive}) => isActive ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"}
            >
              Settings
            </NavLink>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-curious-blue-500"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Right side: auth / user */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* User menu */}
              <div className="relative">
                <button
                  ref={btnRef}
                  className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1.5 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-curious-blue-500"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-curious-blue-100 text-curious-blue-700 flex items-center justify-center text-xs font-semibold" aria-hidden>
                      {initials}
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[10rem] truncate text-gray-700">{user.name}</span>
                  <span aria-hidden>▾</span>
                </button>

                {menuOpen && (
                  <div
                    ref={popRef}
                    role="menu"
                    className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
                  >
                    <Link
                      to="/settings"
                      role="menuitem"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/appointments"
                      role="menuitem"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Appointments
                    </Link>
                    <button
                      role="menuitem"
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={async () => { setMenuOpen(false); await onSignOut?.(); }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-curious-blue-500"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm px-3 py-1.5 rounded-md bg-curious-blue-600 text-white hover:bg-curious-blue-700 focus:outline-none focus:ring-2 focus:ring-curious-blue-500"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <NavLink
                to="/providers"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Providers
              </NavLink>
              <NavLink
                to="/appointments"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Appointments
              </NavLink>
              <NavLink
                to="/chat"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                AI Assistant
              </NavLink>
              <NavLink
                to="/settings"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
