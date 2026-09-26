import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

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

    const entry = await db.timetableEntry.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Timetable entry not found or access denied" },
        { status: 404 }
      );
    }

    await db.timetableEntry.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Timetable entry deleted" });
  } catch (error) {
    console.error("Error deleting timetable entry:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
