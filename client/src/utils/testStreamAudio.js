// Test script for Stream audio room functionality
import { StreamVideoClient, Call } from '@stream-io/video-react-sdk';

/**
 * Test Stream audio room connectivity
 * Run this script in the browser console to validate your setup
 */
export const testStreamAudioConnection = async (apiKey, token, userId) => {
  console.log('=== Stream Audio Connection Test ===');
  console.log('Testing with credentials:');
  console.log('API Key:', apiKey);
  console.log('User ID:', userId);
  console.log('Token:', token.substring(0, 10) + '...');

  try {
    // Step 1: Initialize client
    console.log('\n1. Creating StreamVideoClient...');
    const client = new StreamVideoClient({
      apiKey,
      token,
      user: {
        id: userId,
        name: 'Test User',
        image: 'https://example.com/avatar.png',
      },
      options: {
        logLevel: 'debug'
      }
    });

    // Step 2: Connect user
    console.log('\n2. Connecting user...');
    await client.connectUser({
      id: userId,
      name: 'Test User',
      image: 'https://example.com/avatar.png',
    }, token);
    console.log('User connected successfully!');

    // Step 3: Create a test call
    console.log('\n3. Creating test audio room call...');
    const callId = `test-audio-room-${Date.now()}`;
    const call = client.call('audio_room', callId);
    console.log('Call instance created:', call);

    // Step 4: Get or create the call
    console.log('\n4. Getting or creating call...');
    await call.getOrCreate({
      data: {
        members: [{ user_id: userId, role: 'user' }],
        custom: {
          test_call: true
        }
      }
    });
    console.log('Call created successfully!');

    // Step 5: Join the call
    console.log('\n5. Joining call...');
    await call.join({ create: true });
    console.log('Call joined successfully!');

    // Step 6: Test microphone access
    console.log('\n6. Testing microphone access...');
    try {
      await call.microphone.enable();
      console.log('Microphone enabled successfully!');
    } catch (micError) {
      console.error('Microphone access error:', micError);
    }

    // Step 7: Check active participants
    console.log('\n7. Active call participants:');
    console.log(call.state.participants);

    // Step 8: Check call capabilities
    console.log('\n8. Call capabilities:');
    console.log(call.state.ownCapabilities);

    console.log('\n=== Test Complete ===');
    console.log('Success! Your Stream audio setup is working correctly.');
    
    return {
      success: true,
      client,
      call,
      cleanup: async () => {
        try {
          await call.leave();
          await client.disconnectUser();
          console.log('Test call cleaned up successfully');
        } catch (err) {
          console.error('Error during cleanup:', err);
        }
      }
    };
  } catch (error) {
    console.error('\n=== Test Failed ===');
    console.error('Error:', error);
    return {
      success: false,
      error
    };
  }
};

// Export helper function to run the test
export const runStreamAudioTest = () => {
  // This function can be called from the browser console
  const apiKey = import.meta.env.VITE_GETSTREAM_API_KEY;
  const userId = prompt('Enter your user ID:');
  const token = prompt('Enter your Stream token:');
  
  if (!apiKey || !userId || !token) {
    console.error('Missing required parameters. Please provide API key, user ID, and token.');
    return;
  }
  
  return testStreamAudioConnection(apiKey, token, userId);
};

export default testStreamAudioConnection; 