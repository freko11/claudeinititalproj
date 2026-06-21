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
  const { body } = await request.json();

  const comment = await prisma.comment.create({
    data: { documentId: id, body },
  });

  return NextResponse.json(comment, { status: 201 });
}
