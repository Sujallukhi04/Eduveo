"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGroup } from "@/lib/group-api";
import { Group } from "../../type";

interface CreateGroupDialogProps {
  onCreateGroup: (group: Group) => void;
}

export function CreateGroupDialog({ onCreateGroup }: CreateGroupDialogProps) {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [groupSubject, setGroupSubject] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleCreateGroup = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const newGroup = await createGroup(groupName, groupSubject);
      onCreateGroup(newGroup);
      setGroupName("");
      setGroupSubject("");
      setOpen(false); // Close the dialog
      // Refresh the current route by navigating to the same location
      navigate(0); // This will refresh the current page
    } catch (error) {
      console.error("Error creating group:", error);
      setError("Failed to create group. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Create Group</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Study Group</DialogTitle>
          <DialogDescription>
            Set up a new study group. Enter the group name and subject.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="groupSubject">Subject</Label>
            <Input
              id="groupSubject"
              value={groupSubject}
              onChange={(e) => setGroupSubject(e.target.value)}
              placeholder="Enter group subject"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleCreateGroup}
            disabled={isCreating || !groupName || !groupSubject}
          >
            {isCreating ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
