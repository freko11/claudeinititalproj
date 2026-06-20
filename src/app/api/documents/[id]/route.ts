import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      versions: { orderBy: { createdAt: "desc" } },
      comments: { orderBy: { createdAt: "asc" } },
      approvals: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const doc = await prisma.document.update({
    where: { id },
    data: {
      ...(body.content !== undefined && { content: body.content }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.title !== undefined && { title: body.title }),
    },
  });
  return NextResponse.json(doc);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const filePath = path.join(process.cwd(), "uploads", doc.filePath);
  await unlink(filePath).catch(() => {});

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
