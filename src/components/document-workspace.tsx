"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/use-role";
import { RichEditor } from "@/components/rich-editor";

const PdfViewer = dynamic(
  () => import("@/components/pdf-viewer").then((m) => m.PdfViewer),
  { ssr: false, loading: () => <div className="p-4 text-sm text-gray-400">Loading PDF…</div> }
);
import { StatusBadge } from "@/components/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, MessageSquare, History, Edit3, Send } from "lucide-react";

interface Comment {
  id: string;
  body: string;
  resolved: boolean;
  createdAt: string;
}

interface Version {
  id: string;
  content: string;
  changeNote: string | null;
  role: string;
  createdAt: string;
}

interface Approval {
  id: string;
  status: string;
  comment: string | null;
  createdAt: string;
}

interface Document {
  id: string;
  title: string;
  fileName: string;
  filePath: string;
  fileType: string;
  content: string;
  status: string;
  comments: Comment[];
  versions: Version[];
  approvals: Approval[];
}

export function DocumentWorkspace({ doc }: { doc: Document }) {
  const { role } = useRole();
  const router = useRouter();

  const [content, setContent] = useState(doc.content);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [approvalComment, setApprovalComment] = useState("");
  const [actioning, setActioning] = useState(false);
  const [comments, setComments] = useState<Comment[]>(doc.comments);

  const fileUrl = `/api/files/${doc.filePath}`;

  const saveDraft = useCallback(async () => {
    setSaving(true);
    await fetch(`/api/documents/${doc.id}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, changeNote: changeNote || null, role }),
    });
    setChangeNote("");
    setSaving(false);
    router.refresh();
  }, [content, changeNote, doc.id, role, router]);

  const submitForReview = useCallback(async () => {
    setSubmitting(true);
    await fetch(`/api/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "pending_review" }),
    });
    setSubmitting(false);
    router.refresh();
  }, [doc.id, router]);

  const postComment = useCallback(async () => {
    if (!commentBody.trim()) return;
    setPostingComment(true);
    const res = await fetch(`/api/documents/${doc.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: commentBody.trim() }),
    });
    const newComment = await res.json();
    setComments((prev) => [...prev, newComment]);
    setCommentBody("");
    setPostingComment(false);
  }, [commentBody, doc.id]);

  const resolveComment = useCallback(async (commentId: string, resolved: boolean) => {
    await fetch(`/api/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved }),
    });
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved } : c))
    );
  }, []);

  const submitApproval = useCallback(async (status: "approved" | "rejected") => {
    setActioning(true);
    await fetch(`/api/documents/${doc.id}/approvals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, comment: approvalComment || null }),
    });
    setApprovalComment("");
    setActioning(false);
    router.refresh();
  }, [approvalComment, doc.id, router]);

  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  return (
    <div className="flex h-full">
      {/* Left: original file viewer */}
      <div className="w-1/2 border-r bg-gray-100 overflow-hidden flex flex-col">
        <div className="px-4 py-2 bg-white border-b text-xs text-gray-500 font-medium flex items-center justify-between">
          <span>Original: {doc.fileName}</span>
          <StatusBadge status={doc.status} />
        </div>
        <div className="flex-1 overflow-auto">
          {doc.fileType === "pdf" ? (
            <PdfViewer url={fileUrl} />
          ) : (
            <div className="p-6 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              <p className="text-xs text-gray-400 mb-3 uppercase tracking-wide">Extracted text from {doc.fileName}</p>
              {doc.content || <span className="text-gray-300 italic">No text extracted from this file.</span>}
            </div>
          )}
        </div>
      </div>

      {/* Right: tabbed workspace */}
      <div className="w-1/2 flex flex-col overflow-hidden">
        <div className="px-4 py-2 bg-white border-b">
          <h1 className="font-semibold text-gray-900 truncate">{doc.title}</h1>
        </div>

        <Tabs defaultValue="edit" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 mt-3 mb-0 w-fit">
            <TabsTrigger value="edit" className="gap-1.5">
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Comments
              {unresolvedCount > 0 && (
                <span className="ml-1 rounded-full bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 leading-none">
                  {unresolvedCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-3.5 w-3.5" /> History
            </TabsTrigger>
            {role === "approver" && (
              <TabsTrigger value="approval" className="gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" /> Approval
              </TabsTrigger>
            )}
          </TabsList>

          {/* Edit tab */}
          <TabsContent value="edit" className="flex-1 flex flex-col overflow-hidden m-0">
            <div className="flex-1 overflow-auto px-4 py-3">
              <div className="bg-white border rounded-lg p-4 min-h-[300px]">
                <RichEditor
                  content={content}
                  onChange={setContent}
                  editable={role === "user" && doc.status === "draft"}
                />
              </div>
            </div>
            {role === "user" && doc.status === "draft" && (
              <div className="border-t bg-white px-4 py-3 space-y-2">
                <input
                  className="w-full text-sm border rounded px-3 py-1.5 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Change note (optional)"
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={saveDraft} disabled={saving}>
                    {saving ? "Saving…" : "Save Draft"}
                  </Button>
                  <Button size="sm" onClick={submitForReview} disabled={submitting} className="gap-1.5">
                    <Send className="h-3.5 w-3.5" />
                    {submitting ? "Submitting…" : "Submit for Approval"}
                  </Button>
                </div>
              </div>
            )}
            {role === "user" && doc.status === "pending_review" && (
              <div className="border-t bg-yellow-50 px-4 py-2 text-sm text-yellow-700 font-medium">
                This document is under review — editing is locked.
              </div>
            )}
            {doc.status === "approved" && (
              <div className="border-t bg-green-50 px-4 py-2 text-sm text-green-700 font-medium">
                This document has been approved — editing is locked.
              </div>
            )}
          </TabsContent>

          {/* Comments tab */}
          <TabsContent value="comments" className="flex-1 flex flex-col overflow-hidden m-0">
            <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
              {comments.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No comments yet.</p>
              )}
              {comments.map((c) => (
                <div
                  key={c.id}
                  className={`rounded-lg border p-3 text-sm ${c.resolved ? "bg-gray-50 opacity-60" : "bg-white"}`}
                >
                  <p className="text-gray-700">{c.body}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                    <button
                      onClick={() => resolveComment(c.id, !c.resolved)}
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        c.resolved
                          ? "text-gray-500 hover:text-gray-700"
                          : "text-green-600 hover:text-green-800"
                      }`}
                    >
                      {c.resolved ? "Reopen" : "Mark Resolved"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {role === "approver" && (
              <div className="border-t bg-white px-4 py-3 space-y-2">
                <Textarea
                  placeholder="Leave a comment for the user to action…"
                  rows={3}
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  className="text-sm"
                />
                <Button size="sm" onClick={postComment} disabled={postingComment || !commentBody.trim()}>
                  {postingComment ? "Posting…" : "Post Comment"}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* History tab */}
          <TabsContent value="history" className="flex-1 overflow-auto m-0 px-4 py-3">
            {doc.versions.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No saved versions yet.</p>
            )}
            <ol className="relative border-l border-gray-200 ml-2 space-y-4">
              {doc.versions.map((v) => (
                <li key={v.id} className="ml-4">
                  <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white bg-blue-400" />
                  <div className="bg-white border rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${v.role === "approver" ? "text-purple-600" : "text-blue-600"}`}>
                        {v.role === "approver" ? "Approver" : "User"}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(v.createdAt).toLocaleString()}</span>
                    </div>
                    {v.changeNote && <p className="text-gray-600">{v.changeNote}</p>}
                    {!v.changeNote && <p className="text-gray-400 italic">No change note</p>}
                  </div>
                </li>
              ))}
            </ol>

            {doc.approvals.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Approval History</h3>
                <ol className="relative border-l border-gray-200 ml-2 space-y-4">
                  {doc.approvals.map((a) => (
                    <li key={a.id} className="ml-4">
                      <div className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white ${a.status === "approved" ? "bg-green-400" : "bg-red-400"}`} />
                      <div className="bg-white border rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${a.status === "approved" ? "text-green-600" : "text-red-600"}`}>
                            {a.status === "approved" ? "Approved" : "Rejected"}
                          </span>
                          <span className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString()}</span>
                        </div>
                        {a.comment && <p className="text-gray-600">{a.comment}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </TabsContent>

          {/* Approval tab (approver only) */}
          {role === "approver" && (
            <TabsContent value="approval" className="flex-1 overflow-auto m-0 px-4 py-6">
              {doc.status !== "pending_review" ? (
                <div className="text-center text-sm text-gray-400 py-8">
                  {doc.status === "approved" && "This document has been approved."}
                  {doc.status === "rejected" && "This document has been rejected."}
                  {doc.status === "draft" && "Document is still in draft — not submitted for review yet."}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    This document is pending your review. Add an optional comment, then approve or reject.
                  </p>
                  <Textarea
                    placeholder="Approval comment (optional)…"
                    rows={4}
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={() => submitApproval("approved")}
                      disabled={actioning}
                      className="gap-1.5 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => submitApproval("rejected")}
                      disabled={actioning}
                      variant="destructive"
                      className="gap-1.5"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
