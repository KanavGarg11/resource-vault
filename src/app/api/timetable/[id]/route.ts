import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRequestAdmin } from "@/lib/auth";

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
    await db.timetableEntry.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: "Timetable entry deleted" });
  } catch (error) {
    console.error("Error deleting timetable entry:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
