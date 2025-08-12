import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Ably from "ably";

export async function GET() {
  // Log every step in the terminal
  console.log("[Ably Token] - Received a request for a new token.");
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error("[Ably Token] - AUTH FAILED: No user session was found.");
      return NextResponse.json({ message: "Unauthorized: User not logged in." }, { status: 401 });
    }
    console.log(`[Ably Token] - Session found for user ID: ${session.user.id}`);

    if (!process.env.ABLY_API_KEY) {
      console.error("[Ably Token] - CONFIGURATION ERROR: ABLY_API_KEY is not set in your .env file.");
      throw new Error("Ably API key is not configured on the server.");
    }

    const client = new Ably.Realtime(process.env.ABLY_API_KEY);
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: session.user.id,
    });
    
    console.log("[Ably Token] - Successfully created a token request for Ably.");
    return NextResponse.json(tokenRequestData);

  } catch (error) {
    console.error("[Ably Token] - A CRITICAL ERROR OCCURRED:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: `Server error while creating Ably token: ${errorMessage}` }, { status: 500 });
  }
}
