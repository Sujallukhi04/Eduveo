import { Server, Socket } from "socket.io";

// Information about active calls
interface ActiveCall {
  callId: string;
  initiatedBy: string;
  initiatorName: string;
  participants: Set<string>;
  startedAt: string;
}

// Store active calls - Map<groupId, ActiveCall>
export const activeGroupCalls = new Map<string, ActiveCall>();

export const handleCallEvents = (io: Server, socket: Socket) => {
  // Store user info when they connect
  let userId: string | null = null;
  let userName: string | null = null;

  // Check for active call in a group
  socket.on("check_active_call", ({ groupId }) => {
    try {
      console.log(`[Call] Checking for active call in group ${groupId}`);
      
      const activeCall = activeGroupCalls.get(groupId);
      if (activeCall) {
        // Convert Set to Array for JSON serialization
        socket.emit("active_call_status", {
          ...activeCall,
          participants: Array.from(activeCall.participants)
        });
        console.log(`[Call] Found active call in group ${groupId} with ${activeCall.participants.size} participants`);
      } else {
        console.log(`[Call] No active call found in group ${groupId}`);
      }
    } catch (error) {
      console.error(`[Call] Error checking for active call:`, error);
    }
  });

  // Handle starting a new call (WhatsApp style)
  socket.on("call_started", ({ groupId, callId, initiatedBy, initiatorName }) => {
    try {
      console.log(`[Call] New call started in group ${groupId} by ${initiatorName}`);
      
      // Store user info
      userId = initiatedBy;
      userName = initiatorName;
      
      // Create a new call entry
      const newCall: ActiveCall = {
        callId,
        initiatedBy,
        initiatorName,
        participants: new Set([initiatedBy]),
        startedAt: new Date().toISOString()
      };
      
      // Store the active call
      activeGroupCalls.set(groupId, newCall);
      
      // Join socket to the group room if not already joined
      if (!socket.rooms.has(groupId)) {
        socket.join(groupId);
      }
      
      // Broadcast to all users in the group
      io.to(groupId).emit("call_started", {
        ...newCall,
        participants: Array.from(newCall.participants)
      });
      
      console.log(`[Call] Call started notification sent to group ${groupId}`);
    } catch (error) {
      console.error(`[Call] Error starting call:`, error);
      socket.emit("error", "Failed to start call");
    }
  });

  // Handle user joining a call
  socket.on("call_participant_joined", ({ groupId, userId: participantId, userName: participantName, callId }) => {
    try {
      console.log(`[Call] ${participantName} joining call in group ${groupId}`);
      
      // Store user info
      userId = participantId;
      userName = participantName;
      
      // Get the active call
      const activeCall = activeGroupCalls.get(groupId);
      if (!activeCall) {
        console.warn(`[Call] No active call found in group ${groupId}`);
        socket.emit("error", "No active call found");
        return;
      }
      
      // Add user to participants
      activeCall.participants.add(participantId);
      
      // Join socket to the group room if not already joined
      if (!socket.rooms.has(groupId)) {
        socket.join(groupId);
      }
      
      // Broadcast to all users in the group
      io.to(groupId).emit("call_participant_joined", {
        userId: participantId,
        userName: participantName,
        participants: Array.from(activeCall.participants)
      });
      
      console.log(`[Call] ${participantName} joined. Current participants: ${activeCall.participants.size}`);
    } catch (error) {
      console.error(`[Call] Error joining call:`, error);
      socket.emit("error", "Failed to join call");
    }
  });

  // Handle user leaving a call
  socket.on("call_participant_left", ({ groupId, userId: participantId, userName: participantName, callId }) => {
    try {
      console.log(`[Call] ${participantName || participantId} leaving call in group ${groupId}`);
      
      // Get the active call
      const activeCall = activeGroupCalls.get(groupId);
      if (!activeCall) {
        console.warn(`[Call] No active call found in group ${groupId}`);
        return;
      }
      
      // Remove user from participants
      activeCall.participants.delete(participantId);
      
      // Broadcast to all users in the group
      io.to(groupId).emit("call_participant_left", {
        userId: participantId,
        userName: participantName,
        participants: Array.from(activeCall.participants)
      });
      
      console.log(`[Call] ${participantName || participantId} left. Remaining participants: ${activeCall.participants.size}`);
      
      // If no participants left or if initiator left, end the call
      if (activeCall.participants.size === 0 || participantId === activeCall.initiatedBy) {
        activeGroupCalls.delete(groupId);
        io.to(groupId).emit("call_ended", { 
          endedBy: participantId, 
          endedByName: participantName || 'Unknown user' 
        });
        console.log(`[Call] Call ended in group ${groupId}`);
      }
    } catch (error) {
      console.error(`[Call] Error leaving call:`, error);
    }
  });

  // Handle explicit call ending (anyone can end their own call)
  socket.on("call_ended", ({ groupId, callId, endedBy, endedByName }) => {
    try {
      console.log(`[Call] Call explicitly ended in group ${groupId} by ${endedByName || endedBy || 'unknown user'}`);
      
      // End the call
      activeGroupCalls.delete(groupId);
      
      // Broadcast to all users in the group
      io.to(groupId).emit("call_ended", { 
        endedBy, 
        endedByName: endedByName || 'Unknown user' 
      });
      
      console.log(`[Call] Call ended notification sent to group ${groupId}`);
    } catch (error) {
      console.error(`[Call] Error ending call:`, error);
    }
  });

  // Legacy handlers for backward compatibility
  socket.on("joinGroupCall", ({ groupId, userId: participantId, userName: participantName }) => {
    try {
      console.log(`[Call] Legacy joinGroupCall from ${participantName} in group ${groupId}`);
      
      // Store user info
      userId = participantId;
      userName = participantName;
      
      // Check if we have a new-style call already
      const activeCall = activeGroupCalls.get(groupId);
      if (activeCall) {
        // Add to existing call
        activeCall.participants.add(participantId);
        
        // Broadcast using new events
        io.to(groupId).emit("call_participant_joined", {
          userId: participantId,
          userName: participantName,
          participants: Array.from(activeCall.participants)
        });
        
        console.log(`[Call] Added to existing call with new system. Participants: ${activeCall.participants.size}`);
        return;
      }
      
      // Legacy call handling can remain as is...
      // The rest of your existing joinGroupCall handler
    } catch (error) {
      console.error(`[Call] Error in legacy joinGroupCall:`, error);
      socket.emit("error", "Failed to join call");
    }
  });

  // Legacy handler for leaving (keep for backward compatibility)
  socket.on("leaveGroupCall", ({ groupId, userId: participantId, userName: participantName }) => {
    try {
      console.log(`[Call] Legacy leaveGroupCall from ${participantName} in group ${groupId}`);
      
      // Check if we have a new-style call
      const activeCall = activeGroupCalls.get(groupId);
      if (activeCall) {
        // Remove from existing call
        activeCall.participants.delete(participantId);
        
        // Broadcast using new events
        io.to(groupId).emit("call_participant_left", {
          userId: participantId,
          userName: participantName,
          participants: Array.from(activeCall.participants)
        });
        
        // If call is empty or initiator left
        if (activeCall.participants.size === 0 || participantId === activeCall.initiatedBy) {
          activeGroupCalls.delete(groupId);
          io.to(groupId).emit("call_ended", { 
            endedBy: participantId, 
            endedByName: participantName || 'Unknown user' 
          });
          console.log(`[Call] Call ended in group ${groupId}`);
        }
        
        console.log(`[Call] Removed from existing call with new system. Remaining: ${activeCall.participants.size}`);
        return;
      }
      
      // Legacy call handling can remain as is...
      // The rest of your existing leaveGroupCall handler
    } catch (error) {
      console.error(`[Call] Error in legacy leaveGroupCall:`, error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    try {
      // Only process if we have userId (means they were in a call)
      if (!userId) return;
      
      console.log(`[Call] User ${userName || userId} disconnected`);
      
      // Find all calls this user is participating in
      for (const [groupId, call] of activeGroupCalls.entries()) {
        if (call.participants.has(userId)) {
          // Remove the user from the call
          call.participants.delete(userId);
          
          // Broadcast to group that user left
          io.to(groupId).emit("call_participant_left", {
            userId,
            userName: userName || 'Unknown user',
            participants: Array.from(call.participants)
          });
          
          console.log(`[Call] Removed disconnected user from call in group ${groupId}`);
          
          // If empty call or was initiator, end the call
          if (call.participants.size === 0 || userId === call.initiatedBy) {
            activeGroupCalls.delete(groupId);
            io.to(groupId).emit("call_ended", { 
              endedBy: userId, 
              endedByName: userName || 'Unknown user' 
            });
            console.log(`[Call] Call ended in group ${groupId} due to initiator disconnect`);
          }
        }
      }
    } catch (error) {
      console.error(`[Call] Error handling disconnect:`, error);
    }
  });
};