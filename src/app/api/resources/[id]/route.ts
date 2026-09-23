import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRequestAdmin } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resource = await db.resource.findUnique({
      where: { id: params.id },
    });

    if (!resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json({ resource });
  } catch (error) {
    console.error("Error fetching resource:", error);
    return NextResponse.json({ error: "Failed to fetch resource" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkRequestAdmin(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Admin PIN required to modify resources" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    const allowedFields = [
      "title",
      "description",
      "type",
      "category",
      "semester",
      "url",
      "filePath",
      "fileName",
      "fileSize",
      "mimeType",
      "tags",
      "isPinned",
      "status",
      "priority",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }

    const updated = await db.resource.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ resource: updated });
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkRequestAdmin(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Admin PIN required to delete resources" },
      { status: 401 }
    );
  }

  try {
    const existing = await db.resource.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // Attempt to delete physical file if stored locally in /uploads/
    if (existing.filePath && existing.filePath.startsWith("/uploads/")) {
      try {
        const fullLocalPath = path.join(
          process.cwd(),
          "public",
          existing.filePath.replace(/^\//, "")
        );
        if (fs.existsSync(fullLocalPath)) {
          fs.unlinkSync(fullLocalPath);
        }
      } catch (err) {
        console.warn("Could not delete local file:", err);
      }
    }

    await db.resource.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Resource deleted" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}
