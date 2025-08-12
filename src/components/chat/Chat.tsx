'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Realtime } from 'ably';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string | null;
  image?: string | null; 
}
interface Message {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    avatarUrl?: string | null;
  };
}
interface ChatProps {
  initialMessages: Message[];
  groupId: string;
  currentUser: User;
}

export default function Chat({ initialMessages, groupId, currentUser }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Set up Ably connection
  useEffect(() => {
    const client = new Realtime({ authUrl: '/api/ably-token' });
    const channel = client.channels.get(`group:${groupId}`);

    const onMessage = (message: any) => {
      setMessages((prev) => [...prev, message.data]);
    };

    channel.subscribe('new-message', onMessage);

    return () => {
      channel.unsubscribe('new-message', onMessage);
      client.close();
    };
  }, [groupId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage, groupId }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${message.user.id === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex flex-col space-y-1 text-base max-w-xs mx-2 ${
                message.user.id === currentUser.id ? 'order-1 items-end' : 'order-2 items-start'
            }`}>
              <div>
                <span className={`px-4 py-2 rounded-lg inline-block ${
                    message.user.id === currentUser.id ? 'rounded-br-none bg-blue-600 text-white' : 'rounded-bl-none bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  {message.content}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {message.user.name} - {format(new Date(message.createdAt), 'p')}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            autoComplete="off"
          />
          <Button type="submit">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}