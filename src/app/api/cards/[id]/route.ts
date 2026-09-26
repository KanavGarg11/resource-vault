import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const card = await db.card.findFirst({
      where: {
        id: params.id,
        userId: user.id, // Must belong to this user
      },
      include: {
        items: {
          orderBy: { createdAt: "asc" }, // Linear chronological order like WhatsApp
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({ card });
  } catch (error: any) {
    console.error("Error fetching card:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch card" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to modify card" },
        { status: 401 }
      );
    }

    const existingCard = await db.card.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingCard) {
      return NextResponse.json(
        { error: "Card not found or access denied" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, theme, isPinned } = body;

    const data: Record<string, any> = {};
    if (title !== undefined) data.title = title.trim();
    if (theme !== undefined) data.theme = theme;
    if (isPinned !== undefined) data.isPinned = Boolean(isPinned);

    const updated = await db.card.update({
      where: { id: params.id },
      data,
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ card: updated });
  } catch (error: any) {
    console.error("Error updating card:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update card" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to delete card" },
        { status: 401 }
      );
    }

    const existingCard = await db.card.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingCard) {
      return NextResponse.json(
        { error: "Card not found or access denied" },
        { status: 404 }
      );
    }

    await db.card.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Card deleted" });
  } catch (error: any) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete card" },
      { status: 500 }
    );
  }
}
