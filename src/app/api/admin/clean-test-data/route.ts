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
    const deletedResources = await db.resource.deleteMany();
    const deletedTimetable = await db.timetableEntry.deleteMany();
    const deletedEvents = await db.academicEvent.deleteMany();

    return NextResponse.json({
      success: true,
      message: "All test and sample data removed successfully.",
      counts: {
        resources: deletedResources.count,
        timetable: deletedTimetable.count,
        events: deletedEvents.count,
      },
    });
  } catch (error: any) {
    console.error("Clean error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to clear test data" },
      { status: 500 }
    );
  }
}
