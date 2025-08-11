import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {db} from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = 'nodejs';

const handleRequestSchema = z.object({
  requestId: z.string(),
  action: z.enum(["accept", "reject"]),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, action } = handleRequestSchema.parse(body);

    const request = await db.joinRequest.findUnique({
      where: { id: requestId },
      include: { group: true },
    });

    if (!request) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    // Security check: Only the group owner can handle requests.
    if (request.group.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (action === "accept") {
      await db.$transaction([
        db.group.update({
          where: { id: request.groupId },
          data: {
            members: {
              connect: { id: request.userId },
            },
          },
        }),
        db.joinRequest.delete({
          where: { id: requestId },
        }),
      ]);
      return NextResponse.json({ message: "User has been added to the group" }, { status: 200 });
    } else { // action === "reject"
      await db.joinRequest.delete({
        where: { id: requestId },
      });
      return NextResponse.json({ message: "Request has been rejected" }, { status: 200 });
    }
  } catch (error) {
    console.error("[HANDLE REQUEST ERROR]", error);
    return NextResponse.json({ message: "Failed to handle request" }, { status: 500 });
  }
}