"use client";

import Link from "next/link";
import { useRole } from "@/hooks/use-role";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export function Navbar() {
  const { role, toggleRole } = useRole();

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
          <FileText className="h-5 w-5 text-blue-600" />
          DocFlow
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Viewing as:</span>
          <button
            onClick={toggleRole}
            className={`relative inline-flex h-8 items-center rounded-full px-3 text-sm font-medium transition-colors ${
              role === "approver"
                ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            {role === "approver" ? "Approver" : "User"}
          </button>
          <span className="text-xs text-gray-400">(click to switch)</span>
        </div>
      </div>
    </header>
  );
}
