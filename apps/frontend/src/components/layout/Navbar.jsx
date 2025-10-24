import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Navbar,
  MobileNav,
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  IconButton,
} from "@material-tailwind/react";
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
  const location = useLocation();

  // Close mobile nav on route change
  useEffect(() => {
    setIsNavOpen(false);
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const closeMenu = () => setIsMenuOpen(false);

    const handleSignOut = () => {
      closeMenu();
      onSignOut?.();
    };

    return (
      <Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
        <MenuHandler>
          <Button
            variant="text"
            color="blue-gray"
            className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto"
          >
            <Avatar
              variant="circular"
              size="sm"
              alt={user?.name || "User"}
              className="border border-gray-900 p-0.5"
              src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`}
            />
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`h-3 w-3 transition-transform ${
                isMenuOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </MenuHandler>
        <MenuList className="p-1">
          {profileMenuItems.map(({ label, icon }, key) => {
            const isLastItem = key === profileMenuItems.length - 1;
            return (
              <MenuItem
                key={label}
                onClick={isLastItem ? handleSignOut : closeMenu}
                className={`flex items-center gap-2 rounded ${
                  isLastItem
                    ? "hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10"
                    : ""
                }`}
              >
                {React.createElement(icon, {
                  className: `h-4 w-4 ${isLastItem ? "text-red-500" : ""}`,
                  strokeWidth: 2,
                })}
                <Typography
                  as="span"
                  variant="small"
                  className="font-normal"
                  color={isLastItem ? "red" : "inherit"}
                >
                  {label}
                </Typography>
              </MenuItem>
            );
          })}
        </MenuList>
      </Menu>
    );
  }

  // Navigation List Component
  function NavList() {
    return (
      <ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center">
        {navListItems.map(({ label, icon, href }, key) => (
          <Typography
            key={label}
            as={Link}
            to={href}
            variant="small"
            color="gray"
            className="font-medium text-blue-gray-500"
          >
            <MenuItem className="flex items-center gap-2 lg:rounded-full">
              {React.createElement(icon, { className: "h-[18px] w-[18px]" })}{" "}
              <span className="text-gray-900">{label}</span>
            </MenuItem>
          </Typography>
        ))}
      </ul>
    );
  }

  return (
    <Navbar className="mx-auto max-w-screen-xl p-2 lg:rounded-full lg:pl-6">
      <div className="relative mx-auto flex items-center justify-between text-blue-gray-900">
        <Typography
          as={Link}
          to="/"
          className="mr-4 ml-2 cursor-pointer py-1.5 font-medium"
        >
          Patient Scheduler
        </Typography>
        
        <div className="hidden lg:block">
          <NavList />
        </div>
        
        <IconButton
          size="sm"
          color="blue-gray"
          variant="text"
          onClick={toggleIsNavOpen}
          className="ml-auto mr-2 lg:hidden"
        >
          <Bars2Icon className="h-6 w-6" />
        </IconButton>

        {user ? (
          <ProfileMenu />
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="text" as={Link} to="/login">
              <span>Log In</span>
            </Button>
            <Button size="sm" variant="filled" as={Link} to="/signup">
              <span>Sign Up</span>
            </Button>
          </div>
        )}
      </div>
      
      <MobileNav open={isNavOpen} className="overflow-scroll">
        <NavList />
        {!user && (
          <div className="flex flex-col gap-2 p-4">
            <Button variant="text" as={Link} to="/login" fullWidth>
              Log In
            </Button>
            <Button variant="filled" as={Link} to="/signup" fullWidth>
              Sign Up
            </Button>
          </div>
        )}
      </MobileNav>
    </Navbar>
  );
}
