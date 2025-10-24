import React from "react";
import { Outlet } from "react-router-dom";
import AppHeader from "../AppHeader";

export default function RootLayout() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <AppHeader />
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
