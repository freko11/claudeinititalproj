"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/use-role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ArrowLeft, ShieldOff } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();
  const { role } = useRole();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title.trim());

    const res = await fetch("/api/documents/upload", { method: "POST", body: formData });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Upload failed");
      setLoading(false);
      return;
    }

    const doc = await res.json();
    router.push(`/documents/${doc.id}`);
  }

  if (role === "approver") {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <ShieldOff className="h-10 w-10 mx-auto text-gray-300 mb-3" />
        <h2 className="text-lg font-semibold text-gray-700 mb-1">Access restricted</h2>
        <p className="text-sm text-gray-500 mb-4">Approvers cannot upload documents.</p>
        <Link href="/" className="text-sm text-blue-600 hover:underline">Back to documents</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to documents
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Document</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border shadow-sm p-6 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Document title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for this document"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="file">File (PDF or Word .docx)</Label>
          <div
            className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-300 transition-colors cursor-pointer"
            onClick={() => document.getElementById("file")?.click()}
          >
            {file ? (
              <div>
                <p className="font-medium text-gray-700">{file.name}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div>
                <Upload className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">Click to select a file</p>
                <p className="text-xs text-gray-400 mt-1">PDF or DOCX only</p>
              </div>
            )}
            <input
              id="file"
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={!file || !title.trim() || loading} className="w-full">
          {loading ? "Uploading…" : "Upload Document"}
        </Button>
      </form>
    </div>
  );
}
