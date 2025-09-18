import Chat from "@/components/chat/Chat";
import { Dock, DockIcon } from "@/components/magicui/dock";
import Member from "@/components/member";
import Navbar from "@/components/Nav_bar";
import { useAuth } from "@/components/providers/auth";
import Session from "@/components/session/Session";
import { SessionTimer } from "@/components/session/SessionTimer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/contexts/SessionContext";
import { deleteGroup, getGroupdetails, leaveGroup } from "@/lib/group-api";
import { cn } from "@/lib/utils";
import { GroupData } from "@/type";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  PenTool,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AIChatButton } from "@/components/chat/AIChatButton";
import { AIChatDialog } from "@/components/chat/AIChatDialog";
import { Whiteboard } from "@/components/whiteboard";
import Diagram from "@/components/Diagram";

const navItems = [
  { id: "members", icon: Users, label: "Study Buddies" },
  { id: "chat", icon: MessageSquare, label: "Group Chat" },
  { id: "sessions", icon: Calendar, label: "Study Time" },
  { id: "whiteboard", icon: PenTool, label: "Brain Space" },
  { id: "diagram", icon: Zap, label: "Generate Diagram" },
];

const defaultGroupData: GroupData = {
  id: "",
  name: "",
  subject: "",
  description: undefined,
  code: "",
  creatorId: "",
  memberIds: [],
  createdAt: new Date().toISOString(),
  creator: { id: "", name: "", email: "", avatarUrl: undefined },
  members: [],
  messages: [],
  sessions: [],
};

export default function StudyGroupPage() {
  const [activeTab, setActiveTab] = useState("members");
  const [groupData, setGroupData] = useState(defaultGroupData);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const { groupId } = useParams();
  const { user } = useAuth();
  const id = user?.id;
  const navigate = useNavigate();
  const isOwner = groupData.creatorId === id;
  const { activeSessions, endSession, leaveSession } = useSession();

  useEffect(() => {
    async function fetchGroupData() {
      setIsLoading(true);
      try {
        if (groupId) {
          const data: GroupData = await getGroupdetails(groupId);
          setGroupData(data);
        }
      } catch (error) {
        console.error("Error fetching group data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGroupData();
  }, [groupId]);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    console.log("Active Sessions:", activeSessions);
  }, [activeSessions]);

  return (
    <div className="min-h-screen bg-gradient-to-br relative from-background to-secondary/20">
      <Navbar />

      {/* Add Session Timers here - they'll be draggable anywhere */}
      {activeSessions.length > 0 &&
        activeSessions.map((session) => {
          console.log("Session being rendered:", session);
          return (
            <SessionTimer
              key={session.id}
              session={session}
              onClose={() => endSession(session.id)}
              onLeave={() => leaveSession(session.id)}
              currentUserId={user?.id || ""}
            />
          );
        })}

      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-2">
        <main className="container mx-auto px-4 pt-20 pb-20">
          {activeTab != "diagram" && (
            <motion.div
              initial={false}
              animate={hasScrolled ? "collapsed" : "expanded"}
              className="sticky top-16 mb-4"
            >
              <Card className="backdrop-blur-md bg-background/95">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {isLoading ? (
                        <Skeleton className="h-10 w-10 rounded-full" />
                      ) : (
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={groupData.creator.avatarUrl}
                            alt={groupData.creator.name}
                          />
                          <AvatarFallback>
                            {groupData.creator.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        {isLoading ? (
                          <Skeleton className="h-6 w-32" />
                        ) : (
                          <CardTitle className="text-xl">
                            {groupData.name}
                          </CardTitle>
                        )}
                        <div className="flex gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Users className="h-3 w-3" />
                            {groupData.members?.length || 0}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Zap className="h-3 w-3" />
                            Active
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <CardDescription className="mt-4 text-base">
                          {groupData.description}
                        </CardDescription>

                        <div className="flex flex-wrap gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab("sessions")}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            View Sessions
                          </Button>
                          <Button size="sm">
                            <Zap className="h-4 w-4 mr-2" />
                            Start Study Session
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                {isOwner ? "Delete Group" : "Leave Group"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {isOwner ? "Delete Group" : "Leave Group"}
                                </AlertDialogTitle>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async () => {
                                    if (isOwner)
                                      await deleteGroup(groupData.id);
                                    else await leaveGroup(groupData.id);
                                    navigate("/groups");
                                  }}
                                >
                                  {isOwner ? "Delete" : "Leave"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardHeader>
              </Card>
            </motion.div>
          )}

          {/* Main Content */}
          <div className="mt-4">
            {isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <div className="w-full">
                {activeTab === "members" && <Member groupData={groupData} />}
                {activeTab === "chat" && groupId && <Chat groupId={groupId} />}
                {activeTab === "sessions" && <Session />}
                {activeTab === "whiteboard" && <Whiteboard />}
                {activeTab === "diagram" && <Diagram />}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4">
            <Dock
              className="bg-background/95 backdrop-blur-md border border-border/50 h-16"
              iconSize={55}
              iconMagnification={65}
            >
              {navItems.map((item) => (
                <DockIcon
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "group relative p-2",
                    activeTab === item.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-primary/5 text-muted-foreground"
                  )}
                >
                  <div
                    className="absolute top-[-40px] bg-background text-foreground text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    role="tooltip"
                  >
                    {item.label}
                  </div>
                  <item.icon className="h-5 w-5" />
                  {activeTab === item.id && (
                    <motion.div
                      layoutId="nav-active-dot"
                      className="absolute bottom-1 h-1 w-1 bg-primary rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  )}
                </DockIcon>
              ))}
            </Dock>
          </div>
        </main>
      </div>

      <AIChatButton
        onClick={() => setIsAIChatOpen(true)}
        isOpen={isAIChatOpen}
      />
      <AIChatDialog
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </div>
  );
}
