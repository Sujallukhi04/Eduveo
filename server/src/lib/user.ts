import { Request } from "express";
import { db } from "../prismaClient";

export async function getUserByEmail(email: string) {
  return await db.user.findUnique({ where: { email } });
}

export async function getUserById(id: string) {
  return await db.user.findUnique({ where: { id } });
}

export async function getCurrentUser(req: Request) {
  // @ts-ignore
  const userId = req.user?.id;
  if (!userId) return null;

  return await db.user.findUnique({
    where: { id: userId },
  });
}
