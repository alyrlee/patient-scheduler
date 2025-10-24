import React from "react";
import { Outlet } from "react-router-dom";
import AppHeader from "./Header";

export default function RootLayout() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <AppHeader />
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
}
