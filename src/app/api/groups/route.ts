import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch the user and include all related groups
    const userWithGroups = await db.user.findUnique({
      where: { id: userId },
      include: {
        createdGroups: {
          include: {
            _count: { select: { members: true, joinRequests: true } },
          },
        },
        memberOfGroups: {
          // Groups this user is a member of
          include: {
            _count: { select: { members: true, joinRequests: true } },
          },
        },
      },
    });

    if (!userWithGroups) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Combine owned and member groups, ensuring no duplicates
    const allGroupsMap = new Map();
    userWithGroups.createdGroups.forEach((group) =>
      allGroupsMap.set(group.id, group)
    );
    userWithGroups.memberOfGroups.forEach((group) =>
      allGroupsMap.set(group.id, group)
    );

    const allGroups = Array.from(allGroupsMap.values());

    return NextResponse.json(allGroups, { status: 200 });
  } catch (error) {
    console.error("[GET GROUPS ERROR]", error);
    return NextResponse.json(
      { message: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}
