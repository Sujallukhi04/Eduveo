import { NextFunction, Request, Response } from "express";
import { db } from "../../prismaClient";
import { TokenPayload } from "types";
import z from "zod";

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

// get current user groups
export const getUserGroups = async (
  req: AuthenticatedRequest,
  res: Response<any, Record<string, any>>
): Promise<Response<any, Record<string, any>>> => {
  try {
    const user = req.user;
    // console.log("Inside getCurrentUserGroups");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Type assertion for id
    const { id } = user as TokenPayload;

    console.log("getting user groups", id);

    const groups = await db.group.findMany({
      where: {
        creatorId: id,
      },
      include: {
        sessions: true,
      },
    });

    // console.log("Groups", groups);

    return res.status(200).json({
      groups,
    });
  } catch (error) {
    console.error("Error getting user groups:", error);
    return res.status(500).json({ message: "Failed to get user groups" });
  }
};

// get current user member of Groups

export const getGroupMembers = async (
  req: AuthenticatedRequest,
  res: Response<any, Record<string, any>>
): Promise<Response<any, Record<string, any>>> => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Type assertion for id
    const { id } = user as TokenPayload;
    console.log("Inside getGroupMember", id);

    const groups = await db.group.findMany({
      where: {
        memberIds: {
          has: id,
        },
      },
      include: {
        sessions: true,
      },
    });

    // console.log("Groups", groups);

    return res.status(200).json({
      groups,
    });
  } catch (error) {
    console.error("Error getting user groups:", error);
    return res.status(500).json({ message: "Failed to get user groups" });
  }
};

// send request to join group
export const joinGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    console.log("Inside joinGroup");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Type assertion for id
    const { id } = user as TokenPayload;

    // Destructure and validate request body
    const { groupCode } = req.body as { groupCode: string };

    console.log("Joining group with code", groupCode);
    // console.log(req.body);

    if (!groupCode) {
      return res.status(400).json({ message: "Code is required" });
    }

    // Find the group with the given code
    const group = await db.group.findUnique({
      where: { code: groupCode },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is already a member of the group
    if (group.memberIds.includes(id)) {
      return res.status(400).json({ message: "Already a member of the group" });
    }

    // Add request to join group
    const request = await db.joinRequest.create({
      data: {
        userId: id,
        groupId: group.id,
      },
    });

    console.log("Request sent to join group");
    // console.log(request);

    return res.status(200).json({ message: "Request sent to join group" });
  } catch (error) {
    console.error("Error joining group:", error);
    return res.status(500).json({ message: "Failed to join group" });
  }
};

// join request to join group
export const getJoinRequests = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    console.log("Inside getJoinRequests");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Type assertion for id
    const { id } = user as TokenPayload;

    // Find the groups where the user is the creator
    const groups = await db.group.findMany({
      where: {
        creatorId: id,
      },
    });

    // Get the group ids
    const groupIds = groups.map((group) => group.id);

    // Find the join requests for the groups
    const requests = await db.joinRequest.findMany({
      where: {
        groupId: {
          in: groupIds,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // console.log("Join requests", requests);

    return res.status(200).json({ requests });
  } catch (error) {
    console.error("Error getting join requests:", error);
    return res.status(500).json({ message: "Failed to get join requests" });
  }
};

//accept join request
export const acceptJoinRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    console.log("Inside acceptJoinRequest");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Type assertion for id
    const { id } = user as TokenPayload;

    // Destructure and validate request body
    const { requestId } = req.body as { requestId: string };

    console.log("Accepting join request with id", requestId);
    // console.log(req.body);

    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    // Find the join request with the given ID
    const request = await db.joinRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Check if the user is the creator of the group
    const group = await db.group.findUnique({
      where: { id: request.groupId },
    });

    if (group?.creatorId !== id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to accept request" });
    }

    // Add the user to the group
    await db.group.update({
      where: { id: request.groupId },
      data: {
        memberIds: {
          push: request.userId,
        },
      },
    });

    // Delete the join request
    await db.joinRequest.delete({
      where: { id: requestId },
    });

    console.log("Join request accepted");
    // console.log(request);

    return res.status(200).json({ message: "Join request accepted" });
  } catch (error) {
    console.error("Error accepting join request:", error);
    return res.status(500).json({ message: "Failed to accept join request" });
  }
};

