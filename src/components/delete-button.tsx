"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRole } from "@/hooks/use-role";
import { Trash2 } from "lucide-react";

export function DeleteButton({ docId }: { docId: string }) {
  const { role } = useRole();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (role !== "user") return null;

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("Delete this document? This cannot be undone.")) return;
    setLoading(true);
    await fetch(`/api/documents/${docId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
      title="Delete document"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
