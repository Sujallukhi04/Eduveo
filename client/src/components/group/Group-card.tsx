import { useState } from "react";
import { Group, JoinRequest } from "../../type";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  Calendar,
  Check,
  Copy,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { acceptRequest, rejectRequest } from "@/lib/group-api";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface GroupCardProps {
  group: Group;
  isOwner: boolean;
  isRequest?: number;
  requests?: JoinRequest[];
  setRequest?: React.Dispatch<React.SetStateAction<JoinRequest[]>>;
}

export function GroupCard({
  group,
  isOwner,
  isRequest = 0,
  requests = [],
  setRequest,
}: GroupCardProps) {
  const [openCodeDialog, setOpenCodeDialog] = useState(false);
  const [openRequestsDialog, setOpenRequestsDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  console.log("group: ", group);
  
  //find session from group.sessions and get the next session
  const nextSession = group.sessions.find((session) => {
    return new Date(session.time) > new Date();
  });

  // console.log("nextSession: ", nextSession);
  
  // from the next session get the time
  const nextSessionTime = nextSession?.time;
  // separate the date and time
  const date = nextSessionTime?.split("T")[0];



  // const time = nextSessionTime?.split("T")[1].split(".")[0];

  //convert time in indian standard time
  const time = nextSessionTime ? new Date(nextSessionTime).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }) : undefined;

  console.log("Time: ",  time);
  
  const navigate = useNavigate();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.code);
    setCopied(true);
    toast.success("Code copied to clipboard", { duration: 3000 });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleAcceptRequest = async (requestId: string) => {
    setRequest?.((prevRequests) =>
      prevRequests.filter((req) => req.id !== requestId)
    );
    try {
      await acceptRequest(requestId);
      toast.success("Request accepted", { duration: 3000 });
    } catch (error) {
      toast.error("Error accepting request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setRequest?.((prevRequests) =>
      prevRequests.filter((req) => req.id !== requestId)
    );
    try {
      await rejectRequest(requestId);
      toast.success("Request rejected", { duration: 3000 });
    } catch {
      toast.error("Error rejecting request", { duration: 3000 });
    }
  };

  return (
    <Card
      className="overflow-hidden transition-all duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(40deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -right-12 -top-12 w-24 h-24 bg-white/10 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-700" />
        <div className="relative flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1 flex items-center gap-2">
              {group.name}
              <Badge
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 transition-colors"
              >
                {group.subject}
              </Badge>
            </CardTitle>
            <CardDescription className="text-white/90">
              {group.subject}
            </CardDescription>
          </div>
          {isOwner && (
            <Dialog open={openCodeDialog} onOpenChange={setOpenCodeDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Group Invitation Code</DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <code className="text-lg font-mono">{group.code}</code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCopyCode}
                    className={copied ? "text-green-500" : ""}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Users size={16} />
              </div>
              <span>{group.memberIds.length} members</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Calendar size={16} />
              </div>
              { time ? (<span>Next: { date } { time }</span>): (<span>No upcoming session</span>)}
              
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pb-6">
        <Button
          variant="outline"
          className="flex-1 hover:bg-primary hover:text-white transition-colors group"
          onClick={() => navigate(`/groups/${group.id}`)}
        >
          <BookOpen className="mr-2 h-4 w-4 group-hover:animate-pulse" />
          View Group
          <ArrowRight
            className={`ml-2 h-4 w-4 transition-transform duration-300 ${
              isHovered ? "translate-x-1" : ""
            }`}
          />
        </Button>
        {isRequest > 0 && (
          <Dialog
            open={openRequestsDialog}
            onOpenChange={setOpenRequestsDialog}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="hover:bg-primary hover:text-white transition-colors"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {isRequest} Request{isRequest > 1 ? "s" : ""}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md mx-auto h-[80vh] sm:h-auto overflow-y-auto">
              <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
                <DialogTitle className="text-xl">
                  Pending Join Requests
                </DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto max-h-[60vh] space-y-3 -mx-6 px-6">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-col sm:flex-row items-center justify-between py-4 hover:bg-muted/50 rounded-lg px-3 transition-colors duration-200 gap-4"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                      <Avatar className="h-12 w-12 sm:h-10 sm:w-10 border-2 border-primary/20">
                        <AvatarImage src={request.avatar} alt={request.name} />
                        <AvatarFallback className="bg-primary/10">
                          {request.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center sm:text-left">
                        <p className="text-sm font-medium">{request.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/20"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        <Check className="w-4 h-4 mr-1" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 sm:flex-none hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}
