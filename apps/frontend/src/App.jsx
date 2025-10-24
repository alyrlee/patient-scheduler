import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/auth";
import RootLayout from "./components/layout/RootLayout";
import Protected from "./pages/Protected";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Providers from "./pages/Providers";
import Appointments from "./pages/Appointments";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            element={<Protected />}
            children={[
              { path: "/", element: <Dashboard /> },
              { path: "/providers", element: <Providers /> },
              { path: "/appointments", element: <Appointments /> },
              { path: "/chat", element: <Chat /> },
              { path: "/settings", element: <Settings /> },
            ]}
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}