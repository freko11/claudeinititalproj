"use client";

import { useSession } from "next-auth/react";

export type Role = "user" | "approver";

export function useRole() {
  const { data: session } = useSession();
  const role: Role = (session?.user?.role as Role) ?? "user";
  return { role };
}
