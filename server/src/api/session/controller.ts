import { z } from "zod";
import { db } from "../../prismaClient";
import { TokenPayload } from "types";
import { Response, Request } from "express";
// Define interface for authenticated request
interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// Define interface for group creation payload
interface CreateGroupPayload {
  name: string;
  description?: string;
  subject: string;
}

// Validation schemas
const createSessionSchema = z.object({
  name: z.string().min(1, "Session name is required").max(100),
  description: z.string().optional(),
  groupId: z.string().length(24, "Invalid group ID format").regex(/^[0-9a-fA-F]{24}$/, "Invalid group ID format"),
  preRequisites: z.string().optional(),
  time: z.string().transform((str) => new Date(str)),
});

const updateSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  name: z.string().min(1, "Session name is required").max(100),
  description: z.string().optional(),
});

// get all sessions
export const getAllSessions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    console.log("Inside getAllSessions");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const groupId = req.params.groupId;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    // Check if user is a member of the group
    const group = await db.group.findFirst({
      where: {
        id: groupId,
        memberIds: {
          has: user.id,
        },
      },
    });

    if (!group) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const sessions = await db.session.findMany({
      where: {
        groupId: groupId,
      }
    });

    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error getting sessions:", error);
    res.status(500).json({ message: "Failed to get sessions" });
  }
};

// create new session
export const createSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    console.log("Inside createSession");
    console.log("User: ", user);
    
    console.log(req.body);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Directly use req.body - no JSON.parse needed
    const validationResult = createSessionSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: validationResult.error.errors,
      });
    }

    const { name, description, groupId, preRequisites, time } =
      validationResult.data;

    // Check if user is a member of the group
    const group = await db.group.findFirst({
      where: {
        id: groupId,
        memberIds: {
          has: user.id,
        },
      },
    });

    if (!group) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }
    
    // const board = await db.board.create({
    //   data: {
    //     title: name,
    //     groupId:groupId,
    //     authorId: user.id,
    //     authorName: user.name,
    //     imageUrl: '/boards/board-' + Math.floor(Math.random() * 18) + 1 + '.svg',
    //   }
    // });

    const session = await db.session.create({
      data: {
        name,
        time,
        description,
        groupId,
        prerequisites: preRequisites,
        creatorID: user.id,
        //boardId: board.id
      },
    });

    res.status(201).json(session);
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ message: "Failed to create session" });
  }
};

// delete session
export const deleteSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sessionId = req.params.sessionId;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    // Check if user is a member of the group that owns the session
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: { group: true },
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const isMember = await db.group.findFirst({
      where: {
        id: session.groupId,
        memberIds: {
          has: user.id,
        },
      },
    });

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const deletedSession = await db.session.delete({
      where: {
        id: sessionId,
      },
    });

    res.status(200).json(deletedSession);
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ message: "Failed to delete session" });
  }
};

// update session
export const updateSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sessionId = req.params.sessionId;

    // Update the validation schema to not include sessionId since it's in the URL
    const updateBodySchema = z.object({
      name: z.string().min(1, "Session name is required").max(100),
      description: z.string().optional(),
      time: z.string().transform((str) => new Date(str)),
      prerequisites: z.string().optional().nullable(), 
    });

    const validationResult = updateBodySchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: "Invalid input data",
        errors: validationResult.error.errors,
      });
    }

    let { name, description , time ,prerequisites } = validationResult.data;

    // Check if user is a member of the group that owns the session
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: { group: true },
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const isMember = await db.group.findFirst({
      where: {
        id: session.groupId,
        memberIds: {
          has: user.id,
        },
      },
    });

    if (!isMember) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }


    if(prerequisites ==  null || prerequisites === undefined || prerequisites === "null"){
      prerequisites = "";
    }
    const updatedSession = await db.session.update({
      where: {
        id: sessionId,
      },
      data: {
        name,
        description,
        time ,
        prerequisites 
      },
    });

    res.status(200).json(updatedSession);
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({ message: "Failed to update session" });
  }
};

// Add these new controller functions

export const startSession = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    const { sessionId } = req.params;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: { group: true }
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.creatorID !== user.id) {
      return res.status(403).json({ message: "Only session creator can start the session" });
    }

    if (session.isStarted) {
      return res.status(400).json({ message: "Session already started" });
    }

    const updatedSession = await db.session.update({
      where: { id: sessionId },
      data: {
        isStarted: true,
        startedAt: new Date(),
      }
    });

    return res.status(200).json({ 
      message: "Session started successfully",
      session: updatedSession 
    });

  } catch (error) {
    console.error("Error starting session:", error);
    return res.status(500).json({ message: "Failed to start session" });
  }
};

export const endSession = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    const { sessionId } = req.params;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: { group: true }
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.creatorID !== user.id) {
      return res.status(403).json({ message: "Only session creator can end the session" });
    }

    if (!session.isStarted) {
      return res.status(400).json({ message: "Session hasn't started yet" });
    }

    if (session.endedAt) {
      return res.status(400).json({ message: "Session already ended" });
    }

    const updatedSession = await db.session.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date()
      }
    });

    return res.status(200).json({ 
      message: "Session ended successfully",
      session: updatedSession 
    });

  } catch (error) {
    console.error("Error ending session:", error);
    return res.status(500).json({ message: "Failed to end session" });
  }
};
