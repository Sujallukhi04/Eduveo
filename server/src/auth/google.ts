import { OAuth2Client } from "google-auth-library";

export const setupGoogleAuth = () => {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error("Missing required environment variables for Google OAuth");
  }

  return new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
};