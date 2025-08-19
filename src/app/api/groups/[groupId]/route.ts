import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

// --- GET Method to fetch single group details ---
export async function GET(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = params;

    const group = await db.group.findFirst({
      where: {
        id: groupId,
        memberIds: { has: session.user.id },
      },
      include: {
        members: { select: { id: true, name: true, email: true } },
        messages: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        files: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(group, { status: 200 });
  } catch (error) {
    console.error("[GET GROUP DETAILS ERROR]", error);
    return NextResponse.json(
      { message: "Failed to fetch group details" },
      { status: 500 }
    );
  }
}

// --- PATCH Method to update group ---
const updateGroupSchema = z.object({
  name: z
    .string()
    .min(3, "Group name must be at least 3 characters")
    .optional(),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const group = await db.group.findUnique({
      where: { id: params.groupId },
    });

    if (!group || group.creatorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, subject } = updateGroupSchema.parse(body);

    const updatedGroup = await db.group.update({
      where: { id: params.groupId },
      data: { name, subject },
    });

    return NextResponse.json(updatedGroup, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("[UPDATE GROUP ERROR]", error);
    return NextResponse.json(
      { message: "Failed to update group" },
      { status: 500 }
    );
  }
}

// --- DELETE Method to delete/leave group ---
export async function DELETE(
  req: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const { groupId } = params;

    const group = await db.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    if (group.creatorId === userId) {
      await db.group.delete({
        where: { id: groupId },
      });
      return NextResponse.json(
        { message: "Group has been successfully deleted." },
        { status: 200 }
      );
    } else if (group.memberIds.includes(userId)) {
      await db.group.update({
        where: { id: groupId },
        data: {
          members: {
            disconnect: { id: userId },
          },
        },
      });
      return NextResponse.json(
        { message: "You have successfully left the group." },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
  } catch (error) {
    console.error("[DELETE/LEAVE GROUP ERROR]", error);
    return NextResponse.json({ message: "Operation failed" }, { status: 500 });
  }
}
