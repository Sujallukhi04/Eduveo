import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {db} from "@/lib/db";
import Ably from "ably";
import { promises as fs } from "fs";
import path from "path";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // This is the correct way and replaces the 'formidable' library.
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const groupId = formData.get("groupId") as string | null;

    if (!file || !groupId) {
      return NextResponse.json({ message: "File or groupId is missing." }, { status: 400 });
    }

    // Convert the uploaded file into a Buffer, which is a format we can save.
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name}`;
    // Define the full path where the file will be saved on your server.
    const newPath = path.join(process.cwd(), "public", "uploads", fileName);

    // Write the file from memory to the filesystem in your public/uploads folder.
    await fs.writeFile(newPath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    const newFile = await db.file.create({
      data: {
        name: file.name,
        fileType: file.type,
        size: file.size,
        url: fileUrl,
        userId,
        groupId,
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    const ably = new Ably.Rest(process.env.ABLY_API_KEY!);
    const channel = ably.channels.get(`group:${groupId}`);
    await channel.publish('new-file', newFile);

    return NextResponse.json(newFile, { status: 201 });

  } catch (error) {
    console.error("[FILE UPLOAD API ERROR]", error);
    return NextResponse.json({ message: "Failed to upload file due to a server error." }, { status: 500 });
  }
}
