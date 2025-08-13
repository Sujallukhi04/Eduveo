'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Realtime } from 'ably';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Loader2, Pin, X } from 'lucide-react';
import ChatMessage from './ChatMessage';
import FileMessage from './FileMessage';

interface User { id: string; name: string | null; image?: string | null; }
interface Message { id: string; content: string; createdAt: Date; user: { id: string; name: string | null; avatarUrl?: string | null; }; }
interface FileData { id: string; name: string; url: string; fileType: string; size: number; createdAt: Date; user: { id: string; name: string | null; avatarUrl?: string | null; }; }
type ChatItem = (Message & { type: 'message' }) | (FileData & { type: 'file' });
interface ChatProps {
  initialMessages: Message[];
  initialFiles: FileData[];
  initialPinnedMessage: Message | null;
  groupId: string;
  currentUser: User;
  isGroupOwner: boolean;
}

export default function Chat({ initialMessages, initialFiles, initialPinnedMessage, groupId, currentUser, isGroupOwner }: ChatProps) {
  const [chatItems, setChatItems] = useState<ChatItem[]>(() => {
    const combined = [
      ...initialMessages.map(m => ({ ...m, type: 'message' as const })),
      ...initialFiles.map(f => ({ ...f, type: 'file' as const }))
    ];
    return combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  });

  const [pinnedMessage, setPinnedMessage] = useState<Message | null>(initialPinnedMessage);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(scrollToBottom, [chatItems]);

  useEffect(() => {
    const client = new Realtime({ authUrl: '/api/ably-token' });
    const channel = client.channels.get(`group:${groupId}`);

    const onNewMessage = (message: any) => setChatItems((prev) => [...prev, { ...message.data, type: 'message' }]);
    const onNewFile = (file: any) => setChatItems((prev) => [...prev, { ...file.data, type: 'file' }]);
    const onMessageDeleted = (message: any) => setChatItems((prev) => prev.filter(item => item.type === 'file' || item.id !== message.data.messageId));
    const onMessagePinned = (message: any) => setPinnedMessage(message.data.pinnedMessage);

    channel.subscribe('new-message', onNewMessage);
    channel.subscribe('new-file', onNewFile);
    channel.subscribe('message-deleted', onMessageDeleted);
    channel.subscribe('message-pinned', onMessagePinned);

    return () => { channel.unsubscribe(); client.close(); };
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
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadToast = toast.loading("Uploading file...", { description: file.name });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('groupId', groupId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "File upload failed.");
      }
      
      toast.success("File shared successfully!", { id: uploadToast });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("File upload failed", { id: uploadToast, description: errorMessage });
    } finally {
      setIsUploading(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
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
        {chatItems.map((item) => {
          if (item.type === 'message') {
            return <ChatMessage key={`msg-${item.id}`} message={item} currentUser={currentUser} isGroupOwner={isGroupOwner} onPinMessage={handlePinMessage} />;
          }
          if (item.type === 'file') {
            return <FileMessage key={`file-${item.id}`} file={item} currentUser={currentUser} />;
          }
          return null;
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-800 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
          </Button>
          <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." autoComplete="off" disabled={isUploading} />
          <Button type="submit" disabled={isUploading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
