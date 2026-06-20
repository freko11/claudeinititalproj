import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const documents = await prisma.document.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { comments: true, versions: true } },
    },
  });
  return NextResponse.json(documents);
}
