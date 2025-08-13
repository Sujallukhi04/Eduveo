import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {db} from "@/lib/db";
import { NextResponse } from "next/server";
import Ably from "ably";

export const runtime = 'nodejs';

export async function DELETE(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = params;
    const userId = session.user.id;

    const message = await db.message.findUnique({
      where: { id: messageId },
      include: { group: true },
    });

    if (!message) {
      return NextResponse.json({ message: "Message not found" }, { status: 404 });
    }

    const isGroupOwner = message.group.creatorId === userId;
    const isMessageAuthor = message.userId === userId;

    if (!isGroupOwner && !isMessageAuthor) {
      return NextResponse.json({ message: "Forbidden: You cannot delete this message." }, { status: 403 });
    }

    await db.message.delete({
      where: { id: messageId },
    });

    const ably = new Ably.Rest(process.env.ABLY_API_KEY!);
    const channel = ably.channels.get(`group:${message.groupId}`);
    await channel.publish('message-deleted', { messageId });

    return NextResponse.json({ message: "Message deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("[DELETE MESSAGE ERROR]", error);
    return NextResponse.json({ message: "Failed to delete message" }, { status: 500 });
  }
}