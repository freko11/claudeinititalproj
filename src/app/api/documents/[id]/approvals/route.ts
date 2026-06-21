import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "approver") return NextResponse.json({ error: "Forbidden: approvers only" }, { status: 403 });

  const { id } = await params;
  const { status, comment } = await request.json();

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
  }

  const approval = await prisma.approval.create({
    data: { documentId: id, status, comment, authorId: session.user.id },
    include: { author: { select: { email: true } } },
  });

  await prisma.document.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(approval, { status: 201 });
}
