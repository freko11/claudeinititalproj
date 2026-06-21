"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "user";
  const email = session?.user?.email ?? "";

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
          <FileText className="h-5 w-5 text-blue-600" />
          DocFlow
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{email}</span>
          <span
            className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-medium ${
              role === "approver"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {role === "approver" ? "Approver" : "User"}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
