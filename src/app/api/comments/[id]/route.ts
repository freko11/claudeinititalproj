import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { resolved } = await request.json();

  const comment = await prisma.comment.update({
    where: { id },
    data: { resolved },
  });

  return NextResponse.json(comment);
}
