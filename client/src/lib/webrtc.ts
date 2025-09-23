import { Socket } from "socket.io-client";
import { toast } from "sonner";

interface PeerConnection {
  userId: string;
  userName: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export class WebRTCManager {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, PeerConnection> = new Map();
  private socket: Socket | null = null;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  async initializeMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      if (!stream || !stream.getAudioTracks().length) {
        throw new Error("No audio device found");
      }
      this.localStream = stream;
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Failed to access microphone. Please check permissions.");
      return null;
    }
  }

  createPeerConnection(
    targetUserId: string,
    targetUserName: string
  ): RTCPeerConnection {
    const configuration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        // Use free STUN servers instead of placeholder TURN server
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" }
      ]
    };
    const peerConnection = new RTCPeerConnection(configuration);

    this.localStream?.getTracks().forEach((track) => {
      peerConnection.addTrack(track, this.localStream!);
    });

    this.peerConnections.set(targetUserId, {
      userId: targetUserId,
      userName: targetUserName,
      connection: peerConnection,
    });

    return peerConnection;
  }
}
