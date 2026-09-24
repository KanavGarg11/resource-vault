import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRequestAdmin } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkRequestAdmin(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Admin PIN required to add items" },
      { status: 401 }
    );
  }

  try {
    const cardId = params.id;
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
  if (!checkRequestAdmin(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Admin PIN required" },
      { status: 401 }
    );
  }

  try {
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
