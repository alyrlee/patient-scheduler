import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  PowerIcon,
  ChevronDownIcon,
  Bars2Icon,
} from "@heroicons/react/24/solid";

/**
 * @typedef {{id:string,name:string,email:string,avatarUrl?:string}} User
 */

/**
 * @param {{user: User|null, onSignOut?:() => Promise<void>|void}} props
 */
export default function NavbarComponent({ user, onSignOut }) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile nav on route change
  useEffect(() => {
    setIsNavOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile nav on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960) {
        setIsNavOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('.profile-menu')) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);

  // Profile menu items
  const profileMenuItems = [
    {
      label: "My Profile",
      icon: UserCircleIcon,
    },
    {
      label: "Settings",
      icon: Cog6ToothIcon,
    },
    {
      label: "Sign Out",
      icon: PowerIcon,
    },
  ];

  // Navigation items
  const navListItems = [
    {
      label: "Dashboard",
      icon: UserCircleIcon,
      href: "/dashboard",
    },
    {
      label: "Providers",
      icon: UserGroupIcon,
      href: "/providers",
    },
    {
      label: "Appointments",
      icon: CalendarDaysIcon,
      href: "/appointments",
    },
    {
      label: "AI Assistant",
      icon: ChatBubbleLeftRightIcon,
      href: "/chat",
    },
  ];

  // Profile Menu Component
  function ProfileMenu() {
    const handleSignOut = () => {
      setIsProfileMenuOpen(false);
      onSignOut?.();
    };

    return (
      <div className="relative profile-menu">
        <button
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto hover:bg-gray-100 transition-colors"
        >
          <div className="h-8 w-8 rounded-full border border-gray-900 p-0.5 bg-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'DU'}
            </span>
          </div>
          <ChevronDownIcon
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${
              isProfileMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        
        {isProfileMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            {profileMenuItems.map(({ label, icon }, key) => {
              const isLastItem = key === profileMenuItems.length - 1;
              return (
                <button
                  key={label}
                  onClick={isLastItem ? handleSignOut : () => setIsProfileMenuOpen(false)}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 ${
                    isLastItem ? "text-red-600 hover:bg-red-50" : "text-gray-700"
                  }`}
                >
                  {React.createElement(icon, {
                    className: `h-4 w-4 ${isLastItem ? "text-red-500" : ""}`,
                    strokeWidth: 2,
                  })}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Navigation List Component
  function NavList() {
    return (
      <ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center">
        {navListItems.map(({ label, icon, href }) => (
          <Link
            key={label}
            to={href}
            className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {React.createElement(icon, { className: "h-[18px] w-[18px]" })}
            <span>{label}</span>
          </Link>
        ))}
      </ul>
    );
  }

  return (
    <nav className="mx-auto max-w-screen-xl p-2 lg:rounded-full lg:pl-6 bg-white border-b border-gray-200">
      <div className="relative mx-auto flex items-center justify-between text-gray-900">
        <Link
          to="/"
          className="mr-4 ml-2 cursor-pointer py-1.5 font-medium text-xl text-gray-900 hover:text-gray-700"
        >
          Patient Scheduler
        </Link>
        
        <div className="hidden lg:block">
          <NavList />
        </div>
        
        <button
          onClick={toggleIsNavOpen}
          className="ml-auto mr-2 lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Bars2Icon className="h-6 w-6" />
        </button>

        {user ? (
          <ProfileMenu />
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
      
      {isNavOpen && (
        <div className="lg:hidden border-t border-gray-200 pt-4 mt-4">
          <NavList />
          {!user && (
            <div className="flex flex-col gap-2 p-4">
              <Link
                to="/login"
                className="w-full text-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
