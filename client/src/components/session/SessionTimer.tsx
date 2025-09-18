import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { GripHorizontal, Maximize2, Minimize2, StopCircle, Clock, Users, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { useNavigate } from "react-router-dom";
import AudioCall from "../call/AudioCall";
import { useSession } from '@/contexts/SessionContext';
import { toast } from 'sonner';
import { useTheme } from "../providers/theme-provider";
import { Badge } from "../ui/badge";

// Helper function to format time
const formatTime = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  const hours = Math.floor(ms / 1000 / 60 / 60);

  return { hours, minutes, seconds };
};

interface SessionTimerProps {
  session: {
    id: string;
    name: string;
    startedAt?: string;
    endedAt?: string;
    creatorID: string;
    groupId: string;
    participants?: Array<{
      socketId: string;
      userId: string;
      userName: string;
      joinedAt: number;
    }>;
  };
  onClose: () => void;
  onLeave: () => void;
  currentUserId: string;
}

export const SessionTimer = ({ session, onClose, onLeave, currentUserId }: SessionTimerProps) => {
  const { endSession, leaveSession } = useSession();
  const [elapsed, setElapsed] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isInCall, setIsInCall] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const { theme } = useTheme();
  const constraintsRef = useRef(null);

  const isCreator = currentUserId === session.creatorID;
  
  // Generate the call ID for this session using the groupId
  const callId = `session-${session.groupId}`;

  // Handle call state changes from AudioCall component
  const handleCallStateChange = (state: { isInCall: boolean; isMuted: boolean }) => {
    setIsInCall(state.isInCall);
    setIsMuted(state.isMuted);
  };

  // Function to handle window resize and adjust position if needed
  const handleWindowResize = useCallback(() => {
    if (window.innerWidth <= 768 && !isMinimized) {
      // On smaller screens, minimize automatically
      setIsMinimized(true);
    }
  }, [isMinimized]);

  // Add resize listener
  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [handleWindowResize]);

  useEffect(() => {
    if (!session.startedAt) return;
    
    // If session is ended, calculate final elapsed time and cleanup
    if (session.endedAt) {
      const start = new Date(session.startedAt).getTime();
      const end = new Date(session.endedAt).getTime();
      setElapsed(end - start);
      
      // If not creator, trigger leave
      if (!isCreator) {
        onLeave();
      }
      return;
    }
    
    // Calculate initial elapsed time for ongoing session
    const start = new Date(session.startedAt).getTime();
    const now = new Date().getTime();
    setElapsed(now - start);
    
    // Set up the interval for ongoing updates
    const interval = setInterval(() => {
      const start = new Date(session.startedAt!).getTime();
      const now = new Date().getTime();
      const newElapsed = now - start;
      setElapsed(newElapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [session.startedAt, session.endedAt, isCreator, onLeave]);

  const handleEndSession = useCallback(() => {
    try {
      endSession(session.id);
      setElapsed(0);
      toast.success('Session ended successfully!');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session. Please try again.');
    }
  }, [session.id, endSession, onClose]);

  const handleLeaveSession = useCallback(() => {
    try {
      leaveSession(session.id);
      setElapsed(0);
      toast.success('Left session successfully!');
      if (onLeave) onLeave();
    } catch (error) {
      console.error('Error leaving session:', error);
      toast.error('Failed to leave session. Please try again.');
    }
  }, [session.id, leaveSession, onLeave]);

  // Get timer display values
  const { hours, minutes, seconds } = formatTime(elapsed);

  // Set initial position based on screen size
  const getInitialPosition = () => {
    // Default position for desktop
    let xPos = window.innerWidth - 350;
    let yPos = window.innerHeight - 200;
    
    // Adjust for smaller screens
    if (window.innerWidth <= 768) {
      xPos = window.innerWidth / 2 - 150; // Center horizontally
      yPos = window.innerHeight - 140;
    }
    
    return { x: xPos, y: yPos };
  };

  const router = useNavigate();

  return (
    <motion.div
      ref={constraintsRef}
      drag
      dragMomentum={false}
      initial={getInitialPosition()}
      animate={{ 
        width: isMinimized ? "auto" : "clamp(300px, 90vw, 340px)",
        height: "auto" 
      }}
      className={cn(
        "fixed z-50 cursor-move touch-none",
        isMinimized ? "rounded-full" : "rounded-lg shadow-lg",
        // Add responsive positioning for mobile
        "sm:bottom-auto sm:right-auto",
        "bottom-16 right-4 md:bottom-auto md:right-auto"
      )}
      // Constrain the draggable area
      dragConstraints={{
        top: 10,
        left: 10,
        right: window.innerWidth - (isMinimized ? 120 : 340),
        bottom: window.innerHeight - (isMinimized ? 60 : 300)
      }}
    >
      <Card className={cn(
        "shadow-xl transition-all duration-300 border-none",
        "backdrop-blur-sm bg-opacity-90",
        theme === "dark"
          ? "bg-gray-900/90 text-gray-100 shadow-blue-500/10"
          : "bg-white/90 text-gray-800 shadow-gray-200/50",
        isMinimized 
          ? "w-auto rounded-full" 
          : "w-full max-w-[340px] overflow-hidden"
      )}>
        <div className={cn(
          "p-3 sm:p-4",
          isMinimized && "p-2"
        )}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <GripHorizontal className={cn(
                "h-4 w-4",
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              )} />
              {!isMinimized && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold truncate max-w-[180px]">{session.name}</span>
                  <Badge variant="outline" className={cn(
                    "text-xs h-5 px-1.5",
                    isInCall 
                      ? "bg-green-500/10 text-green-500 border-green-500/30" 
                      : "bg-red-500/10 text-red-500 border-red-500/30"
                  )}>
                    {isInCall ? "Active" : "Inactive"}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 rounded-full",
                  theme === "dark"
                    ? "hover:bg-gray-800 text-gray-300"
                    : "hover:bg-gray-100 text-gray-600"
                )}
                onClick={() => setIsMinimized(!isMinimized)}
                aria-label={isMinimized ? "Expand session timer" : "Minimize session timer"}
              >
                {isMinimized ? (
                  <Maximize2 className="h-3 w-3" />
                ) : (
                  <Minimize2 className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
          
          {!isMinimized ? (
            <>
              <div className={cn(
                "font-mono text-xl sm:text-2xl font-bold text-center py-3 px-4 rounded-lg mb-4",
                theme === "dark" 
                  ? "bg-gray-800/50 text-white" 
                  : "bg-gray-100/70 text-gray-800"
              )}>
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  <span>{hours.toString().padStart(2, '0')}</span>:
                  <span>{minutes.toString().padStart(2, '0')}</span>:
                  <span>{seconds.toString().padStart(2, '0')}</span>
                </div>
              </div>
              
              {/* Audio Call Component - Always visible */}
              <div className={cn(
                "mb-4 rounded-lg overflow-hidden",
                theme === 'dark' 
                  ? "bg-gray-800 border border-gray-700" 
                  : "bg-gray-100 border border-gray-200"
              )}>
                <div className="px-3 py-2 flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-xs font-medium",
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  )}>
                    Call Status
                  </span>
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-red-500" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <AudioCall 
                  callId={callId}
                  mode="embedded"
                  onCallStateChange={handleCallStateChange}
                  autoJoin={true}
                  participantNames={session.participants?.reduce((acc, p) => ({
                    ...acc,
                    [p.userId]: p.userName
                  }), {})}
                  className="w-full"
                />
              </div>
              
              {/* Only show participants section if there are participants */}
              {session.participants && session.participants.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    <h4 className="text-sm font-medium">
                      Participants ({session.participants?.length || 0})
                    </h4>
                  </div>
                  <ScrollArea className={cn(
                    "max-h-24 w-full",
                    "rounded-lg p-1.5",
                    theme === "dark" 
                      ? "bg-gray-800/50 border border-gray-700/50" 
                      : "bg-gray-100/70 border border-gray-200"
                  )}>
                    <div className="flex flex-wrap gap-2">
                      {session.participants?.map((participant) => (
                        <div key={participant.userId} className={cn(
                          "flex items-center gap-1.5 p-1.5 rounded-md transition-colors",
                          theme === "dark" 
                            ? "bg-gray-700/70 hover:bg-gray-700" 
                            : "bg-white hover:bg-gray-50",
                          participant.userId === currentUserId && (
                            theme === "dark" 
                              ? "ring-1 ring-blue-400/30 bg-blue-900/20" 
                              : "ring-1 ring-blue-500/30 bg-blue-50"
                          )
                        )}>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className={cn(
                              participant.userId === currentUserId
                                ? "bg-blue-500 text-white" 
                                : theme === "dark" 
                                  ? "bg-gray-600 text-gray-200" 
                                  : "bg-gray-200 text-gray-700"
                            )}>
                              {participant.userName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">{participant.userName}</span>
                          {participant.userId === currentUserId && (
                            <span className="text-[10px] font-bold px-1 py-0.5 rounded ml-1 bg-blue-500/20 text-blue-500">(You)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <div className="space-y-3 mt-3">
                <div className={cn(
                  "text-xs rounded-md p-2",
                  theme === "dark" 
                    ? "bg-gray-800/50 text-gray-300" 
                    : "bg-gray-100 text-gray-600"
                )}>
                  <div className="flex items-center justify-between">
                    <span>Started at:</span>
                    <span className="font-medium">
                      {session.startedAt && new Date(session.startedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  {session.endedAt && (
                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-700/30">
                      <span>Ended at:</span>
                      <span className="font-medium">
                        {new Date(session.endedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  )}
                </div>
                
                {!session.endedAt && (
                  <Button 
                    variant={isCreator ? "destructive" : "secondary"}
                    className={cn(
                      "w-full font-medium transition-all",
                      isCreator
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : theme === "dark"
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                          : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                    )}
                    onClick={isCreator ? handleEndSession : handleLeaveSession}
                  >
                    <StopCircle className="h-4 w-4 mr-2" />
                    {isCreator ? 'End Session' : 'Leave Session'}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="font-mono font-bold px-3 py-1.5 text-center flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isInCall 
                  ? "bg-green-500 animate-pulse" 
                  : "bg-red-500"
              )}></div>
              <span className={theme === "dark" ? "text-white" : "text-gray-800"}>
                {hours.toString().padStart(2, '0')}:
                {minutes.toString().padStart(2, '0')}:
                {seconds.toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};