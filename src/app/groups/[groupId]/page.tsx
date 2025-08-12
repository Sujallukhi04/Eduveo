'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Crown, User, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Chat from '@/components/chat/Chat';

interface Member {
  id: string;
  name: string;
  email: string;
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
interface GroupDetails {
  id: string;
  name: string;
  subject: string;
  creatorId: string;
  members: Member[];
  messages: Message[];
}

export default function ViewGroupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = Array.isArray(params.groupId) ? params.groupId[0] : params.groupId;

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && groupId) {
      const fetchGroupDetails = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/groups/${groupId}`);
          if (!response.ok) throw new Error('Group not found or you do not have access.');
          const data = await response.json();
          setGroup(data);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          toast.error('Failed to load group details', { description: errorMessage });
          router.push('/groups');
        } finally {
          setIsLoading(false);
        }
      };
      fetchGroupDetails();
    }
  }, [status, groupId, router]);

  const handleDeleteOrLeave = async () => { /* ... */ };

  if (isLoading || !group || !session) {
    return <div className="flex items-center justify-center h-screen">Loading group...</div>;
  }

  const isOwner = session.user.id === group.creatorId;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-80 flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <Link href="/groups" className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Groups
          </Link>
          <h2 className="text-xl font-bold truncate">{group.name}</h2>
          <p className="text-sm text-gray-500">{group.subject}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-lg font-semibold mb-3">Members ({group.members.length})</h3>
          <ul className="space-y-3">
            {group.members.map(member => (
              <li key={member.id} className="flex items-center">
                <User className="mr-3 h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-semibold text-sm">{member.name}</p>
                  {member.id === group.creatorId && (
                    <div className="flex items-center text-xs text-yellow-500">
                      <Crown className="mr-1 h-4 w-4" />
                      <span>Owner</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t dark:border-gray-700">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                {isOwner ? 'Delete Group' : 'Leave Group'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
             {/* ... */}
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <Chat
          initialMessages={group.messages}
          groupId={group.id}
          currentUser={{
            ...session.user,
            name: session.user.name ?? null 
          }}
        />
      </main>
    </div>
  );
}