// Reject join request
export const rejectJoinRequest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    console.log("Inside rejectJoinRequest");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Type assertion for id
    const { id } = user as TokenPayload;

    // Destructure and validate request body
    const { requestId } = req.body as { requestId: string };

    if (!requestId) {
      return res.status(400).json({ message: "Request ID is required" });
    }

    // Find the join request with the given ID
    const request = await db.joinRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Check if the user is the creator of the group
    const group = await db.group.findUnique({
      where: { id: request.groupId },
    });

    if (group?.creatorId !== id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to reject request" });
    }

    // Delete the join request
    await db.joinRequest.delete({
      where: { id: requestId },
    });

    console.log("Join request rejected");
    // console.log(request);

    return res.status(200).json({ message: "Join request rejected" });
  } catch (error) {
    console.error("Error rejecting join request:", error);
    return res.status(500).json({ message: "Failed to reject join request" });
  }
};

export const createGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    console.log("Inside createGroup");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Type assertion for id
    const { id } = user as TokenPayload;

    // Destructure and validate request body
    const { name, description, subject } = req.body as CreateGroupPayload;

    if (!name || !subject) {
      return res.status(400).json({
        message: "Name and subject are required",
      });
    }

    const code = await generateUniqueCode();
    console.log(code);

    // Create the group in database
    const newGroup = await db.group.create({
      data: {
        name,
        description: description || "", // Provide default value if description is undefined
        code,
        creatorId: id,
        subject: subject,
        memberIds: [id],
      },
    });

    console.log("Group created successfully");
    // console.log(newGroup);

    return res.status(201).json({
      message: "Group created successfully",
      group: newGroup,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    return res.status(500).json({
      message: "Failed to create group",
    });
  }
};

// Helper function to generate unique code
async function generateUniqueCode(length: number = 6): Promise<string> {
  const characters: string =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code: string;

  while (true) {
    code = Array.from(
      { length },
      () => characters[Math.floor(Math.random() * characters.length)]
    ).join("");

    // Check if the code already exists in the database
    const existingGroup = await db.group.findUnique({
      where: { code },
    });

    if (!existingGroup) {
      return code;
    }
  }
}

// get group by id
export const getGroupById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    console.log("Inside getGroupById");
    console.log(user);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Type assertion for id
    const { id } = user as TokenPayload;

    // Destructure and validate request body
    const { groupId } = req.body as { groupId: string };
    console.log("Group ID", groupId);

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    // Find the group with the given ID
    const group = await db.group.findUnique({
      where: { id: groupId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        messages: true,
        sessions: true,
      },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // console.log("Group found", group);

    // //format data
    // const formattedGroup = {
    //   id: group.id,
    //   name: group.name,
    //   code: group.code,
    //   description: group.description,
    //   subject: group.subject,
    //   creator: {
    //     id: group.creator.id,
    //     name: group.creator.name,
    //     email: group.creator.email,
    //     avatarUrl: group.creator.avatarUrl,
    //   },
    //   memberIds: group.memberIds,
    // };

    return res.status(200).json({ group });
  } catch (error) {
    console.error("Error getting group by ID:", error);
    return res.status(500).json({ message: "Failed to get group by ID" });
  }
};

// leave group
export const leaveGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    console.log("Inside leaveGroup");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Type assertion for id
    const { id } = user as TokenPayload;

    // Destructure and validate request body
    const { groupId } = req.body as { groupId: string };

    console.log("Leaving group with id", groupId);

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    // Find the group with the given ID
    const group = await db.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is a member of the group
    if (!group.memberIds.includes(id)) {
      return res.status(400).json({ message: "Not a member of the group" });
    }

    // Remove the user from the group
    await db.group.update({
      where: { id: groupId },
      data: {
        memberIds: {
          set: group.memberIds.filter((memberId) => memberId !== id),
        },
      },
    });

    return res.status(200).json({ message: "Left the group successfully" });
  } catch (error) {
    console.error("Error leaving group:", error);
    return res.status(500).json({ message: "Failed to leave group" });
  }
};

