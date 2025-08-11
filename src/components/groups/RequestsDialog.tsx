'use client';

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Check, X } from "lucide-react";
import { Group } from "@/app/groups/page"; 

// Define types for clarity
interface UserInfo {
  id: string;
  name: string;
  email: string;
}
interface JoinRequest {
  id: string;
  user: UserInfo;
}

// Define the types for the props this component receives
interface RequestsDialogProps {
  group: Group;
  onRequestsHandled: () => void;
}

export function RequestsDialog({ group, onRequestsHandled }: RequestsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${group.id}/requests`);
      if (!response.ok) throw new Error("Failed to fetch requests");
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      toast.error("Could not load requests.");
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, group.id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleRequest = async (requestId: string, action: "accept" | "reject") => {
    try {
      const response = await fetch('/api/handle-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success(`Request has been ${action}ed.`);
      fetchRequests();
      onRequestsHandled();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error(`Failed to ${action} request`, { description: errorMessage });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative flex-1">
          <Bell className="mr-2 h-4 w-4" /> Requests
          {group._count.joinRequests > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {group._count.joinRequests}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Requests for "{group.name}"</DialogTitle>
          <DialogDescription>Accept or reject requests to join your group.</DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-80 overflow-y-auto">
          {isLoading ? (
            <p>Loading requests...</p>
          ) : requests.length > 0 ? (
            <ul className="space-y-3">
              {requests.map((req) => (
                <li key={req.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                  <div>
                    <p className="font-semibold">{req.user.name}</p>
                    <p className="text-sm text-slate-500">{req.user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="text-green-500" onClick={() => handleRequest(req.id, "accept")}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="text-red-500" onClick={() => handleRequest(req.id, "reject")}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-500 py-8">No pending requests.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}