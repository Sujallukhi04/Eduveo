import { Server } from "socket.io";
import { handleChatEvents } from "./handlers/chatHandler";
import {
  handleCallEvents,
  activeGroupCalls,
} from "./handlers/callHandler";
import {
  handleSessionEvents,
  sessionParticipants,
} from "./handlers/sessionHandler";
import { handleFileEvents } from "./handlers/fileHandler";

export const initializeSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    // Initialize all handlers
    handleChatEvents(io, socket);
    handleCallEvents(io, socket);
    handleSessionEvents(io, socket);
    handleFileEvents(io, socket);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("user disconnected", socket.id);

      // // Clean up group calls for the disconnected socket
      // // Note: Most cleanup is now handled in the callHandler itself
      // // This is just a safety measure
      // for (const [groupId, call] of activeGroupCalls.entries()) {
      //   // We don't have a direct mapping from socket.id to userId here
      //   // So we rely on the call handler's internal disconnect handling
      //   // This is just a failsafe in case that doesn't trigger
      //   if (call.participants.size === 0) {
      //     activeGroupCalls.delete(groupId);
      //     io.to(groupId).emit("call_ended");
      //     console.log(`[Call] Empty call ended in group ${groupId} during disconnect cleanup`);
      //   }
      // }

      // Clean up sessions
      sessionParticipants.forEach((participants, sessionId) => {
        if (participants.has(socket.id)) {
          const participant = participants.get(socket.id);
          participants.delete(socket.id);
          socket.to(sessionId).emit("userLeftSession", {
            socketId: socket.id,
            userId: participant?.userId,
            userName: participant?.userName,
          });
        }
      });
    });
  });
};
