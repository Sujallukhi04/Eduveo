/*
======================================================================
File Location: /components/chat/ChatMessage.tsx (DEFINITIVE FIX)
Description: The logic for showing the "three dots" menu is now 100%
correct based on your requirements.
======================================================================
*/
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Trash2, Pin, MoreVertical } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Define types
interface User { id: string; name: string | null; image?: string | null; }
interface Message {
  id: string;
  content: string;
  createdAt: Date;
  user: { id: string; name: string | null; avatarUrl?: string | null; };
}
interface ChatMessageProps {
  message: Message;
  currentUser: User;
  isGroupOwner: boolean;
  onPinMessage: (messageId: string) => void;
}

export default function ChatMessage({ message, currentUser, isGroupOwner, onPinMessage }: ChatMessageProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isAuthor = message.user.id === currentUser.id;
  
  // A member can delete their own message.
  const canDelete = isAuthor;
  // Only the group owner can pin any message.
  const canPin = isGroupOwner;
  // The owner can delete ANY message.
  const ownerCanDelete = isGroupOwner;

  // DEFINITIVE FIX: The menu should only be shown if the user has at least one action they can perform on THIS message.
  // - An owner can always see the menu (to pin or delete).
  // - A member can only see the menu on their OWN message (to delete it).
  const canShowMenu = isGroupOwner || isAuthor;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/messages/${message.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete message.");
      }
      toast.success("Message deleted.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Error", { description: errorMessage });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`group relative flex items-start gap-2 py-1 ${isAuthor ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-center ${isAuthor ? 'order-1' : 'order-3'}`}>
        {canShowMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {canPin && (
                <DropdownMenuItem onClick={() => onPinMessage(message.id)}>
                  <Pin className="mr-2 h-4 w-4" />
                  <span>Pin Message</span>
                </DropdownMenuItem>
              )}
              {(canDelete || ownerCanDelete) && (
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently delete this message for everyone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className={`flex flex-col space-y-1 text-base max-w-xs mx-2 order-2 ${isAuthor ? 'items-end' : 'items-start'}`}>
        <div>
          <span className={`px-4 py-2 rounded-lg inline-block ${isAuthor ? 'rounded-br-none bg-blue-600 text-white' : 'rounded-bl-none bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
            {message.content}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {message.user.name} - {format(new Date(message.createdAt), 'p')}
        </span>
      </div>
    </div>
  );
}