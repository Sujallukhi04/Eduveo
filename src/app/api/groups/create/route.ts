import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {db} from "@/lib/db";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";

export const runtime = 'nodejs';

const createGroupSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { name, subject } = createGroupSchema.parse(body);

    // Create the new group and connect the creator in one transaction
    const newGroup = await db.group.create({
      data: {
        name,
        subject,
        code: nanoid(8), // Unique 8-character code
        creator: {
          connect: { id: userId },
        },
        // Add the creator to the members list
        members: {
          connect: { id: userId },
        },
      },
    });

    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("[CREATE GROUP ERROR]", error);
    return NextResponse.json({ message: "Failed to create group" }, { status: 500 });
  }
}