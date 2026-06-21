import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { content, changeNote } = await request.json();

  const version = await prisma.version.create({
    data: {
      documentId: id,
      content,
      changeNote,
      role: session.user.role,
      authorId: session.user.id,
    },
  });

  await prisma.document.update({
    where: { id },
    data: { content },
  });

  return NextResponse.json(version, { status: 201 });
}
