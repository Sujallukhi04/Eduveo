import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {db} from "@/lib/db";
import { NextResponse } from "next/server";
import Ably from "ably";
import { z } from "zod";

export const runtime = 'nodejs';

const pinMessageSchema = z.object({
  messageId: z.string().nullable(), 
});

export async function POST(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = params;
    const userId = session.user.id;

    const group = await db.group.findUnique({
      where: { id: groupId },
    });

    // Security Check: Only the group owner can pin messages.
    if (!group || group.creatorId !== userId) {
      return NextResponse.json({ message: "Forbidden: Only the group owner can pin messages." }, { status: 403 });
    }

    const body = await req.json();
    const { messageId } = pinMessageSchema.parse(body);

    await db.group.update({
      where: { id: groupId },
      data: { pinnedMessageId: messageId },
    });
    
    // Fetch the full message details to broadcast to all clients
    const pinnedMessage = messageId 
      ? await db.message.findUnique({ where: { id: messageId }, include: { user: true } }) 
      : null;

    const ably = new Ably.Rest(process.env.ABLY_API_KEY!);
    const channel = ably.channels.get(`group:${groupId}`);
    await channel.publish('message-pinned', { pinnedMessage });

    return NextResponse.json({ message: "Pin updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("[PIN MESSAGE ERROR]", error);
    return NextResponse.json({ message: "Failed to pin message" }, { status: 500 });
  }
}