import React from "react";
import { Link } from "react-router-dom";

/**
 * @param {{appName?:string, logoSrc?:string}} props
 */
export default function Header({
  appName = "Patient Scheduler",
  logoSrc = "/logo.svg",
}) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex h-16 items-center">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img src={logoSrc} alt="" className="h-8 w-8 rounded-md" />
            <span className="truncate font-semibold text-gray-800 text-lg">
              {appName}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}