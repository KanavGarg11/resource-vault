import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ entries: [] });
    }

    const { searchParams } = new URL(req.url);
    const day = searchParams.get("day");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      userId: user.id, // Only return timetable classes for the logged-in user
    };

    if (day) {
      where.dayOfWeek = day;
    }

    const entries = await db.timetableEntry.findMany({
      where,
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching timetable:", error);
    return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please sign in to modify timetable" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { dayOfWeek, subject, code, startTime, endTime, room, professor } = body;

    if (!dayOfWeek || !subject || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Day, subject, start time, and end time are required" },
        { status: 400 }
      );
    }

    const newEntry = await db.timetableEntry.create({
      data: {
        userId: user.id,
        dayOfWeek,
        subject,
        code: code || null,
        startTime,
        endTime,
        room: room || null,
        professor: professor || null,
      },
    });

    return NextResponse.json({ entry: newEntry }, { status: 201 });
  } catch (error) {
    console.error("Error creating timetable entry:", error);
    return NextResponse.json({ error: "Failed to create timetable entry" }, { status: 500 });
  }
}
