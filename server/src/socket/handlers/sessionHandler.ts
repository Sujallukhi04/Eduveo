import { Server, Socket } from "socket.io";
import { db } from "../../prismaClient";
import { activeGroupCalls } from "./callHandler";

// Define types for better type safety
interface SessionParticipant {
  socketId: string;
  userId: string;
  userName: string;
  joinedAt: number;
}

interface SessionData {
  id: string;
  name: string;
  description?: string | null;
  isStarted: boolean;
  startedAt?: Date | string | null;
  endedAt?: Date | string | null;
  groupId: string;
  creatorID: string;
  time?: Date; // Using time instead of scheduledFor based on schema
  createdAt?: Date;
  participants?: SessionParticipant[];
}

// Add storage for session participants
// Map<sessionId, Map<socketId, userInfo>>
export const sessionParticipants = new Map<string, Map<string, SessionParticipant>>();

// Simple in-memory storage for sessions
class SessionStoreService {
  private sessions = new Map<string, SessionData>();
  private participants = new Map<string, Map<string, SessionParticipant>>();

  findById(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  updateSession(sessionId: string, data: Partial<SessionData>): SessionData | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    const updatedSession = { ...session, ...data };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  addParticipant(sessionId: string, participant: SessionParticipant): SessionParticipant[] {
    if (!this.participants.has(sessionId)) {
      this.participants.set(sessionId, new Map<string, SessionParticipant>());
    }
    this.participants.get(sessionId)?.set(participant.socketId, participant);
    return this.getSessionParticipants(sessionId);
  }

  removeParticipant(sessionId: string, userId: string): SessionParticipant[] {
    if (!this.participants.has(sessionId)) return [];
    
    // Find the socket ID for this user ID
    const participants = this.participants.get(sessionId);
    if (participants) {
      for (const [socketId, participant] of participants.entries()) {
        if (participant.userId === userId) {
          participants.delete(socketId);
          break;
        }
      }
    }
    
    return this.getSessionParticipants(sessionId);
  }

  getSessionParticipants(sessionId: string): SessionParticipant[] {
    if (!this.participants.has(sessionId)) return [];
    
    const participantsMap = this.participants.get(sessionId);
    return participantsMap ? Array.from(participantsMap.values()) : [];
  }

  clearParticipants(sessionId: string): void {
    this.participants.delete(sessionId);
  }

  async createSession(sessionData: SessionData): Promise<SessionData> {
    try {
      // Store a copy in memory for quick access
      this.sessions.set(sessionData.id, sessionData);
      return sessionData;
    } catch (error) {
      console.error("Error creating session in memory:", error);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<{ success: boolean }> {
    this.sessions.delete(sessionId);
    this.participants.delete(sessionId);
    return { success: true };
  }

  getAllSessions(): SessionData[] {
    return Array.from(this.sessions.values());
  }
}

// Create a singleton instance
export const SessionStore = new SessionStoreService();

export const handleSessionEvents = (io: Server, socket: Socket) => {
  // Add these socket events inside the connection handler
  socket.on("startSession", async ({ sessionId }) => {
    try {
      const session = await db.session.update({
        where: { id: sessionId },
        data: {
          isStarted: true,
          startedAt: new Date(),
        },
        include: {
          group: true
        }
      });

      // Store session in memory for quick access
      SessionStore.createSession(session as SessionData);

      // Notify all participants in the session
      io.to(sessionId).emit("sessionStarted", {
        sessionId,
        startedAt: session.startedAt,
      });
      
      // Voice call integration happens in the client now
      console.log(`[Session] Session ${sessionId} started with integrated voice call`);
    } catch (error) {
      console.error("Error starting session:", error);
      socket.emit("error", "Failed to start session");
    }
  });

  // Session-related socket events -> sessionId, userId, userName
  socket.on("joinSession", ({ sessionId, userId, userName }) => {
    socket.join(sessionId);

    // Initialize session participants if not exists
    if (!sessionParticipants.has(sessionId)) {
      sessionParticipants.set(sessionId, new Map<string, SessionParticipant>());
    }

    // Store participant information
    const participantData: SessionParticipant = {
      socketId: socket.id,
      userId,
      userName,
      joinedAt: Date.now(),
    };
    
    sessionParticipants.get(sessionId)?.set(socket.id, participantData);

    // Get all current participants in the session
    const participants = Array.from(
      sessionParticipants.get(sessionId)?.entries() || []
    ).map(([socketId, data]) => ({
      socketId,
      userId: data.userId,
      userName: data.userName,
      joinedAt: data.joinedAt,
    }));
    
    // Send existing participants to the new joiner
    socket.emit("sessionParticipants", participants);

    // Notify others about the new participant
    socket.to(sessionId).emit("userJoinedSession", {
      socketId: socket.id,
      userId,
      userName,
      joinedAt: Date.now(),
    });

    console.log(`User ${userName} (${socket.id}) joined session ${sessionId}`);
  });

  // Handle user leaving a session -> sessionId
  socket.on("leaveSession", ({ sessionId }) => {
    if (sessionParticipants.has(sessionId)) {
      const participant = sessionParticipants.get(sessionId)?.get(socket.id);
      sessionParticipants.get(sessionId)?.delete(socket.id);

      // Notify others that user left the session
      socket.to(sessionId).emit("userLeftSession", {
        socketId: socket.id,
        userId: participant?.userId,
        userName: participant?.userName,
      });
    }
    socket.leave(sessionId);
  });

  // endSession event handler
  socket.on("endSession", async ({ sessionId }) => {
    try {
      const session = await db.session.update({
        where: { id: sessionId },
        data: {
          endedAt: new Date(),
        },
        include: {
          group: true  // Include the group to get groupId
        }
      });
      
      // Update in-memory session
      SessionStore.updateSession(sessionId, { endedAt: new Date().toISOString() });
      
      // Notify all participants in the session
      io.to(sessionId).emit("sessionEnded", {
        sessionId,
        endedAt: session.endedAt,
      });

      // Clean up session participants
      sessionParticipants.delete(sessionId);
      
      // The voice call cleanup happens in the client now
      console.log(`[Session] Session ${sessionId} ended with integrated voice call cleanup`);
    } catch (error) {
      console.error("Error ending session:", error);
      socket.emit("error", "Failed to end session");
    }
  });
};

// Handle starting a session
const startSession = (io: Server, socket: Socket, data: any) => {
  try {
    const { sessionId } = data;
    const userId = socket.data.userId;
    const userName = socket.data.userName;

    // Find the session in the database
    const session = SessionStore.findById(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    // Update the session status
    const updatedSession = SessionStore.updateSession(sessionId, {
      isStarted: true,
      startedAt: new Date().toISOString()
    });

    // Join the session room
    socket.join(`session:${sessionId}`);

    // Add user to the session participants
    SessionStore.addParticipant(sessionId, {
      socketId: socket.id,
      userId,
      userName,
      joinedAt: Date.now()
    });

    // Emit session-started event to the group
    io.to(`group:${session.groupId}`).emit('session-started', updatedSession);

    // Log the action
    console.log(`User ${userName} (${userId}) started session ${sessionId}`);

  } catch (error) {
    console.error('Error starting session:', error);
    socket.emit('error', { message: 'Failed to start session' });
  }
};

// Handle ending a session
const endSession = (io: Server, socket: Socket, data: any) => {
  try {
    const { sessionId } = data;
    const userId = socket.data.userId;
    const userName = socket.data.userName;

    // Find the session in the database
    const session = SessionStore.findById(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    // Verify this user is the creator of the session
    if (session.creatorID !== userId) {
      socket.emit('error', { message: 'Only the creator can end the session' });
      return;
    }

    // Update the session status
    const endedAt = new Date().toISOString();
    const updatedSession = SessionStore.updateSession(sessionId, {
      isStarted: false,
      endedAt
    });

    // Get all participants to notify them
    const participants = SessionStore.getSessionParticipants(sessionId);

    // Emit session-ended event to all participants
    io.to(`session:${sessionId}`).emit('session-ended', {
      ...updatedSession,
      endedBy: userId,
      endedByName: userName
    });
    
    // Also emit session-ended to the group for real-time updates
    io.to(`group:${session.groupId}`).emit('session-ended', {
      ...updatedSession,
      endedBy: userId,
      endedByName: userName
    });

    // Also end the associated voice call for this session
    const callId = `session-${session.groupId}`;
    io.to(`group:${session.groupId}`).emit('call_ended', {
      groupId: session.groupId,
      callId,
      endedBy: userId,
      endedByName: userName
    });
    
    // Clear participants and the session room
    participants.forEach((participant: SessionParticipant) => {
      const participantSocket = io.sockets.sockets.get(participant.socketId);
      if (participantSocket) {
        participantSocket.leave(`session:${sessionId}`);
      }
    });
    SessionStore.clearParticipants(sessionId);

    // Log the action
    console.log(`User ${userName} (${userId}) ended session ${sessionId}`);
    console.log(`Associated call ${callId} also ended`);

  } catch (error) {
    console.error('Error ending session:', error);
    socket.emit('error', { message: 'Failed to end session' });
  }
};

// Handle joining a session
const joinSession = (io: Server, socket: Socket, data: any) => {
  try {
    const { sessionId, userId, userName } = data;

    // Find the session in the database
    const session = SessionStore.findById(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    // Check if the session is started and not ended
    if (!session.isStarted || session.endedAt) {
      socket.emit('error', { message: 'Cannot join a session that is not active' });
      return;
    }

    // Join the session room
    socket.join(`session:${sessionId}`);

    // Add the participant to the session
    const newParticipant: SessionParticipant = {
      socketId: socket.id,
      userId,
      userName,
      joinedAt: Date.now()
    };
    SessionStore.addParticipant(sessionId, newParticipant);

    // Get updated participant list
    const participants = SessionStore.getSessionParticipants(sessionId);

    // Emit participant-joined event to all participants
    io.to(`session:${sessionId}`).emit('participant-joined', {
      sessionId,
      participant: newParticipant,
      participants
    });

    // Log the action
    console.log(`User ${userName} (${userId}) joined session ${sessionId}`);

  } catch (error) {
    console.error('Error joining session:', error);
    socket.emit('error', { message: 'Failed to join session' });
  }
};

// Handle leaving a session
const leaveSession = (io: Server, socket: Socket, data: any) => {
  try {
    const { sessionId } = data;
    const userId = socket.data.userId;
    const userName = socket.data.userName;

    // Find the session
    const session = SessionStore.findById(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    // If this user is the creator and the session is active, don't allow leaving
    if (session.creatorID === userId && session.isStarted && !session.endedAt) {
      socket.emit('error', { message: 'Session creator cannot leave an active session. End the session instead.' });
      return;
    }

    // Remove participant
    SessionStore.removeParticipant(sessionId, userId);
    
    // Leave the session room
    socket.leave(`session:${sessionId}`);

    // Get updated participants list
    const participants = SessionStore.getSessionParticipants(sessionId);

    // Emit participant-left event to all participants
    io.to(`session:${sessionId}`).emit('participant-left', {
      sessionId,
      userId,
      userName,
      participants
    });

    // Log the action
    console.log(`User ${userName} (${userId}) left session ${sessionId}`);

  } catch (error) {
    console.error('Error leaving session:', error);
    socket.emit('error', { message: 'Failed to leave session' });
  }
};

// Function to create a new session
const createSession = async (io: Server, socket: Socket, data: any) => {
  try {
    const { groupId, name, time, description = null } = data;
    const userId = socket.data.userId;
    
    // Create session in database with the correct schema fields
    const session = await db.session.create({
      data: {
        name,
        description,
        time: time ? new Date(time) : new Date(), // Using time instead of scheduledFor/duration
        isStarted: false,
        creatorID: userId,
        groupId
      }
    });
    
    // Store in memory
    await SessionStore.createSession(session as SessionData);
    
    // Notify group members
    io.to(`group:${groupId}`).emit('session-created', session);
    
    // Return created session to caller
    socket.emit('session-created-success', session);
    
    console.log(`User ${userId} created session ${session.id} in group ${groupId}`);
    
    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    socket.emit('error', { message: 'Failed to create session' });
    return null;
  }
};

// Function to update a session
const updateSession = async (io: Server, socket: Socket, data: any) => {
  try {
    const { sessionId, name, time, description } = data;
    const userId = socket.data.userId;
    
    // Get session
    const existingSession = await db.session.findUnique({
      where: { id: sessionId }
    });
    
    // Check if session exists and ownership
    if (!existingSession) {
      socket.emit('error', { message: 'Session not found' });
      return null;
    }
    
    if (existingSession.creatorID !== userId) {
      socket.emit('error', { message: 'Only the creator can update the session' });
      return null;
    }
    
    // Update session with the correct schema fields
    const session = await db.session.update({
      where: { id: sessionId },
      data: {
        name: name || existingSession.name,
        description: description !== undefined ? description : existingSession.description,
        time: time ? new Date(time) : existingSession.time
      }
    });
    
    // Update in-memory copy
    SessionStore.updateSession(sessionId, session as SessionData);
    
    // Notify group members
    io.to(`group:${existingSession.groupId}`).emit('session-updated', session);
    
    // Return updated session to caller
    socket.emit('session-updated-success', session);
    
    console.log(`User ${userId} updated session ${sessionId}`);
    
    return session;
  } catch (error) {
    console.error('Error updating session:', error);
    socket.emit('error', { message: 'Failed to update session' });
    return null;
  }
};

// Function to delete a session
const deleteSession = async (io: Server, socket: Socket, data: any) => {
  try {
    const { sessionId } = data;
    const userId = socket.data.userId;
    
    // Get session
    const existingSession = await db.session.findUnique({
      where: { id: sessionId }
    });
    
    if (!existingSession) {
      socket.emit('error', { message: 'Session not found' });
      return null;
    }
    
    // Check ownership
    if (existingSession.creatorID !== userId) {
      socket.emit('error', { message: 'Only the creator can delete the session' });
      return null;
    }
    
    // Delete session
    await db.session.delete({
      where: { id: sessionId }
    });
    
    // Remove from memory
    await SessionStore.deleteSession(sessionId);
    
    // Notify group members
    io.to(`group:${existingSession.groupId}`).emit('session-deleted', { sessionId });
    
    // Return success to caller
    socket.emit('session-deleted-success', { sessionId });
    
    console.log(`User ${userId} deleted session ${sessionId}`);
    
    return { success: true, sessionId };
  } catch (error) {
    console.error('Error deleting session:', error);
    socket.emit('error', { message: 'Failed to delete session' });
    return null;
  }
};

// Function to fetch sessions for a group
const fetchSessions = async (io: Server, socket: Socket, data: any) => {
  try {
    const { groupId } = data;
    
    // Get sessions from database using correct schema fields for ordering
    const sessions = await db.session.findMany({
      where: { groupId },
      orderBy: { time: 'asc' } // Using time instead of scheduledFor
    });
    
    // Store in memory for quick access
    for (const session of sessions) {
      await SessionStore.createSession(session as SessionData);
    }
    
    // Return sessions to caller
    socket.emit('sessions-fetched', { groupId, sessions });
    
    console.log(`Fetched ${sessions.length} sessions for group ${groupId}`);
    
    return sessions;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    socket.emit('error', { message: 'Failed to fetch sessions' });
    return [];
  }
};

// Function to fetch a specific session by ID
const fetchSessionById = async (io: Server, socket: Socket, data: any) => {
  try {
    const { sessionId } = data;
    
    // Get session from database
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: {
        group: true // Include group information
      }
    });
    
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return null;
    }
    
    // Store in memory for quick access
    await SessionStore.createSession(session as SessionData);
    
    // Return session to caller
    socket.emit('session-fetched', session);
    
    console.log(`Fetched session ${sessionId}`);
    
    return session;
  } catch (error) {
    console.error('Error fetching session:', error);
    socket.emit('error', { message: 'Failed to fetch session' });
    return null;
  }
};

export const sessionHandler = {
  startSession,
  endSession,
  joinSession,
  leaveSession,
  createSession,
  updateSession,
  deleteSession,
  fetchSessions,
  fetchSessionById
};
