import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRequestAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const isPinned = searchParams.get("pinned");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (type) {
      where.type = type;
    }
    if (category) {
      where.category = category;
    }
    if (status) {
      where.status = status;
    }
    if (isPinned === "true") {
      where.isPinned = true;
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
        { category: { contains: q } },
        { fileName: { contains: q } },
      ];
    }

    const resources = await db.resource.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkRequestAdmin(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Admin PIN required to create resources" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      type,
      category,
      semester,
      url,
      filePath,
      fileName,
      fileSize,
      mimeType,
      tags,
      isPinned,
      dueDate,
      status,
      priority,
    } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: "Title and type are required" },
        { status: 400 }
      );
    }

    const newResource = await db.resource.create({
      data: {
        title,
        description: description || null,
        type,
        category: category || null,
        semester: semester || null,
        url: url || null,
        filePath: filePath || null,
        fileName: fileName || null,
        fileSize: fileSize ? Number(fileSize) : null,
        mimeType: mimeType || null,
        tags: tags || null,
        isPinned: Boolean(isPinned),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || (type === "assignment" || type === "note" ? "pending" : null),
        priority: priority || "normal",
      },
    });

    return NextResponse.json({ resource: newResource }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create resource" },
      { status: 500 }
    );
  }
}
