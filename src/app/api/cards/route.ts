import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRequestAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const theme = searchParams.get("theme");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (theme && theme !== "all") {
      where.theme = theme;
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        {
          items: {
            some: {
              OR: [
                { content: { contains: q } },
                { fileName: { contains: q } },
              ],
            },
          },
        },
      ];
    }

    const cards = await db.card.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        { updatedAt: "desc" },
      ],
      include: {
        items: {
          orderBy: { createdAt: "desc" },
          take: 6, // Preview latest items for card preview
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return NextResponse.json({ cards });
  } catch (error: any) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!checkRequestAdmin(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Admin PIN required to create cards" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { title, theme, initialItem } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Card title is required" },
        { status: 400 }
      );
    }

    const cardTheme = theme || "personal";

    const card = await db.card.create({
      data: {
        title: title.trim(),
        theme: cardTheme,
        items: initialItem
          ? {
              create: {
                type: initialItem.type || "text",
                content: initialItem.content || null,
                filePath: initialItem.filePath || null,
                fileName: initialItem.fileName || null,
                fileSize: initialItem.fileSize || null,
                mimeType: initialItem.mimeType || null,
              },
            }
          : undefined,
      },
      include: {
        items: true,
        _count: {
          select: { items: true },
        },
      },
    });

    return NextResponse.json({ card }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating card:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create card" },
      { status: 500 }
    );
  }
}
