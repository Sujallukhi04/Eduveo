export type Group = {
  id: number;
  name: string;
  memberIds: string[];
  subject: string;
  sessions: Session[];
  code: string;
  creatorId: string;
};

export type JoinRequest = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  groupId: string;
};
export type GroupData = {
  id: string;
  name: string;
  subject: string;
  description?: string;
  code: string;
  creatorId: string;
  memberIds: string[];
  createdAt: string; // ISO date string
  creator: User;
  members: User[];
  messages: Message[];
  sessions: Session[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string; // Optional
};

export type Message = {
  id: string;
  type: "message" | "file";
  content?: string; // For messages
  name?: string; // For files
  url?: string; // For files
  fileType?: string; // For files
  size?: number; // For files
  caption?: string; // For files
  previewUrl?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
  userId: string;
  groupId: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  user: {
    name: string;
    avatar?: string;
  };
};

export interface Session {
  id: string;
  title: string;
  date: string;
  description: string;
  isActive?: boolean;
  startedAt?: string;
  time: string;
  prerequisites?: string;
  createdBy: {
    id: string;
    name: string;
  };
}

export interface AudioRecordingState {
  isRecording: boolean;
  duration: number;
  audioUrl: string | null;
}