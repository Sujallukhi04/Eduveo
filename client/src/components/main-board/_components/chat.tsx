import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Smile, Send, Bell, BellOff } from "lucide-react";
import { useOthers, useSelf, useStorage, useMutation, useEventListener } from "@liveblocks/react/suspense";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Define message type
type ChatMessage = {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPicture: string;
  createdAt: number;
  reactions: Record<string, string[]>; // emoji -> userIds who reacted
};

// Emoji picker categories
const emojiCategories = {
  recent: ["👍", "❤️", "😂", "🎉", "🙏", "👏", "🔥", "✨"],
  smileys: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😊", "😇", "🥰", "😍", "😘"],
  gestures: ["👋", "👌", "✌️", "🤞", "🤟", "🤙", "👍", "👎", "👊", "✊", "🤛", "🤜", "🙌", "👐"],
  symbols: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💔", "✨", "🔥", "💯", "💢", "💥"]
};

export const Chat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState(true);
  const [lastReadTimestamp, setLastReadTimestamp] = useState(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const others = useOthers();
  const self = useSelf();
  
  // Get messages from storage
  const messages = useStorage((root) => root.messages);
  
  // Update storage with new message
  const updateMessages = useMutation(({ storage }, newMessage: ChatMessage) => {
    //@ts-ignore
    storage.get("messages").push(newMessage);
  }, []);

  // Add reaction to message
  const addReaction = useMutation(({ storage }, { messageId, emoji, userId }) => {
    const messages = storage.get("messages");
        //@ts-ignore
    for (let i = 0; i < messages.length; i++) {
          //@ts-ignore
      const message = messages.get(i);
      if (message.id === messageId) {
        const reactions = message.reactions || {};
        if (!reactions[emoji]) {
          reactions[emoji] = [];
        }
        
        // Toggle reaction
        const userIndex = reactions[emoji].indexOf(userId);
        if (userIndex === -1) {
          reactions[emoji].push(userId);
        } else {
          reactions[emoji].splice(userIndex, 1);
        }
            //@ts-ignore
        messages.set(i, { ...message, reactions });
        break;
      }
    }
  }, []);
  
  // Calculate unread messages on initial load
  useEffect(() => {
    if (messages && notifications && !isChatOpen) {
          //@ts-ignore
      const newMessages = messages.filter(msg => 
        msg.createdAt > lastReadTimestamp && msg.userId !== self?.id
      );
      setUnreadCount(newMessages.length);
    }
  }, [messages, notifications, isChatOpen, lastReadTimestamp, self?.id]);
  
  // Function to toggle chat panel
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadCount(0);
      setLastReadTimestamp(Date.now());
      // Focus input when opening chat
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };
  
  // Toggle notifications
  const toggleNotifications = () => {
    setNotifications(!notifications);
    if (!notifications) {
      // When turning notifications back on, reset counters to current state
      setLastReadTimestamp(Date.now());
      setUnreadCount(0);
    }
  };
  
  // Function to send message
  const sendMessage = () => {
    if (!inputValue.trim() || !self) return;
    
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
          //@ts-ignore
      userId: self.id,
          //@ts-ignore
      userName: self.info.name,
        //@ts-ignore
      userPicture: self.info.picture,
      createdAt: Date.now(),
      reactions: {}
    };
    
    // Add message to storage
    updateMessages(newMessage);
    setInputValue("");
  };
  
  // Handle reaction click
  const handleReaction = (messageId: string, emoji: string) => {
    if (!self) return;
    addReaction({ messageId, emoji, userId: self.id });
  };
  
  // Listen for new messages when chat is closed
  useEventListener((data) => {
        //@ts-ignore
    if (data.type === "CHAT_MESSAGE" && !isChatOpen && notifications) {
      // Only count messages from others, not from self
          //@ts-ignore
      if (data.message.userId !== self?.id) {
        setUnreadCount(prev => prev + 1);
      }
    }
  });
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);
  
  // Handle keyboard submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format time
  const formatTime = (timestamp: number) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  // Format date for message groups
  const formatMessageDate = (timestamp: number) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString()) {
      return 'Yesterday';
    } else {
      return format(messageDate, 'MMM d, yyyy');
    }
  };

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    if (!messages) return [];
    
    const groups: { date: string; timestamp: number; messages: typeof messages }[] = [];
        //@ts-ignore
    messages.forEach((message) => {
      const messageDate = formatMessageDate(message.createdAt);
      const lastGroup = groups[groups.length - 1];
      
      if (lastGroup && lastGroup.date === messageDate) {
            //@ts-ignore
        lastGroup.messages.push(message);
      } else {
        groups.push({
          date: messageDate,
          timestamp: message.createdAt,
          messages: [message]
        });
      }
    });
    
    return groups;
  }, [messages]);

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {isChatOpen ? (
        <Card className="w-80 md:w-96 h-96 flex flex-col shadow-lg border-primary/10">
          <CardHeader className="p-2.5 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4 text-primary" />
              Chat ({others.length + 1})
            </CardTitle>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7" 
                onClick={toggleNotifications}
                title={notifications ? "Mute notifications" : "Unmute notifications"}
              >
                {notifications ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleChat}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-2">
            <CardContent className="space-y-1.5 min-h-full">
              {
                    //@ts-ignore
              messages?.length === 0 && (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm italic">
                  No messages yet. Start the conversation!
                </div>
              )}
              
              {groupedMessages.map((group) => (
                <div key={group.timestamp} className="space-y-1.5">
                  <div className="relative flex items-center justify-center my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-muted"></div>
                    </div>
                    <div className="relative px-3 bg-background text-xs text-muted-foreground">
                      {group.date}
                    </div>
                  </div>
                  
                  {    //@ts-ignore
                  group.messages.map((message, index) => {
                    const isCurrentUser = message.userId === self?.id;
                        //@ts-ignore
                    const prevMessage = index > 0 ? group.messages[index - 1] : null;
                    const isSameUser = prevMessage && prevMessage.userId === message.userId;
                    const timeDiff = prevMessage ? message.createdAt - prevMessage.createdAt : Infinity;
                    const showHeader = !isSameUser || timeDiff > 300000; // 5 minutes
                    
                    return (
                      <div key={message.id} className="group mb-1">
                        {showHeader && (
                          <div className={`flex items-center gap-1.5 mb-0.5 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            {!isCurrentUser && (
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={message.userPicture} />
                                <AvatarFallback>{message.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {isCurrentUser ? 'You' : message.userName} • {formatTime(message.createdAt)}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[85%] group relative">
                            <div className={cn(
                              "rounded-lg px-2.5 py-1.5",
                              isCurrentUser
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-muted rounded-bl-none",
                              !isSameUser || showHeader
                                ? isCurrentUser
                                  ? "rounded-tr-lg" 
                                  : "rounded-tl-lg"
                                : "",
                            )}>
                              <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                            </div>
                            
                            {/* Reactions - Improved horizontal layout */}
                            {message.reactions && Object.keys(message.reactions).length > 0 && (
                              <div className="flex flex-wrap -mb-1 mt-0.5 gap-1">
                                {Object.entries(message.reactions).map(([emoji, users]) => 
                                    //@ts-ignore
                                  users.length > 0 && (
                                    <Badge 
                                      key={emoji} 
                                          //@ts-ignore
                                      variant={users.includes(self?.id || "") ? "default" : "outline"}
                                      className="text-xs py-0 h-5 px-1.5 gap-0.5 cursor-pointer hover:bg-muted"
                                      onClick={() => handleReaction(message.id, emoji)}
                                    >
                                      {emoji} <span className="text-xs">
                                        {    //@ts-ignore
                                        users.length}</span>
                                    </Badge>
                                  )
                                )}
                              </div>
                            )}
                            
                            {/* Floating reaction button */}
                            { !isCurrentUser && <div className="absolute -bottom-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full shadow-sm bg-background/90">
                                    <Smile className="h-3.5 w-3.5 text-muted-foreground" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 p-1.5" side="top">
                                  <Tabs defaultValue="recent">
                                    <TabsList className="w-full h-8">
                                      <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
                                      <TabsTrigger value="smileys" className="text-xs">Smileys</TabsTrigger>
                                      <TabsTrigger value="gestures" className="text-xs">Gestures</TabsTrigger>
                                      <TabsTrigger value="symbols" className="text-xs">Symbols</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="recent" className="flex flex-wrap mt-0">
                                      {emojiCategories.recent.map(emoji => (
                                        <button 
                                          key={emoji}
                                          className="p-1 text-lg hover:bg-muted rounded cursor-pointer"
                                          onClick={() => {
                                            handleReaction(message.id, emoji);
                                          }}
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </TabsContent>
                                    
                                    <TabsContent value="smileys" className="flex flex-wrap mt-0">
                                      {emojiCategories.smileys.map(emoji => (
                                        <button
                                          key={emoji}
                                          className="p-1 text-lg hover:bg-muted rounded cursor-pointer"
                                          onClick={() => {
                                            handleReaction(message.id, emoji);
                                          }}
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </TabsContent>
                                    
                                    <TabsContent value="gestures" className="flex flex-wrap mt-0">
                                      {emojiCategories.gestures.map(emoji => (
                                        <button
                                          key={emoji}
                                          className="p-1 text-lg hover:bg-muted rounded cursor-pointer"
                                          onClick={() => {
                                            handleReaction(message.id, emoji);
                                          }}
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </TabsContent>
                                    
                                    <TabsContent value="symbols" className="flex flex-wrap mt-0">
                                      {emojiCategories.symbols.map(emoji => (
                                        <button
                                          key={emoji}
                                          className="p-1 text-lg hover:bg-muted rounded cursor-pointer"
                                          onClick={() => {
                                            handleReaction(message.id, emoji);
                                          }}
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </TabsContent>
                                  </Tabs>
                                </PopoverContent>
                              </Popover>
                            </div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>
          </ScrollArea>
          
          <CardFooter className="p-2.5 border-t">
            <div className="flex w-full gap-1.5">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9">
                    <Smile className="h-4.5 w-4.5 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-1.5">
                  <Tabs defaultValue="recent">
                    <TabsList className="w-full mb-1.5 h-8">
                      <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
                      <TabsTrigger value="smileys" className="text-xs">Smileys</TabsTrigger>
                      <TabsTrigger value="gestures" className="text-xs">Gestures</TabsTrigger>
                      <TabsTrigger value="symbols" className="text-xs">Symbols</TabsTrigger>
                    </TabsList>
                    
                    {Object.entries(emojiCategories).map(([category, emojis]) => (
                      <TabsContent key={category} value={category} className="flex flex-wrap mt-0">
                        {emojis.map(emoji => (
                          <button
                            key={emoji}
                            className="p-1 text-lg hover:bg-muted rounded cursor-pointer"
                            onClick={() => {
                              setInputValue(prev => prev + emoji);
                              inputRef.current?.focus();
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </TabsContent>
                    ))}
                  </Tabs>
                </PopoverContent>
              </Popover>
              
              <Input
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                ref={inputRef}
              />
              
              <Button 
                onClick={sendMessage} 
                size="icon" 
                className="shrink-0 h-9 w-9"
                disabled={!inputValue.trim()}
              >
                <Send className="h-4.5 w-4.5" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <div className="relative">
          {unreadCount > 0 && notifications && (
            <div className="absolute -top-2 -right-2 z-10">
              <Badge 
                variant="destructive"
                className="px-1.5 min-w-5 h-5 flex items-center justify-center rounded-full animate-pulse"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            </div>
          )}
          <Button 
            onClick={toggleChat} 
            size="icon" 
            className={cn(
              "h-12 w-12 rounded-full shadow-lg transition-all duration-200",
              unreadCount > 0 && notifications && "ring-2"
            )}
          >
            <MessageCircle className={cn(
              "h-6 w-6",
              unreadCount > 0 && notifications && "animate-bounce"
            )} />
          </Button>
        </div>
      )}
    </div>
  );
};

export const ChatSkeleton = () => {
  return (
    <div className="absolute h-12 w-12 right-4 bottom-4 bg-white rounded-full p-3 shadow-md" />
  );
};
