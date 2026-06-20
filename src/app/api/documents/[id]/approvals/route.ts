import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status, comment } = await request.json();

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "status must be approved or rejected" }, { status: 400 });
  }

  const approval = await prisma.approval.create({
    data: { documentId: id, status, comment },
  });

  await prisma.document.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(approval, { status: 201 });
}
