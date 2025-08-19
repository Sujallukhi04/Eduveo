"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Copy } from "lucide-react";
import { toast } from "sonner";
import { Group } from "@/app/groups/page";
import { RequestsDialog } from "./RequestsDialog";
import { EditGroupDialog } from "./EditGroupDialog";
import { useRouter } from "next/navigation";

interface GroupCardProps {
  group: Group;
  currentUserId: string;
  onGroupAction: () => void;
}

export function GroupCard({
  group,
  currentUserId,
  onGroupAction,
}: GroupCardProps) {
  const router = useRouter();
  const isOwner = group.creatorId === currentUserId;

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click navigation
    navigator.clipboard.writeText(group.code);
    toast.success("Copied to clipboard!", {
      description: `Group code: ${group.code}`,
    });
  };

  const handleNavigate = (e: React.MouseEvent) => {
    // Prevent navigation if click originated inside a dialog
    const target = e.target as HTMLElement;
    if (target.closest("[role=dialog]")) return; // skip if click inside modal

    router.push(`/groups/${group.id}`);
  };

  return (
    <Card
      className="flex flex-col cursor-pointer hover:shadow-md transition"
      onClick={handleNavigate}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{group.name}</CardTitle>
            <CardDescription>{group.subject}</CardDescription>
          </div>
          {isOwner && <Badge variant="secondary">Owner</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Users className="mr-2 h-4 w-4" />
          <span>{group._count.members} Member(s)</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="flex-1"
          >
            <Copy className="mr-2 h-4 w-4" /> Code
          </Button>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {isOwner && (
            <>
              <EditGroupDialog group={group} onGroupUpdated={onGroupAction} />
              <RequestsDialog group={group} onRequestsHandled={onGroupAction} />
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
