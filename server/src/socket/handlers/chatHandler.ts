import { Server, Socket } from "socket.io";
import { db } from "../../prismaClient";
import sharp from "sharp";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const handleChatEvents = (io: Server, socket: Socket) => {
  // Handle joining chat groups
  socket.on("joinGroup", (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  // Handle leaving chat groups
  socket.on("leaveGroup", (groupId) => {
    socket.leave(groupId);
    console.log(`User ${socket.id} left group ${groupId}`);
  });

  // Chat message handling
  socket.on("sendMessage", async (data) => {
    try {
      const { content, groupId, userId } = data;

      const message = await db.message.create({
        data: { content, groupId, userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Broadcast the message to all clients in the group
      io.to(groupId).emit("message", { ...message, type: "message" });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", "Message sending failed");
    }
  });
  // Typing indicators
  socket.on("typing", (data) => {
    const { groupId, userId, userName } = data;
    socket.to(groupId).emit("typing", { userId, userName });
  });

  socket.on("stopTyping", (data) => {
    const { groupId, userId } = data;
    socket.to(groupId).emit("stopTyping", { userId });
  });
};
