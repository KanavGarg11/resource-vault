import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to share cards." },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { isPublic } = body;

    // Verify card ownership
    const existingCard = await db.card.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingCard) {
      return NextResponse.json(
        { error: "Card not found or access denied" },
        { status: 404 }
      );
    }

    let token = existingCard.shareToken;

    if (isPublic && !token) {
      // Generate a clean 12-char hex token
      token = crypto.randomBytes(6).toString("hex");
    }

    const updatedCard = await db.card.update({
      where: { id },
      data: {
        isPublic: Boolean(isPublic),
        shareToken: token,
      },
    });

    return NextResponse.json({
      success: true,
      isPublic: updatedCard.isPublic,
      shareToken: updatedCard.shareToken,
    });
  } catch (error) {
    console.error("Error updating card share status:", error);
    return NextResponse.json(
      { error: "Failed to update share settings" },
      { status: 500 }
    );
  }
}
