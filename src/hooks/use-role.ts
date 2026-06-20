"use client";

import { useEffect, useState } from "react";

export type Role = "user" | "approver";

export function useRole() {
  const [role, setRole] = useState<Role>("user");

  useEffect(() => {
    const stored = localStorage.getItem("docflow-role") as Role | null;
    if (stored === "user" || stored === "approver") setRole(stored);
  }, []);

  const toggleRole = () => {
    const next: Role = role === "user" ? "approver" : "user";
    setRole(next);
    localStorage.setItem("docflow-role", next);
  };

  return { role, toggleRole };
}
