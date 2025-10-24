// src/routes/Protected.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/auth";

export default function Protected() {
  const { user } = useAuth();
  if (user === null) return <Navigate to="/login" replace />;
  return <Outlet />;
}
