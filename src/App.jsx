import React from "react";
import AppRouter from "./AppRouter";
import DemoModeBanner from "./components/DemoModeBanner";

export default function App() {
  return (
    <>
      <DemoModeBanner />
      <AppRouter />
    </>
  );
}