// delete group
export const deleteGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    console.log("Inside deleteGroup");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Type assertion for id
    const { id } = user as TokenPayload;

    // Destructure and validate request body
    const { groupId } = req.body as { groupId: string };

    console.log("Deleting group with id", groupId);

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    // Find the group with the given ID
    const group = await db.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is the creator of the group
    if (group.creatorId !== id) {
      return res.status(403).json({ message: "Unauthorized to delete group" });
    }

    // Delete the group
    await db.group.delete({
      where: { id: groupId },
    });

    return res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    return res.status(500).json({ message: "Failed to delete group" });
  }
};

// get group messages
export const getGroupMessages = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    console.log("Inside getGroupMessages");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = user as TokenPayload;
    const { groupId } = req.params as { groupId: string };

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    const group = await db.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.memberIds.includes(id)) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const messages = await db.message.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedMessages = messages.map((msg) => ({
      id: msg.id,
      type: "message",
      content: msg.content,
      userId: msg.userId,
      groupId: msg.groupId,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      user: {
        name: msg.user.name,
        avatar: msg.user.avatarUrl,
      },
    }));

    return res.status(200).json({ messages: transformedMessages });
  } catch (error) {
    console.error("Error getting group messages:", error);
    return res.status(500).json({ message: "Failed to get group messages" });
  }
};

export const getGroupFiles = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    console.log("Inside getGroupFiles");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = user as TokenPayload;
    const { groupId } = req.params as { groupId: string };

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    const group = await db.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.memberIds.includes(id)) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const files = await db.file.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedFiles = files.map((file) => ({
      id: file.id,
      type: "file",
      name: file.name,
      url: file.url,
      fileType: file.fileType,
      size: file.size,
      caption: file.caption,
      previewUrl: file.previewUrl,
      thumbnailUrl: file.thumbnailUrl,
      metadata: file.metadata,
      userId: file.userId,
      groupId: file.groupId,
      createdAt: file.createdAt,
      updatedAt: file.createdAt,
      user: {
        name: file.user.name,
        avatar: file.user.avatarUrl,
      },
    }));

    return res.status(200).json({ files: transformedFiles });
  } catch (error) {
    console.error("Error getting group files:", error);
    return res.status(500).json({ message: "Failed to get group files" });
  }
};

// Validation schemas
const createBoardSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(60, "Title cannot exceed 60 characters"),
});

const updateBoardSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(60, "Title cannot exceed 60 characters"),
});

