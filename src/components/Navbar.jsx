import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

/**
 * @typedef {{id:string,name:string,email:string,avatarUrl?:string}} User
 */

/**
 * @param {{user: User|null, onSignOut?:() => Promise<void>|void}} props
 */
export default function Navbar({ user, onSignOut }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const mobileRef = useRef(null);
  const userMenuRef = useRef(null);
  const userBtnRef = useRef(null);
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close user menu on outside click / Esc
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setMobileOpen(false);
        userBtnRef.current?.focus();
      }
    }
    function onClick(e) {
      if (!userMenuOpen) return;
      const t = e.target;
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(t) &&
        userBtnRef.current &&
        !userBtnRef.current.contains(t)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [userMenuOpen]);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = original);
    }
  }, [mobileOpen]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "👤";

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Left side: Hamburger menu + Brand */}
          <div className="flex items-center gap-3">
            {/* Hamburger menu button */}
            <button
              aria-controls="mobile-nav"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-curious-blue-500"
            >
              <span className="sr-only">Toggle menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    mobileOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>

            {/* Brand */}
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <img src="/logo.svg" alt="" className="h-7 w-7 rounded-md" />
              <span className="truncate font-semibold text-gray-800">
                Patient Scheduler
              </span>
            </Link>
          </div>

          {/* Center navigation (desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink
              to="/providers"
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              Providers
            </NavLink>
            <NavLink
              to="/appointments"
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              Appointments
            </NavLink>
            <NavLink
              to="/chat"
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              AI Assistant
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              Settings
            </NavLink>
          </div>

          {/* Right side: User menu or auth buttons */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  ref={userBtnRef}
                  id="user-menu-button"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-curious-blue-500"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="h-7 w-7 rounded-full bg-curious-blue-100 text-curious-blue-700 flex items-center justify-center text-xs font-semibold"
                    >
                      {initials}
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[10rem] truncate text-gray-700">
                    {user.name}
                  </span>
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div
                    ref={userMenuRef}
                    role="menu"
                    aria-labelledby="user-menu-button"
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden focus:outline-none"
                  >
                    <Link
                      to="/settings"
                      role="menuitem"
                      className="block px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/appointments"
                      role="menuitem"
                      className="block px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Appointments
                    </Link>
                    <button
                      role="menuitem"
                      className="w-full text-left px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      onClick={async () => {
                        setUserMenuOpen(false);
                        await onSignOut?.();
                      }}
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
                className="text-sm text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-curious-blue-500"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-sm px-3 py-1.5 rounded-lg bg-curious-blue-600 text-white hover:bg-curious-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-curious-blue-500"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-nav"
          ref={mobileRef}
          className={`md:hidden overflow-hidden transition-[max-height] duration-200 ${
            mobileOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
            <MobileLink to="/providers" onClick={() => setMobileOpen(false)}>
              Providers
            </MobileLink>
            <MobileLink to="/appointments" onClick={() => setMobileOpen(false)}>
              Appointments
            </MobileLink>
            <MobileLink to="/chat" onClick={() => setMobileOpen(false)}>
              AI Assistant
            </MobileLink>
            <MobileLink to="/settings" onClick={() => setMobileOpen(false)}>
              Settings
            </MobileLink>
            {!user && (
              <div className="pt-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center rounded-lg bg-curious-blue-600 text-white px-3 py-2 text-sm hover:bg-curious-blue-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function MobileLink({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-md text-base font-medium ${
          isActive
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
