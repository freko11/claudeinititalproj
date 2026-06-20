"use client";

import Link from "next/link";
import { useRole } from "@/hooks/use-role";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export function UploadButton() {
  const { role } = useRole();

  if (role === "approver") return null;

  return (
    <Link href="/documents/upload">
      <Button className="gap-2">
        <Upload className="h-4 w-4" />
        Upload Document
      </Button>
    </Link>
  );
}
