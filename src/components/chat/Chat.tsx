'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Realtime } from 'ably';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Pin, X } from 'lucide-react';
import ChatMessage from './ChatMessage';

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
  initialPinnedMessage: Message | null;
  groupId: string;
  currentUser: User;
  isGroupOwner: boolean;
}

export default function Chat({ initialMessages, initialPinnedMessage, groupId, currentUser, isGroupOwner }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>(initialPinnedMessage);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const client = new Realtime({ authUrl: '/api/ably-token' });
    const channel = client.channels.get(`group:${groupId}`);

    const onNewMessage = (message: any) => setMessages((prev) => [...prev, message.data]);
    const onMessageDeleted = (message: any) => setMessages((prev) => prev.filter(m => m.id !== message.data.messageId));
    const onMessagePinned = (message: any) => setPinnedMessage(message.data.pinnedMessage);

    channel.subscribe('new-message', onNewMessage);
    channel.subscribe('message-deleted', onMessageDeleted);
    channel.subscribe('message-pinned', onMessagePinned);

    return () => {
      channel.unsubscribe();
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

  const handlePinMessage = async (messageId: string | null) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      if (!response.ok) throw new Error("Failed to update pin");
      toast.success(messageId ? "Message pinned!" : "Message unpinned!");
    } catch (error) {
      toast.error("Failed to update pin.");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Pinned Message Bar */}
      {pinnedMessage && (
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 border-b dark:border-yellow-800 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 truncate">
            <Pin className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <p className="truncate">
              <span className="font-semibold">{pinnedMessage.user.name}:</span> {pinnedMessage.content}
            </p>
          </div>
          {isGroupOwner && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handlePinMessage(null)}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            currentUser={currentUser}
            isGroupOwner={isGroupOwner}
            onPinMessage={handlePinMessage}
          />
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
