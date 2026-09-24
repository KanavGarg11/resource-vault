import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRequestAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!checkRequestAdmin(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Admin PIN required" },
      { status: 401 }
    );
  }

  try {
    const deletedItems = await db.cardItem.deleteMany();
    const deletedCards = await db.card.deleteMany();
    const deletedTimetable = await db.timetableEntry.deleteMany();

    return NextResponse.json({
      success: true,
      message: "All cards and data removed successfully.",
      counts: {
        cards: deletedCards.count,
        items: deletedItems.count,
        timetable: deletedTimetable.count,
      },
    });
  } catch (error: any) {
    console.error("Clean error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to clear cards" },
      { status: 500 }
    );
  }
}
