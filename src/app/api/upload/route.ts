import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized: Please sign in to upload files" },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Limit single file size to 15MB to prevent abuse on free hosting
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 15MB limit. Please upload to Google Drive and paste the link instead." },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize and create unique filename
    const originalName = file.name || "uploaded-file";
    const ext = path.extname(originalName);
    const baseName = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);
    const uniqueFileName = `${Date.now()}-${baseName}${ext}`;
    const destinationPath = path.join(uploadsDir, uniqueFileName);

    await fs.promises.writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      file: {
        fileName: originalName,
        filePath: publicUrl,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error?.message || "File upload failed" }, { status: 500 });
  }
}
