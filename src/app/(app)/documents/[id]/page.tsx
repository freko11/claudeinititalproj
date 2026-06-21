import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DocumentWorkspace } from "@/components/document-workspace";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      versions: { orderBy: { createdAt: "desc" } },
      comments: { orderBy: { createdAt: "asc" } },
      approvals: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!doc) notFound();

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="border-b bg-white px-4 py-2">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-3.5 w-3.5" />
          All documents
        </Link>
      </div>
      <div className="flex-1 overflow-hidden">
        <DocumentWorkspace doc={JSON.parse(JSON.stringify(doc))} />
      </div>
    </div>
  );
}
