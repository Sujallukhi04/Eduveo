import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  autoConnect: true,
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
}); 