// Helper function to check group membership
async function checkGroupMembership(userId: string, groupId: string) {
  const group = await db.group.findUnique({
    where: { id: groupId },
    select: { memberIds: true },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  if (!group.memberIds.includes(userId)) {
    throw new Error("Not a member of this group");
  }

  return group;
}

// Get all boards in a group
export const getBoards = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { groupId } = req.params;
    await checkGroupMembership(user.id, groupId);

    const boards = await db.board.findMany({
      where: { groupId },
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
        favorites: {
          where: { userId: user.id },
          select: { id: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formattedBoards = boards.map((board) => ({
      id: board.id,
      title: board.title,
      authorId: board.authorId,
      authorName: board.author.name,
      imageurl: board.imageUrl,
      groupId: board.groupId,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      isFavorite: board.favorites.length > 0,
    }));

    return res.status(200).json(formattedBoards);
  } catch (error) {
    console.error("Error getting boards:", error);
    return res.status(500).json({ message: "Failed to get boards" });
  }
};

// Get user's favorite boards in a group
export const getFavoriteBoards = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { groupId } = req.params;
    await checkGroupMembership(user.id, groupId);

    const favorites = await db.board.findMany({
      where: {
        groupId,
        favorites: {
          some: { userId: user.id },
        },
      },
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return res
      .status(200)
      .json(favorites.map((board) => ({ ...board, isFavorited: true })));
  } catch (error) {
    console.error("Error getting favorite boards:", error);
    return res.status(500).json({ message: "Failed to get favorite boards" });
  }
};

// Get a specific board by ID
export const getBoardById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { groupId, id: boardId } = req.params;
    await checkGroupMembership(user.id, groupId);

    const board = await db.board.findUnique({
      where: {
        id: boardId,
        groupId,
      },
    });

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    return res.status(200).json(board);
  } catch (error) {
    console.error("Error getting board:", error);
    return res.status(500).json({ message: "Failed to get board" });
  }
};

// Create a new board
export const createBoard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { groupId } = req.params;
    await checkGroupMembership(user.id, groupId);

    const validatedData = createBoardSchema.parse(req.body);
    const randomImage = `/boards/board-${
      Math.floor(Math.random() * 18) + 1
    }.svg`;

    const board = await db.board.create({
      data: {
        title: validatedData.title.trim(),
        groupId,
        authorId: user.id,
        authorName: user.name,
        imageUrl: randomImage,
      },
      include: {
        author: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return res.status(201).json({ ...board, isFavorited: false });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Error creating board:", error);
    return res.status(500).json({ message: "Failed to create board" });
  }
};

// Update a board
export const updateBoard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { groupId, id } = req.params;
    const { title } = req.body;

    // @ts-ignore
    const userId = req.user.id;

    // Validate input
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Check if the board exists and belongs to the group and user
    const existingBoard = await db.board.findFirst({
      where: {
        id,
        groupId,
        authorId: userId,
      },
    });

    if (!existingBoard) {
      return res
        .status(404)
        .json({
          message: "Board not found or you do not have permission to update",
        });
    }

    // Update the board
    const updatedBoard = await db.board.update({
      where: { id },
      data: {
        title,
        updatedAt: new Date(),
      },
    });

    return res.json(updatedBoard);
  } catch (error) {
    console.error("Error updating board:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a board
export const deleteBoard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { groupId, id } = req.params;

    // @ts-ignore
    const userId = req.user.id;

    // Check if the board exists and belongs to the group and user
    const existingBoard = await db.board.findFirst({
      where: {
        id,
        groupId,
        authorId: userId,
      },
    });

    if (!existingBoard) {
      return res
        .status(404)
        .json({
          message: "Board not found or you do not have permission to delete",
        });
    }

    // Delete associated UserFavorites first to maintain referential integrity
    await db.userFavorite.deleteMany({
      where: { boardId: id },
    });

    // Delete the board
    const deletedBoard = await db.board.delete({
      where: { id },
    });

    return res.json({
      message: "Board deleted successfully",
      deletedBoard,
    });
  } catch (error) {
    console.error("Error deleting board:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Toggle board favorite status
export const favoriteBoard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { groupId, id: boardId } = req.params;

    const board = await db.board.findUnique({
      where: {
        id: boardId,
        groupId,
      },
    });

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    await db.userFavorite.create({
      data: {
        userId: user.id,
        boardId,
        groupId,
      },
    });

    console.log("Hello board favaorted");

    return res.status(200).json({ message: "Board favorited successfully" });
  } catch (error) {
    console.error("Error favoriting board:", error);
    if ((error as any).code === "P2002") {
      return res.status(400).json({ message: "Board already favorited" });
    }
    return res.status(500).json({ message: "Failed to favorite board" });
  }

  // console.log("Favorite board");
  // return res.status(200).json({ message: "Board favorited successfully" });
};

// Remove board from favorites
export const unfavoriteBoard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { groupId, id: boardId } = req.params;

    const favorite = await db.userFavorite.findFirst({
      where: {
        userId: user.id,
        boardId,
        groupId,
      },
    });

    if (!favorite) {
      return res.status(404).json({ message: "Board not found in favorites" });
    }

    const result = await db.userFavorite.deleteMany({
      where: {
        userId: user.id,
        boardId,
        groupId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({ message: "Board not found in favorites" });
    }

    return res.status(200).json({ message: "Board removed from favorites" });
  } catch (error) {
    console.error("Error unfavoriting board:", error);
    return res
      .status(500)
      .json({ message: "Failed to remove board from favorites" });
  }
  // console.log("UnFavorite board");
  // return res.status(200).json({ message: "Board unfavorited successfully" });
};
