import { StreamVideoClient, Call } from '@stream-io/video-react-sdk';
import axios from 'axios';

const API_KEY = import.meta.env.VITE_GETSTREAM_API_KEY as string;

// Client cache and token management
let clientCache: { [userId: string]: StreamVideoClient } = {};
const tokenState: { [userId: string]: { token: string; expiresAt: number; lastRefresh: number } } = {};

// Define the API response type
interface TokenApiResponse {
  token: string;
  expiresAt?: number;
}

// Define the token response type for internal use
interface TokenResponse {
  token: string;
  expiresAt: number;
}

/**
 * Initialize or retrieve a cached Stream client for audio calls
 */
export const initializeVideoClient = async (user: any, forceNew = false): Promise<StreamVideoClient> => {
  if (!user) throw new Error('User not found');
  if (!API_KEY) throw new Error('Stream API key not configured');

  // Return cached client if available and not forcing a new one
  if (!forceNew && clientCache[user.id]) {
    console.log('Using cached Stream client for user:', user.id);
    return clientCache[user.id];
  }

  try {
    console.log('Initializing new Stream client for user:', user.id);
    const tokenResponse = await getTokenWithRetry(user);
    const { token } = tokenResponse;

    if (!token) throw new Error('No token received from server');

    // Store token details
    tokenState[user.id] = {
      token,
      expiresAt: tokenResponse.expiresAt || Date.now() + 24 * 60 * 60 * 1000,
      lastRefresh: Date.now()
    };

    // If there's an existing client, disconnect it first
    if (clientCache[user.id]) {
      try {
        await clientCache[user.id].disconnectUser();
      } catch (err) {
        console.error('Error disconnecting existing client:', err);
      }
    }

    // Create client with appropriate options
    const client = new StreamVideoClient({
      apiKey: API_KEY,
      token,
      tokenProvider: async () => {
        const response = await getTokenWithRetry(user);
        return response.token;
      },
      user: {
        id: user.id,
        name: user.name || 'User',
        image: user.picture || 'https://example.com/avatar.png',
      },
      options: {
        logLevel: 'debug', // Set to 'info' in production
      }
    });

    // Connection with timeout and better error reporting
    try {
      console.log('Attempting to connect user:', user.id);
      
      await Promise.race([
        client.connectUser({
          id: user.id,
          name: user.name || 'User',
          image: user.picture || 'https://example.com/avatar.png',
        }, token),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 15000)
        )
      ]);
      
      console.log('Client connected successfully');
      clientCache[user.id] = client;
      return client;
    } catch (error) {
      console.error('Error connecting client:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      console.log('Connection error details:', errorMessage);
      throw new Error(`Failed to connect: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Client initialization failed:', error);
    throw error;
  }
};

/**
 * Get or create an audio call instance
 */
export const getOrCreateCall = async (client: StreamVideoClient, callId: string, user: any): Promise<Call> => {
  try {
    console.log('Getting or creating audio call:', callId);
    
    // Create or get the call with default call type (changed from audio_room)
    // This is a critical change - using 'default' type instead of 'audio_room'
    const call = client.call('development', callId);
    
    // Check if the call already exists
    try {
      await call.getOrCreate({
        data: {
          members: [{ user_id: user.id, role: 'user' }], // Use call_member role
          custom: {
            room_type: 'audio',
            should_ring: false,
            creator_id: user.id,
            start_call_audio: true, // Explicitly start with audio
            audio_only: true, // Specify audio-only call
            auto_enable_audio: true, // Enable audio automatically
          }
        }
      });
      console.log('Audio call created or retrieved successfully');
      
      // Add more detailed logging for debugging
      console.log('Call object:', call);
      console.log('Call type:', call.type);
      console.log('Call state:', call.state);
      
    } catch (createError) {
      console.error('Error creating/getting audio call:', createError);
      throw createError;
    }

    return call;
  } catch (error) {
    console.error('Audio call creation failed:', error);
    throw new Error(`Failed to create audio call: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Set up audio call event listeners
 */
export const setupCallEventListeners = (call: Call) => {
  // Original event listeners
  call.on('participantJoined', (event) => 
    console.log('Participant joined:', event.participant)
  );
  call.on('participantLeft', (event) => 
    console.log('Participant left:', event.participant)
  );
  call.on('call.updated', () => 
    console.log('Call updated')
  );
  
  // Add more detailed event listeners for debugging audio issues
  call.on('call.accepted', () => console.log('Call accepted'));
  call.on('call.rejected', () => console.log('Call rejected'));
  
  // Track errors
  call.on('error', (event) => console.error('Call error:', event));
};

/**
 * Get token with retry logic
 */
const getTokenWithRetry = async (user: any, maxRetries = 5): Promise<TokenResponse> => {
  let retries = 0;
  const attempt = async (): Promise<TokenResponse> => {
    try {
      const response = await axios.post<TokenApiResponse>(
        `${import.meta.env.VITE_API_URL}/api/call/get-token`,
        { userId: user.id },
        { withCredentials: true, timeout: 15000 }
      );

      return {
        token: response.data.token,
        expiresAt: response.data.expiresAt || Date.now() + 24 * 60 * 60 * 1000
      };
    } catch (error) {
      if (retries++ < maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.min(1000 * 2 ** retries, 10000))
        );
        return attempt();
      }
      throw error;
    }
  };
  return attempt();
};

/**
 * Safely disconnect a client
 */
export const disconnectClient = async (userId: string) => {
  console.log(`Attempting to disconnect client for user: ${userId}`);
  if (clientCache[userId]) {
    try {
      await clientCache[userId].disconnectUser();
      console.log(`Successfully disconnected client for user: ${userId}`);
      delete clientCache[userId];
      delete tokenState[userId];
    } catch (error) {
      console.error('Error disconnecting client:', error);
    }
  } else {
    console.log(`No client found to disconnect for user: ${userId}`);
  }
};

/**
 * Clear all cached clients
 */
export const clearAllClients = async () => {
  console.log('Clearing all clients');
  for (const userId in clientCache) {
    await disconnectClient(userId);
  }
  clientCache = {};
};