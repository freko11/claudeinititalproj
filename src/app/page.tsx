import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { DeleteButton } from "@/components/delete-button";
import { UploadButton } from "@/components/upload-button";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const documents = await prisma.document.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { comments: true, versions: true } } },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <UploadButton />
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No documents yet</p>
          <p className="text-sm mt-1">Upload a PDF or Word document to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Versions</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Comments</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {doc.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{doc.fileName}</p>
                  </td>
                  <td className="px-4 py-3 uppercase text-xs text-gray-500 font-mono">
                    {doc.fileType}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{doc._count.versions}</td>
                  <td className="px-4 py-3 text-gray-600">{doc._count.comments}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton docId={doc.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
