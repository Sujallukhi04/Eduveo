import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {db} from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

const joinGroupSchema = z.object({
  code: z.string().min(1, "Join code is required"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await req.json();
    const { code } = joinGroupSchema.parse(body);

    const groupToJoin = await db.group.findUnique({
      where: { code },
    });

    if (!groupToJoin) {
      return NextResponse.json({ message: "Group with this code not found" }, { status: 404 });
    }

    const isAlreadyMember = groupToJoin.memberIds.includes(userId);
    if (isAlreadyMember) {
      return NextResponse.json({ message: "You are already a member of this group" }, { status: 409 });
    }

    const existingRequest = await db.joinRequest.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: groupToJoin.id,
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json({ message: "You have already sent a request to join this group" }, { status: 409 });
    }

    // Create the join request
    await db.joinRequest.create({
      data: {
        user: { connect: { id: userId } },
        group: { connect: { id: groupToJoin.id } },
      },
    });

    return NextResponse.json({ message: "Join request sent successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("[JOIN GROUP ERROR]", error);
    return NextResponse.json({ message: "Failed to send join request" }, { status: 500 });
  }
}
