// backend/utils/jwt.ts
import jwt from "jsonwebtoken";
import { GoogleUserPayload } from "../types";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

export const generateToken = (user: GoogleUserPayload): string => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
};
