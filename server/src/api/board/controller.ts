import type { Request, Response } from "express";
import { db } from "../../prismaClient";
import { TokenPayload } from "types";
import { Liveblocks } from "@liveblocks/node";

interface AuthRequestBody {
  room: string;
}

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET!,
});

export async function liveblocksAuth(req: Request, res: Response): Promise<Response> {
  //console.time('total-auth-time');

  const user = req.user as TokenPayload;
  console.log("Liveblocks auth: ", { user });
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const { room } = req.body as AuthRequestBody;
  
  if (!room) {
    return res.status(400).json({ message: "Room ID is required" });
  }

  //console.time('board-query');
  const board = await db.board.findUnique({
    where: { id: room },
  });
  //console.timeEnd('board-query');
  
  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  //console.time('user-query');
  const userfind = await db.user.findUnique({ where: { id: user.id } });
  //console.timeEnd('user-query');
  
  const userInfo = {
    name: user.name || "Anonymous",
    picture: user.picture!,
  };
  
  console.log("userInfo: ", { userInfo });
  
  // Start an auth session inside your endpoint
  const session = liveblocks.prepareSession(
    user.id,
    { userInfo: userInfo }
  );


  session.allow(room, session.FULL_ACCESS);
  
  // Give the user full access to the specific room

  //console.time('liveblocks-authorize');
  const { status, body } = await session.authorize();
  //console.timeEnd('liveblocks-authorize');
 
  console.timeEnd('total-auth-time');
  //console.log({ status, body }, "ALLOWED");
  
  // Return the proper response using Express res object
  return res.status(status).end(body);
}