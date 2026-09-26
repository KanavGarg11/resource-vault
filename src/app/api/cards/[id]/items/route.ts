import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in" },
        { status: 401 }
      );
    }

    const cardId = params.id;

    // Verify card ownership
    const card = await db.card.findFirst({
      where: { id: cardId, userId: user.id },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Card not found or access denied" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { type, content, filePath, fileName, fileSize, mimeType } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Item type is required" },
        { status: 400 }
      );
    }

    // Create item and update card timestamp
    const [item] = await db.$transaction([
      db.cardItem.create({
        data: {
          cardId,
          type: type || "text",
          content: content || null,
          filePath: filePath || null,
          fileName: fileName || null,
          fileSize: fileSize ? Number(fileSize) : null,
          mimeType: mimeType || null,
        },
      }),
      db.card.update({
        where: { id: cardId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    console.error("Error adding card item:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to add item to card" },
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
        { error: "Unauthorized: Please sign in" },
        { status: 401 }
      );
    }

    const cardId = params.id;

    // Verify card ownership
    const card = await db.card.findFirst({
      where: { id: cardId, userId: user.id },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Card not found or access denied" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId is required" },
        { status: 400 }
      );
    }

    await db.cardItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true, message: "Item deleted" });
  } catch (error: any) {
    console.error("Error deleting card item:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete item" },
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
        { error: "Unauthorized: Please sign in" },
        { status: 401 }
      );
    }

    const cardId = params.id;

    // Verify card ownership
    const card = await db.card.findFirst({
      where: { id: cardId, userId: user.id },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Card not found or access denied" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { itemId, content } = body;

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId is required" },
        { status: 400 }
      );
    }

    const updatedItem = await db.cardItem.update({
      where: { id: itemId },
      data: {
        content: content?.trim() || null,
      },
    });

    return NextResponse.json({ item: updatedItem });
  } catch (error: any) {
    console.error("Error updating card item:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update item" },
      { status: 500 }
    );
  }
}
