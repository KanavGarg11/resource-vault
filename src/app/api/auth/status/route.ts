import { NextRequest, NextResponse } from "next/server";
import { checkRequestAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const isAdmin = checkRequestAdmin(req);
  return NextResponse.json({ isAdmin });
}
