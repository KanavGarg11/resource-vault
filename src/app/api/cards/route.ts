import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    // If user is not authenticated, return empty cards and zero counts (strict data privacy)
    if (!user) {
      return NextResponse.json({
        cards: [],
        countsByTheme: {
          study: 0,
          "study-to-do": 0,
          schedules: 0,
          "to-do": 0,
          personal: 0,
        },
      });
    }

    const { searchParams } = new URL(req.url);
    const countsOnly = searchParams.get("countsOnly") === "true";

    // Fast path: if only counts are requested, skip findMany and just return groupBy counts
    if (countsOnly) {
      const themeCounts = await db.card.groupBy({
        by: ["theme"],
        where: { userId: user.id },
        _count: { _all: true },
      });

      const countsByTheme: Record<string, number> = {
        study: 0,
        "study-to-do": 0,
        schedules: 0,
        "to-do": 0,
        personal: 0,
      };

      themeCounts.forEach((c) => {
        if (countsByTheme[c.theme] !== undefined) {
          countsByTheme[c.theme] = c._count._all;
        }
      });

      return NextResponse.json({ countsByTheme });
    }

    const theme = searchParams.get("theme");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      userId: user.id, // Only fetch cards owned by the logged-in user
    };

    if (theme && theme !== "all") {
      where.theme = theme;
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where.AND = [
        { userId: user.id },
        {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            {
              items: {
                some: {
                  OR: [
                    { content: { contains: q, mode: "insensitive" } },
                    { fileName: { contains: q, mode: "insensitive" } },
                  ],
                },
              },
            },
          ],
        },
      ];
    }

    // Pinned cards are prioritized ONLY on the Home Page, not on dedicated Theme pages
    const isThemePage = Boolean(theme && theme !== "all");
    const orderBy: any = isThemePage
      ? [{ updatedAt: "desc" }]
      : [{ isPinned: "desc" }, { updatedAt: "desc" }];

    const [cards, themeCounts] = await Promise.all([
      db.card.findMany({
        where,
        orderBy,
        include: {
          items: {
            orderBy: { createdAt: "desc" },
            take: 6, // Preview latest items for card preview
          },
          _count: {
            select: { items: true },
          },
        },
      }),
      db.card.groupBy({
        by: ["theme"],
        where: { userId: user.id },
        _count: { _all: true },
      }),
    ]);

    const countsByTheme: Record<string, number> = {
      study: 0,
      "study-to-do": 0,
      schedules: 0,
      "to-do": 0,
      personal: 0,
    };

    themeCounts.forEach((c) => {
      if (countsByTheme[c.theme] !== undefined) {
        countsByTheme[c.theme] = c._count._all;
      }
    });

    return NextResponse.json({ cards, countsByTheme });
  } catch (error: any) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to create cards" },
        { status: 401 }
      );
    }

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
        userId: user.id,
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
