import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { body } = await request.json();

  const comment = await prisma.comment.create({
    data: { documentId: id, body },
  });

  return NextResponse.json(comment, { status: 201 });
}
