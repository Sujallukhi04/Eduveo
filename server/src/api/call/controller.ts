import { StreamClient } from "@stream-io/node-sdk";
import { Request, Response } from "express";
import { TokenPayload } from "types";

const apiKey = process.env.GETSTREAM_API_KEY;
const apiSecret = process.env.GETSTREAM_API_SECRET;

interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const tokenProvider = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!apiKey || !apiSecret) {
    return res.status(500).json({ message: "Missing API key or secret." });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const client = new StreamClient(apiKey, apiSecret);

    // Get current time in seconds
    const now = Math.floor(Date.now() / 1000);

    // **Backdate iat by 10 seconds** to prevent "used before issue at" errors
    const iat = now - 10;
    const expiresAt = now + 24 * 60 * 60; // Expire in 24 hours

    // Get user details from request
    const userId = req.user.id;

    console.log(`Generating Stream token for user: ${userId}`);

    // **Explicitly setting iat while generating token**
    const token = client.createToken(userId, expiresAt, iat);

    console.log(
      `Generated token for ${userId}: Expires at ${new Date(
        expiresAt * 1000
      ).toISOString()}`
    );

    res.json({
      token,
      expiresAt: expiresAt * 1000, // Convert to milliseconds for frontend
    });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ message: "Error generating token" });
  }
};
