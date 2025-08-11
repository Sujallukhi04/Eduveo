import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {db} from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: { groupId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const { groupId } = params;

    const group = await db.group.findUnique({
      where: { id: groupId },
    });

    if (!group || group.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const requests = await db.joinRequest.findMany({
      where: { groupId: groupId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    console.error("[GET REQUESTS ERROR]", error);
    return NextResponse.json({ message: "Failed to fetch join requests" }, { status: 500 });
  }
}
