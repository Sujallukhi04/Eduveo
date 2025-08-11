'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { GroupCard } from '@/components/groups/GroupCard';
import { CreateGroupDialog } from '@/components/groups/CreateGroupDialog';
import { JoinGroupDialog } from '@/components/groups/JoinGroupDialog';
import { PlusCircle, UserPlus, LogOut } from 'lucide-react';

export interface Group {
  id: string;
  name: string;
  subject: string;
  code: string;
  creatorId: string;
  _count: {
    members: number;
    joinRequests: number;
  };
}

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This function will now be used for any action that requires a refresh.
  const onGroupAction = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/groups');
      if (!response.ok) throw new Error('Failed to fetch groups');
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      toast.error("Could not refresh your groups.", { description: "Please try refreshing the page." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') onGroupAction();
  }, [status, router]);

  if (status === 'loading' || !session) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Eduveo Dashboard</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-300">
              Welcome, {session.user?.name}
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Your Groups</h2>
          <div className="flex gap-2">
            <CreateGroupDialog onGroupCreated={onGroupAction} />
            <JoinGroupDialog />
          </div>
        </div>
        
        {isLoading ? ( <p>Loading groups...</p> ) : 
         groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard 
                key={group.id} 
                group={group} 
                currentUserId={session.user.id} 
                onGroupAction={onGroupAction} // Pass the refresh function
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg bg-white dark:bg-gray-800/50">
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">No groups yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Create a new group or join one to get started!</p>
          </div>
        )}
      </main>
    </div>
  );
}