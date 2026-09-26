import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export interface CurrentUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return null;
    return session.user as CurrentUser;
  } catch (error) {
    console.error("Error retrieving session:", error);
    return null;
  }
}
