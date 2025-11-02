import React, { useState } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard/Dashboard";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

  return isAuthenticated ? (
    <Dashboard />
  ) : (
    <Auth onAuth={() => setIsAuthenticated(true)} />
  );
}
