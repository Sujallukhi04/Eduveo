'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Crown, User, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Define types for clarity
interface Member {
  id: string;
  name: string;
  email: string;
}
interface GroupDetails {
  id: string;
  name: string;
  subject: string;
  creatorId: string;
  members: Member[];
}

export default function ViewGroupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

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
          if (!response.ok) {
            throw new Error('Group not found or you do not have access.');
          }
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

  const handleDeleteOrLeave = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      toast.success(data.message);
      router.push('/groups');
      router.refresh(); // Force a refresh of the dashboard page data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error('Operation failed', { description: errorMessage });
    }
  };

  if (isLoading || !group || !session) {
    return <div className="flex items-center justify-center h-screen">Loading group details...</div>;
  }

  const isOwner = session.user.id === group.creatorId;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/groups" className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{group.name}</CardTitle>
            <CardDescription className="text-lg">{group.subject}</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-xl font-semibold mb-4">Members ({group.members.length})</h3>
            <ul className="space-y-3">
              {group.members.map(member => (
                <li key={member.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                  <div className="flex items-center">
                    <User className="mr-3 h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-slate-500">{member.email}</p>
                    </div>
                  </div>
                  {member.id === group.creatorId && (
                    <div className="flex items-center text-yellow-500">
                      <Crown className="mr-2 h-5 w-5" />
                      <span className="font-semibold">Owner</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                {isOwner ? 'Delete Group' : 'Leave Group'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  {isOwner 
                    ? "This action cannot be undone. This will permanently delete the group and all of its data for everyone."
                    : "This action cannot be undone. You will be removed from the group and will need a new request to rejoin."
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteOrLeave}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}