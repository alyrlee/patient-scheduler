// src/router.jsx
import React from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./components/layout/RootLayout";
import Protected from "./routes/Protected";
import Login from "./routes/Login";
import Signup from "./routes/Signup";
import Dashboard from "./pages/Dashboard";
import Providers from "./pages/Providers";
import Appointments from "./pages/Appointments";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      {
        element: <Protected />,
        children: [
          { path: "/", element: <Dashboard /> },
          { path: "/providers", element: <Providers /> },
          { path: "/appointments", element: <Appointments /> },
          { path: "/chat", element: <Chat /> },
          { path: "/settings", element: <Settings /> },
        ]
      }
    ]
  }
]);
