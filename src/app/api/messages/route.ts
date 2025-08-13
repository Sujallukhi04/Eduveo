import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {db} from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import Ably from "ably";

export const runtime = 'nodejs';

const sendMessageSchema = z.object({
  content: z.string().min(1),
  groupId: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, groupId } = sendMessageSchema.parse(body);
    const userId = session.user.id;
    
    const newMessage = await db.message.create({
      data: {
        content,
        userId,
        groupId,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    const ably = new Ably.Rest(process.env.ABLY_API_KEY!);
    const channel = ably.channels.get(`group:${groupId}`);
    await channel.publish('new-message', newMessage);

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("[SEND MESSAGE ERROR]", error);
    return NextResponse.json({ message: "Failed to send message" }, { status: 500 });
  }
}