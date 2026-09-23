import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRequestAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventType = searchParams.get("type");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (eventType) {
      where.eventType = eventType;
    }

    const events = await db.academicEvent.findMany({
      where,
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching academic events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkRequestAdmin(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Admin PIN required to create calendar events" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { title, eventType, startDate, endDate, description } = body;

    if (!title || !eventType || !startDate) {
      return NextResponse.json(
        { error: "Title, event type, and start date are required" },
        { status: 400 }
      );
    }

    const event = await db.academicEvent.create({
      data: {
        title,
        eventType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description: description || null,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Error creating academic event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
