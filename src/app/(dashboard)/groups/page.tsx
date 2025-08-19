"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GroupCard } from "@/components/groups/GroupCard";
import { CreateGroupDialog } from "@/components/groups/CreateGroupDialog";
import { JoinGroupDialog } from "@/components/groups/JoinGroupDialog";
import { LogOut, Users } from "lucide-react";
import { motion } from "framer-motion";
import { ModernLoader } from "@/components/ModernLoader";

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

  const onGroupAction = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/groups");
      if (!response.ok) throw new Error("Failed to fetch groups");
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      toast.error("Could not refresh your groups.", {
        description: "Please try refreshing the page.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") onGroupAction();
  }, [status, router]);

  if (status === "loading" || !session) {
    return <ModernLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Eduveo
          </h1>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-300">
              Hi, {session.user?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" />
              Your Groups
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your study groups and collaborate with others.
            </p>
          </div>
          <div className="flex gap-3">
            <CreateGroupDialog onGroupCreated={onGroupAction} />
            <JoinGroupDialog />
          </div>
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <ModernLoader />
        ) : groups.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {groups.map((group) => (
              <motion.div
                key={group.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <GroupCard
                  group={group}
                  currentUserId={session.user.id}
                  onGroupAction={onGroupAction}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-white dark:bg-gray-800/50 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              No groups yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Create a new group or join one to get started!
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <CreateGroupDialog onGroupCreated={onGroupAction} />
              <JoinGroupDialog />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
