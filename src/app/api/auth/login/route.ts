import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPin, generateAdminSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin } = body;

    if (!pin || !verifyAdminPin(pin)) {
      return NextResponse.json(
        { error: "Incorrect Admin PIN. Please try again." },
        { status: 401 }
      );
    }

    const token = generateAdminSessionToken();
    const response = NextResponse.json({
      success: true,
      message: "Admin mode unlocked successfully.",
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
