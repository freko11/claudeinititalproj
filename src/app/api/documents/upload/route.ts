import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const title = formData.get("title") as string | null;

  if (!file || !title) {
    return NextResponse.json({ error: "file and title are required" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase().replace(".", "");
  if (ext !== "pdf" && ext !== "docx") {
    return NextResponse.json({ error: "Only PDF and DOCX files are supported" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const uniqueName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadsDir, uniqueName);
  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  let content = "";
  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ path: filePath });
    content = result.value;
  }

  const doc = await prisma.document.create({
    data: {
      title,
      fileName: file.name,
      filePath: uniqueName,
      fileType: ext,
      content,
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
