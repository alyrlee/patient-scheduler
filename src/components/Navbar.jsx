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
