import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getGroupItems } from "@/lib/group-api";
import {
  Book,
  Mic,
  PhoneCall,
  Send,
  Smile,
  Upload as UploadFile,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../providers/auth";

import { Square, Trash } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRecordAudio } from "@/hooks/useRecordAudio";
import type { Message } from "@/type";
import { format, isToday, isYesterday } from "date-fns";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { toast } from "sonner";
import AudioCall from "../call/AudioCall";
import FileMessage from "./FIleMessage";
import { MessageContent } from "./Message";

// Information about active calls
interface ActiveCall {
  callId: string;
  initiatedBy: string;
  participants: string[];
  startedAt: string;
}

interface CallParticipant {
  id: string;
  socketId: string | undefined;
  name: string;
}

const ChatRoom = ({ groupId }: { groupId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callParticipants, setCallParticipants] = useState<CallParticipant[]>(
    []
  );
  const [showStreamCall, setShowStreamCall] = useState(false);
  const [activeGroupCall, setActiveGroupCall] = useState<ActiveCall | null>(
    null
  );

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const userId = user?.id;

  const {
    isRecording,
    duration,
    audioUrl,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
  } = useRecordAudio();

  const handleSendAudio = async () => {
    if (!audioUrl) return;

    const response = await fetch(audioUrl);
    const blob = await response.blob();
    const file = new File([blob], `audio_message_${Date.now()}.webm`, {
      type: "audio/webm",
    });

    // Convert to buffer for socket.io
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    socket?.emit("uploadFile", {
      file: buffer,
      userId,
      groupId,
      fileType: file.type,
      fileName: file.name,
      metadata: { duration },
    });

    resetRecording();
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Handle Stream call state change
  const handleStreamCallStateChange = (state: {
    isInCall: boolean;
    isMuted: boolean;
  }) => {
    console.log(
      `Call state changed: isInCall=${state.isInCall}, isMuted=${state.isMuted}`
    );

    // Update local state
    setIsInCall(state.isInCall);
    setIsMuted(state.isMuted);

    // Exit if no socket connection
    if (!socket || !userId) {
      console.log(
        "Unable to update call state: no socket connection or user ID"
      );
      return;
    }

    const callId = `group-${groupId}`;

    // If user has joined the call, update the participants in real-time
    if (state.isInCall && user?.name) {
      console.log(
        `User ${user.name} (${userId}) joining call for group ${groupId}`
      );

      socket.emit("call_participant_joined", {
        groupId,
        userId,
        userName: user.name,
        callId: callId,
      });

      // If there's no active call record yet, create one
      if (!activeGroupCall) {
        const newCall = {
          callId: callId,
          initiatedBy: userId, // Current user becomes the creator if they're the first to join
          participants: [userId],
          startedAt: new Date().toISOString(),
        };
        setActiveGroupCall(newCall);

        // Add the current user to participants
        setCallParticipants([
          {
            id: userId,
            socketId: socket.id,
            name: user.name,
          },
        ]);
      }

      // Log current call state for debugging
      console.log(
        `Call ID: ${callId}, Participants: ${
          activeGroupCall ? activeGroupCall.participants.length : 0
        }`
      );
    }

    // If user has left the call, handle cleanup
    if (!state.isInCall && activeGroupCall) {
      console.log(
        `User ${user?.name || userId} leaving call for group ${groupId}`
      );

      // Use the endCall function to handle proper cleanup through socket
      endCall();
    }
  };

  // Update the sendNotification function to use socket.io instead
  const sendNotification = (message: string) => {
    if (!socket || !userId || !user?.name) return;

    socket.emit("notification", {
      groupId,
      message,
      userId,
      userName: user.name,
    });
  };

  // Update startNewCall to create a call with only the creator as a participant
  const startNewCall = () => {
    if (!socket || !userId || !user?.name) {
      toast.error("Unable to start call. Please try again.");
      return;
    }

    if (activeGroupCall) {
      toast.info("A call is already in progress. You can join it instead.");
      return;
    }

    const callId = `group-${groupId}`;
    console.log(
      `Starting new call with ID: ${callId} for group ${groupId} with creator ${user.name}`
    );

    // Initialize with only the creator as a participant
    setCallParticipants([
      {
        id: userId,
        socketId: socket.id,
        name: user.name,
      },
    ]);

    // Create the call on the server with only the creator
    socket.emit("call_started", {
      groupId,
      callId: callId,
      initiatedBy: userId,
      initiatorName: user.name,
      // Include participant details for others to see
      participantDetails: [
        {
          id: userId,
          socketId: socket.id,
          name: user.name,
        },
      ],
    });

    // Set active call data locally - only include creator as participant
    setActiveGroupCall({
      callId: callId,
      initiatedBy: userId,
      participants: [userId],
      startedAt: new Date().toISOString(),
    });

    // Show the call UI for the creator
    setShowStreamCall(true);
    setIsInCall(true);

    toast.success("Starting group call as the only participant...");

    // Notify others that a call has been started
    socket.emit("notification", {
      groupId,
      message: `${user.name} started a call`,
      userId,
      userName: user.name,
    });
  };

  // Update joinOngoingCall to send a notification
  const joinOngoingCall = () => {
    if (!activeGroupCall || !socket || !userId || !user?.name) {
      toast.error("Unable to join call. Please try again.");
      return;
    }

    setShowStreamCall(true);
    console.log(`Joining ongoing call with ID: ${activeGroupCall.callId}`);
    console.log(`Current participants: ${activeGroupCall.participants.length}`);

    socket.emit("call_participant_joined", {
      groupId,
      userId,
      userName: user.name,
      callId: activeGroupCall.callId,
    });

    toast.success("Joining group call...");
    sendNotification(`${user.name} joined the call in group ${groupId}`);
  };

  // Update endCall to handle both leaving and ending a call properly
  const endCall = () => {
    if (!socket || !userId || !activeGroupCall) return;

    // Always hide the call UI first
    setShowStreamCall(false);

    // Always notify the server that this participant has left
    socket.emit("call_participant_left", {
      groupId,
      userId,
      userName: user?.name || "Unknown user",
      callId: activeGroupCall.callId,
    });

    // Check if the current user is the creator of the call
    const isCreator = activeGroupCall.initiatedBy === userId;

    if (isCreator) {
      // Only the creator can end the call for everyone
      socket.emit("call_ended", {
        groupId,
        callId: activeGroupCall.callId,
        endedBy: userId,
        endedByName: user?.name || "Unknown user",
      });

      setActiveGroupCall(null);
      setCallParticipants([]);
      toast.info("Call ended for all participants");
      sendNotification(
        `Call ended by ${user?.name || "Unknown user"} in group ${groupId}`
      );
    } else {
      // Non-creators just leave the call for themselves
      toast.info("You left the call");
      sendNotification(
        `${user?.name || "Unknown user"} left the call in group ${groupId}`
      );

      // Remove user from the participants list locally
      if (activeGroupCall) {
        setActiveGroupCall((prev) => {
          if (!prev) return null;

          return {
            ...prev,
            participants: prev.participants.filter((id) => id !== userId),
          };
        });

        setCallParticipants((prev) => prev.filter((p) => p.id !== userId));
      }
    }

    // Reset call state
    setIsInCall(false);
    setIsMuted(false);
  };

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.emit("joinGroup", groupId);
    fetchMessages();

    // Check if there's an ongoing call in this group
    newSocket.emit("check_active_call", { groupId });

    newSocket.on("message", (message) => {
      if (message.file) {
        setMessages((prev) => [...prev, message.file]);
      } else {
        setMessages((prev) => [...prev, message]);
      }
      setTimeout(scrollToBottom, 0);
    });

    newSocket.on("typing", ({ userName }) => {
      setTypingUsers((prev) => new Set(prev).add(userName));
    });

    newSocket.on("stopTyping", ({ userId }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Handle call-related events
    newSocket.on("active_call_status", (callData) => {
      if (callData && callData.callId) {
        console.log("Received active call status:", callData);
        setActiveGroupCall(callData);

        // Update the participants list with names from the call data
        if (
          callData.participantDetails &&
          Array.isArray(callData.participantDetails)
        ) {
          setCallParticipants(callData.participantDetails);
        }

        // If user is already a participant, show the call UI
        if (callData.participants.includes(userId)) {
          setShowStreamCall(true);
          setIsInCall(true);
        } else {
          // Show notification that there's an active call they can join
          toast.info(
            `Active call in progress. ${callData.participants.length} participant(s)`,
            {
              action: {
                label: "Join",
                onClick: () => setShowStreamCall(true),
              },
            }
          );
        }
      }
    });

    newSocket.on("call_started", (callData) => {
      console.log("Call started event received:", callData);

      // Always update our local record of the active call
      setActiveGroupCall(callData);

      if (
        callData.participantDetails &&
        Array.isArray(callData.participantDetails)
      ) {
        setCallParticipants(callData.participantDetails);
      }

      // If current user is not the call creator, just show notification
      // but don't automatically join or show the call UI
      if (callData.initiatedBy !== userId) {
        // Only show the notification
        toast.info(`${callData.initiatorName} started a call`, {
          action: {
            label: "Join",
            onClick: () => {
              // When they click join, then we'll show the call UI
              // and handle joining through the joinOngoingCall function
              joinOngoingCall();
            },
          },
        });
      }
    });

    newSocket.on(
      "call_participant_joined",
      ({ userId: participantId, userName, socketId }) => {
        console.log(`Participant joined: ${userName} (${participantId})`);

        // Update the active call participants
        setActiveGroupCall((prev) => {
          if (!prev) return null;

          return {
            ...prev,
            participants: [...new Set([...prev.participants, participantId])],
          };
        });

        // Track participant details including name and socket ID for proper display
        setCallParticipants((prev) => {
          // Remove any duplicate entries first
          const filteredPrev = prev.filter((p) => p.id !== participantId);

          return [
            ...filteredPrev,
            {
              id: participantId,
              socketId: socketId || "",
              name: userName || `User-${participantId.substring(0, 6)}`,
            },
          ];
        });

        // Show toast only if it's not the current user
        if (participantId !== userId) {
          toast.info(`${userName} joined the call`);
        }
      }
    );

    newSocket.on(
      "call_participant_left",
      ({ userId: leftUserId, userName, callId, reason }) => {
        console.log(
          `Participant left: ${userName} (${leftUserId}), reason: ${
            reason || "left manually"
          }`
        );

        // Update the active call participants
        setActiveGroupCall((prev) => {
          if (!prev) return null;

          const updatedParticipants = prev.participants.filter(
            (id) => id !== leftUserId
          );

          // If no participants left, call has ended
          if (updatedParticipants.length === 0) {
            return null;
          }

          // If the creator left and we're the oldest participant,
          // make current user the new creator automatically
          let updatedCall = {
            ...prev,
            participants: updatedParticipants,
          };

          if (
            leftUserId === prev.initiatedBy &&
            updatedParticipants.length > 0
          ) {
            // If we're the oldest participant now in the call
            if (updatedParticipants[0] === userId) {
              updatedCall.initiatedBy = userId;
              console.log(
                `${userName} (creator) left - current user is now the call creator`
              );
              toast.info("You are now the call admin");
            }
          }

          return updatedCall;
        });

        // Also remove from the detailed participants list
        setCallParticipants((prev) => prev.filter((p) => p.id !== leftUserId));

        // Show toast only if it's not the current user
        if (leftUserId !== userId) {
          if (reason === "offline") {
            toast.info(`${userName} disconnected from the call`);
          } else {
            toast.info(`${userName} left the call`);
          }
        }
      }
    );

    newSocket.on("call_ended", (data = {}) => {
      // Extract properties safely with default values
      const endedBy = data?.endedBy;
      const endedByName = data?.endedByName || "Unknown user";

      console.log(`Call ended by ${endedByName} (${endedBy || "unknown"})`);
      setActiveGroupCall(null);
      setCallParticipants([]);
      setShowStreamCall(false);
      setIsInCall(false);

      if (endedBy && endedBy !== userId) {
        toast.info(`Call ended by ${endedByName || "the call creator"}`);
      } else {
        toast.info("Call has ended");
      }
    });

    newSocket.on("fileDeleted", ({ fileId }) => {
      // Remove deleted files from messages
      setMessages((prev) => prev.filter((message) => message.id !== fileId));
    });

    // Add connection state change logging
    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");

      // If we were in a call, notify others that we've gone offline
      if (activeGroupCall && isInCall) {
        // Even though we're disconnected, we need to update our local state
        // to reflect that we're not in the call anymore
        setIsInCall(false);
        setShowStreamCall(false);

        console.log(
          "Disconnected while in an active call - will notify server on reconnect"
        );

        // On reconnect, we'll tell the server we left the call
        newSocket.once("connect", () => {
          if (activeGroupCall) {
            console.log(
              "Reconnected - notifying server that we left the call while offline"
            );
            newSocket.emit("call_participant_left", {
              groupId,
              userId,
              userName: user?.name || "Unknown user",
              callId: activeGroupCall.callId,
              reason: "offline",
            });
          }
        });
      }

      // Clear call state
      setActiveGroupCall(null);
      setCallParticipants([]);
      setIsInCall(false);
      setShowStreamCall(false);
    });

    return () => {
      newSocket.off("error");
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("active_call_status");
      newSocket.off("call_started");
      newSocket.off("call_participant_joined");
      newSocket.off("call_participant_left");
      newSocket.off("call_ended");
      newSocket.disconnect();
    };
  }, [groupId, userId, user?.name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await getGroupItems(groupId);
      setMessages(response);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM dd, yyyy");
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "hh:mm a");
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const grouped: { [date: string]: Message[] } = {};
    messages.forEach((message) => {
      // console.log(message);
      const date = message.updatedAt
        ? formatDateHeader(message.updatedAt)
        : formatDateHeader(message.createdAt);
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(message);
    });
    return grouped;
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const timestamp = new Date().toISOString();
    socket?.emit("sendMessage", {
      content: newMessage,
      userId,
      groupId,
      timestamp,
    });

    setNewMessage("");
  };

  const handleTyping = () => {
    socket?.emit("typing", {
      groupId,
      userId,
      userName: user?.name,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stopTyping", {
        groupId,
        userId: user?.id,
      });
    }, 1000);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);

    // Convert file to buffer for socket.io
    const arrayBuffer = await selectedFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    socket?.emit("uploadFile", {
      file: buffer,
      userId,
      groupId,
      fileType: selectedFile.type,
      fileName: selectedFile.name,
      caption: "", // Optional caption can be added
    });

    // Listen for upload progress
    socket?.on("uploadProgress", ({ progress }) => {
      setUploadProgress(progress);
    });

    // Listen for upload completion
    socket?.on("uploadComplete", () => {
      setIsUploading(false);
      setFileDialogOpen(false);
      setSelectedFile(null);
      // Clean up event listeners
      socket?.off("uploadProgress");
      socket?.off("uploadComplete");
      socket?.off("uploadError");
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    });

    // Listen for upload errors
    socket?.on("uploadError", ({ message }) => {
      toast.error(message);
      setIsUploading(false);
      socket?.off("uploadProgress");
      socket?.off("uploadComplete");
      socket?.off("uploadError");
    });
  };

  const cancelFileUpload = () => {
    setFileDialogOpen(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const groupedMessages = groupMessagesByDate(messages);

  const FileUploadDialog = () => {
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        setSelectedFile(files[0]);
      }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setSelectedFile(e.target.files[0]);
      }
    };

    return (
      <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
        <DialogContent className="sm:max-w-md z-[1000]">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Drag and drop a file or click to select
            </DialogDescription>
          </DialogHeader>

          {!selectedFile && !isUploading ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadFile className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400 justify-center">
                <label className="relative cursor-pointer rounded-md bg-white dark:bg-gray-800 font-semibold text-primary hover:text-primary/80">
                  <span>Click to upload</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="sr-only"
                    onChange={handleFileInputChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedFile && (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <UploadFile className="h-6 w-6 flex-shrink-0 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {selectedFile.type || "Unknown type"}
                      </p>
                    </div>
                  </div>
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="flex-shrink-0 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Fixed Footer with Buttons */}
          <DialogFooter className="flex justify-between sm:justify-between items-center py-3">
            <Button
              type="button"
              variant="destructive"
              onClick={cancelFileUpload}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleFileUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}

      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Book className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Study Group Chat
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Active Members: {activeGroupCall?.participants.length}
              {activeGroupCall && (
                <span className="ml-2 text-green-500">
                  • Call active ({activeGroupCall.participants.length}{" "}
                  participant
                  {activeGroupCall.participants.length !== 1 ? "s" : ""})
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!showStreamCall ? (
            <>
              {activeGroupCall ? (
                <Button
                  variant="outline"
                  onClick={joinOngoingCall}
                  className="bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400"
                >
                  <Users className="w-4 h-4 mr-2" />
                  <span>
                    Join Group Call ({activeGroupCall.participants.length})
                  </span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={startNewCall}
                  className="bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <PhoneCall className="w-4 h-4 mr-2 text-green-500" />
                  <span>Start Call</span>
                </Button>
              )}
            </>
          ) : (
            <Button variant="destructive" onClick={endCall}>
              <X className="w-4 h-4 mr-2" />
              {activeGroupCall && activeGroupCall.initiatedBy === userId
                ? "End Call for All"
                : "Leave Call"}
            </Button>
          )}
        </div>
      </div>

      {/* Stream.io Call */}
      {showStreamCall && (
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <AudioCall
            callId={`group-${groupId}`}
            onCallStateChange={handleStreamCallStateChange}
            className="border-b dark:border-gray-700"
            autoJoin={true}
            participantNames={callParticipants.reduce(
              (acc, participant) => ({
                ...acc,
                [participant.id]: participant.name,
              }),
              {}
            )}
          />
        </div>
      )}

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-6 py-4">
        <div className="space-y-6">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="flex items-center justify-center">
                <span className="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {date}
                </span>
              </div>
              <div className="space-y-4 mt-4">
                {msgs.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.userId === userId ? "justify-end" : ""
                    }`}
                  >
                    {message.userId !== userId && (
                      <Avatar className="w-8 h-8 ring-2 ring-white dark:ring-gray-800">
                        <AvatarImage src={message.user.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {message.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`flex flex-col ${
                        message.userId === userId ? "items-end" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {message.user.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatMessageTime(
                            message.updatedAt
                              ? message.updatedAt
                              : message.createdAt
                          )}
                        </span>
                      </div>
                      {message.type === "message" ? (
                        <div
                          className={`mt-1 rounded-2xl px-4 py-2 text-sm max-w-md ${
                            message.userId === userId
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
                          }`}
                        >
                          <MessageContent content={message.content!} />
                        </div>
                      ) : (
                        //@ts-ignore
                        <FileMessage file={message} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {typingUsers.size > 0 && (
          <div className="mt-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            {Array.from(typingUsers).join(", ")} typing...
          </div>
        )}
      </ScrollArea>

      {/* Input Section */}
      <div className="w-full bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <form
          onSubmit={handleSendMessage}
          className="w-full flex items-center space-x-3 p-3"
        >
          <div className="flex items-center space-x-3">
            {!isRecording && !audioUrl ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={startRecording}
                className="bg-gray-50 dark:bg-gray-700 border-0 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <Mic className="w-5 h-5 text-gray-500" />
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                {isRecording ? (
                  <>
                    <div className="text-sm text-red-500 animate-pulse">
                      Recording: {duration}s
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={stopRecording}
                      className="bg-red-50 hover:bg-red-100 dark:bg-red-900/20"
                    >
                      <Square className="w-4 h-4 text-red-500" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={cancelRecording}
                      className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-700"
                    >
                      <Trash className="w-4 h-4 text-gray-500" />
                    </Button>
                  </>
                ) : (
                  <div className="w-full flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendAudio}
                      className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20"
                    >
                      Send Audio
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={resetRecording}
                      className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-700"
                    >
                      <Trash className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Make sure input takes the full width */}
          <Input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type your message..."
            className="flex-1 w-full bg-gray-50 dark:bg-gray-700 border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="bg-gray-50 dark:bg-gray-700 border-0 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <Smile className="w-5 h-5 text-gray-500" />
              </Button>
            </PopoverTrigger>

            {/* File Upload Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setFileDialogOpen(true)}
              className="bg-gray-50 dark:bg-gray-700 border-0 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <UploadFile className="w-5 h-5 text-gray-500" />
            </Button>

            <PopoverContent align="end" className="p-0">
              <EmojiPicker
                onEmojiClick={(emoji) =>
                  setNewMessage((prev) => prev + emoji.emoji)
                }
                height={400}
                width={300}
                searchDisabled
                emojiStyle={EmojiStyle.NATIVE}
              />
            </PopoverContent>
          </Popover>

          <Button type="submit" className="bg-primary hover:bg-primary/90">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <FileUploadDialog />
    </div>
  );
};

export default ChatRoom;
