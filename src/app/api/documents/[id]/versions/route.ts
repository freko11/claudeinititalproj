import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { content, changeNote, role } = await request.json();

  const version = await prisma.version.create({
    data: { documentId: id, content, changeNote, role: role ?? "user" },
  });

  await prisma.document.update({
    where: { id },
    data: { content },
  });

  return NextResponse.json(version, { status: 201 });
}
