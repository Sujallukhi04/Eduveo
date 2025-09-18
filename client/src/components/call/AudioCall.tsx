"use client";

import { Button } from "@/components/ui/button";
import {
  Call,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Mic, MicOff, Phone, PhoneOff, RefreshCw, Volume2 } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../providers/auth";
import { useTheme } from "../providers/theme-provider";
import {
  disconnectClient,
  getOrCreateCall,
  initializeVideoClient,
  setupCallEventListeners,
} from "./StreamClient";

interface AudioCallProps {
  callId: string;
  mode?: "fullscreen" | "embedded" | "compact";
  onCallStateChange?: (state: { isInCall: boolean; isMuted: boolean }) => void;
  className?: string;
  autoJoin?: boolean;
  showControls?: boolean;
  participantNames?: { [key: string]: string };
}

// // Create a separate component for participants to prevent re-renders
// const ParticipantItem = memo(
//   ({ participant, currentUserId, participantNames }: {
//     participant: any;
//     currentUserId: string;
//     participantNames?: { [key: string]: string };
//   }) => {
//     const isCurrentUser = participant.userId === currentUserId;

//     // Improved name display logic:
//     // 1. Try participant names mapping first (from Chat component)
//     // 2. Fall back to participant.user?.name from Stream
//     // 3. Try to show a more human-readable ID if all else fails
//     const displayName =
//       participantNames?.[participant.userId] ||
//       participant.user?.name ||
//       (participant.userId ? `User-${participant.userId.substring(0, 6)}` : "Unknown");

//     return (
//       <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-md">
//         {participant.user?.image ? (
//           <img
//             src={participant.user.image}
//             alt={displayName}
//             className="w-6 h-6 rounded-full"
//           />
//         ) : (
//           <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
//             {displayName.charAt(0).toUpperCase()}
//           </div>
//         )}
//         <span className="text-sm text-white truncate">
//           {displayName} {isCurrentUser ? "(You)" : ""}
//         </span>
//         {participant.isSpeaking && (
//           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
//         )}
//         {participant.isMuted && <MicOff size={12} className="text-red-400" />}
//       </div>
//     );
//   }
// );

// Separate component for the audio visualizer
const AudioVisualizer = memo(
  ({
    audioStream,
    theme = "dark",
  }: {
    audioStream: MediaStream | null;
    theme?: string;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
      if (!audioStream || !canvasRef.current) return;

      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
        }

        const audioContext = audioContextRef.current;
        if (!analyserRef.current) {
          analyserRef.current = audioContext.createAnalyser();
          analyserRef.current.fftSize = 256;
        }

        const source = audioContext.createMediaStreamSource(audioStream);
        source.connect(analyserRef.current);

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext("2d");

        if (!canvasCtx) {
          console.error("Failed to get canvas context");
          return;
        }

        // Ensure the canvas is responsive
        const resizeCanvas = () => {
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        const draw = () => {
          analyserRef.current?.getByteFrequencyData(dataArray);

          // Use different background colors based on theme - solid colors without blur
          canvasCtx.fillStyle = theme === "dark" ? "#111827" : "#f3f4f6"; // Dark gray vs light gray
          canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

          const barWidth = (canvas.width / bufferLength) * 2.5;
          let x = 0;

          // Check if roundRect is supported
          const hasRoundRect = typeof canvasCtx.roundRect === "function";

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;

            // For crisp graphics, use solid colors instead of gradients
            if (theme === "dark") {
              canvasCtx.fillStyle = "#10b981"; // emerald-500 for dark
            } else {
              canvasCtx.fillStyle = "#059669"; // emerald-600 for light (slightly darker for contrast)
            }

            // Remove shadow blur for crisp edges
            canvasCtx.shadowBlur = 0;

            // Make the bars with clear edges
            if (hasRoundRect) {
              canvasCtx.beginPath();
              canvasCtx.roundRect(
                x,
                canvas.height - barHeight,
                barWidth,
                barHeight,
                [3, 3, 0, 0]
              );
              canvasCtx.fill();
            } else {
              // Fallback for browsers without roundRect support
              canvasCtx.beginPath();
              canvasCtx.rect(x, canvas.height - barHeight, barWidth, barHeight);
              canvasCtx.fill();
            }

            x += barWidth + 1;
          }

          animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
          cancelAnimationFrame(animationRef.current!);
          source.disconnect();
          window.removeEventListener("resize", resizeCanvas);
          // Don't close the audio context every time to prevent re-creation issues
        };
      } catch (error) {
        console.error("Error setting up audio visualizer:", error);
      }
    }, [audioStream, theme]);

    return <canvas ref={canvasRef} className="w-full h-full rounded-sm" />;
  }
);

// Separate component to handle the call content
const CallContent = memo(
  ({ user, participantNames, onLeave, theme = "dark" }: any) => {
    const call = useCall();
    const { useParticipants, useRemoteParticipants } = useCallStateHooks();
    let participants = useParticipants();
    participants = Array.from(
      new Map(participants.map((p) => [p.userId, p])).values()
    );

    const remoteParticipants = useRemoteParticipants();
    const [isMuted, setIsMuted] = useState(false);
    const [activeAudioStream, setActiveAudioStream] =
      useState<MediaStream | null>(null);

    // Handle audio playback for remote participants
    useEffect(() => {
      const audioElement = document.createElement("audio");
      audioElement.autoplay = true;
      audioElement.style.display = "none"; // Hidden audio element
      document.body.appendChild(audioElement);

      const participantWithAudio = remoteParticipants?.find(
        (p) => p.audioStream
      );
      if (participantWithAudio?.audioStream) {
        console.log(
          `Playing audio stream for participant ${participantWithAudio.userId}`
        );
        audioElement.srcObject = participantWithAudio.audioStream;
        audioElement
          .play()
          .then(() => console.log("Audio playback started successfully"))
          .catch((err) => console.error("Audio playback error:", err));
        setActiveAudioStream(participantWithAudio.audioStream);
      } else {
        console.log("No remote participant with audio stream found");
      }

      return () => {
        audioElement.srcObject = null;
        audioElement.remove();
        console.log("Audio element cleaned up");
      };
    }, [remoteParticipants]);

    // Enhanced debugging for audio state
    useEffect(() => {
      console.log("=== Audio Call Debug ===");
      console.log("Total participants:", participants?.length);
      console.log("Remote participants:", remoteParticipants?.length);
      console.log("Call object exists:", !!call);
      if (call) {
        console.log("Call state:", call.state);
        console.log("Own capabilities:", call.state.ownCapabilities);
        console.log("Microphone state:", call.microphone?.state);
      }
      remoteParticipants?.forEach((participant) => {
        console.log(`Participant ${participant.userId}:`);
        console.log(`  Audio stream:`, participant.audioStream);
        console.log(`  Published tracks:`, participant.publishedTracks);
        console.log(`  Is speaking:`, participant.isSpeaking);
        console.log(`  Is muted:`, participant.audioLevel);
      });
    }, [call, participants, remoteParticipants]);

    const toggleMute = useCallback(async () => {
      if (!call) return;

      try {
        if (isMuted) {
          await call.microphone?.enable();
          setIsMuted(false);
          toast.success("Microphone enabled");
        } else {
          await call.microphone?.disable();
          setIsMuted(true);
          toast.success("Microphone muted");
        }
      } catch (error) {
        console.error("Error toggling microphone:", error);
        toast.error("Failed to change microphone state");
      }
    }, [call, isMuted]);

    const leaveCall = useCallback(async () => {
      if (!call) return;
      try {
        onLeave();
      } catch (error) {
        console.error("Error leaving call:", error);
        toast.error("Error leaving call");
      }
    }, [call, onLeave]);

    const speakingParticipants =
      participants?.filter((p) => p.isSpeaking) || [];
    const isAnySpeaking = speakingParticipants.length > 0;

    return (
      <div
        className={`flex flex-col rounded-md overflow-hidden ${
          theme === "dark" ? "bg-gray-900" : "bg-white border border-gray-200"
        }`}
      >
        <div
          className={`px-3 py-2 flex justify-between items-center ${
            theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          <div className="flex items-center">
            <Volume2
              size={16}
              className={`mr-2 ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}
            />
            <span className="text-sm font-medium">
              Voice Call ({participants?.length || 0})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className={`p-1.5 rounded-full ${
                isMuted
                  ? theme === "dark"
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "bg-red-100 text-red-600 hover:bg-red-200"
                  : theme === "dark"
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
            <button
              onClick={leaveCall}
              className={`p-1.5 rounded-full ${
                theme === "dark"
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-red-100 text-red-600 hover:bg-red-200"
              }`}
            >
              <PhoneOff size={14} />
            </button>
          </div>
        </div>

        <div className="pt-0.5 px-1">
          <div className="flex flex-wrap gap-1 py-1">
            {participants?.map((participant) => {
              const participantAny = participant as any;
              console.log(participant);
              const userImage = participantAny.user?.image;
              const userName =
                participantNames?.[participant.userId] ||
                participantAny.user?.name ||
                (participant.userId
                  ? `User-${participant.userId.substring(0, 6)}`
                  : "Unknown");
              const isCurrentUser = participant.userId === user?.id;
              const participantIsMuted = participantAny.isMuted || false;

              return (
                <div
                  key={participant.userId}
                  className={`flex items-center px-2 py-1 rounded-full transition-all duration-300 ${
                    participant.isSpeaking
                      ? theme === "dark"
                        ? "bg-green-800"
                        : "bg-green-100 text-green-800"
                      : theme === "dark"
                      ? "bg-gray-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {userImage ? (
                    <div className="relative">
                      <img
                        src={userImage}
                        alt="User"
                        className={`w-5 h-5 rounded-full mr-1.5 ${
                          participant.isSpeaking
                            ? theme === "dark"
                              ? "ring-2 ring-green-400 ring-offset-1 ring-offset-gray-900"
                              : "ring-2 ring-green-500 ring-offset-1 ring-offset-white"
                            : ""
                        }`}
                      />
                      {participant.isSpeaking && (
                        <div
                          className={`absolute -inset-0.5 rounded-full ${
                            theme === "dark"
                              ? "bg-green-500/30"
                              : "bg-green-500/20"
                          }`}
                        ></div>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs mr-1.5 ${
                          theme === "dark"
                            ? "bg-gray-600 text-white"
                            : "bg-gray-300 text-gray-800"
                        } ${
                          participant.isSpeaking
                            ? theme === "dark"
                              ? "ring-2 ring-green-400 ring-offset-1 ring-offset-gray-900"
                              : "ring-2 ring-green-500 ring-offset-1 ring-offset-white"
                            : ""
                        }`}
                      >
                        {(userName || "U").charAt(0).toUpperCase()}
                      </div>
                      {participant.isSpeaking && (
                        <div
                          className={`absolute -inset-0.5 rounded-full ${
                            theme === "dark"
                              ? "bg-green-500/30"
                              : "bg-green-500/20"
                          }`}
                        ></div>
                      )}
                    </div>
                  )}
                  <span
                    className={`text-xs truncate max-w-24 ${
                      theme === "dark" ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {userName}
                    {isCurrentUser && " (You)"}
                  </span>
                  {participantIsMuted && (
                    <MicOff
                      size={10}
                      className={`ml-1 ${
                        theme === "dark" ? "text-red-400" : "text-red-500"
                      }`}
                    />
                  )}
                  {participant.isSpeaking && (
                    <>
                      <div className="ml-1 flex items-center">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            theme === "dark" ? "bg-green-500" : "bg-green-600"
                          }`}
                        ></div>
                      </div>
                      {isCurrentUser && (
                        <span
                          className={`text-[10px] ml-1 ${
                            theme === "dark"
                              ? "text-green-300"
                              : "text-green-700"
                          }`}
                        >
                          Speaking
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
            }) || []}
          </div>
        </div>

        {isAnySpeaking && activeAudioStream && (
          <div className="h-6 mt-1 mb-1 px-2">
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-[10px] flex items-center ${
                  theme === "dark" ? "text-green-400" : "text-green-600"
                }`}
              >
                <Volume2 size={10} className="mr-1" /> Audio active
              </span>
              <span
                className={`text-[10px] ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Voice activity detected
              </span>
            </div>
            <AudioVisualizer audioStream={activeAudioStream} theme={theme} />
          </div>
        )}
      </div>
    );
  }
);

function AudioCall({
  callId,
  mode = "fullscreen",
  onCallStateChange,
  className = "",
  autoJoin = true,
  participantNames,
}: AudioCallProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [callInstance, setCallInstance] = useState<Call | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const clientRef = useRef<StreamVideoClient | null>(null);
  const callRef = useRef<Call | null>(null);
  const initializedRef = useRef(false);

  // Critical: Add this to track setup status and prevent multiple setups
  const setupInProgressRef = useRef(false);

  // Handle microphone permission errors
  const handlePermissionError = useCallback((error: any) => {
    console.error("Permission error:", error);
    let message;

    if (error.name === "NotReadableError") {
      message = "Microphone is in use by another application";
    } else if (error.name === "NotFoundError") {
      message = "No microphone found";
    } else if (error.name === "NotAllowedError") {
      message = "Microphone access denied";
    } else {
      message = "Unable to access microphone";
    }

    setConnectionError(message);
    setIsLoading(false);
    toast.error(message);
  }, []);

  // Mute/unmute microphone
  const toggleMute = useCallback(async () => {
    if (!callRef.current) return;

    try {
      if (isMuted) {
        await callRef.current.microphone?.enable();
        setIsMuted(false);
        onCallStateChange?.({ isInCall, isMuted: false });
        toast.success("Microphone enabled");
      } else {
        await callRef.current.microphone?.disable();
        setIsMuted(true);
        onCallStateChange?.({ isInCall, isMuted: true });
        toast.success("Microphone muted");
      }
    } catch (error) {
      console.error("Error toggling microphone:", error);
      toast.error("Failed to change microphone state");
    }
  }, [isMuted, isInCall, onCallStateChange]);

  // Leave call function
  const leaveCall = useCallback(async () => {
    if (!callRef.current) return;

    try {
      console.log("Leaving call:", callId);

      // First notify the parent component that we're leaving the call
      // This is important to do BEFORE we attempt to leave, so socket notifications happen immediately
      setIsInCall(false);
      onCallStateChange?.({ isInCall: false, isMuted });

      // Then leave the call through Stream's SDK
      await callRef.current.leave();

      toast.success("Left call successfully");
    } catch (error) {
      console.error("Error leaving call:", error);
      toast.error("Error leaving call");

      // If there was an error leaving, we should still consider ourselves left
      // because the parent component already thinks we left
      setIsInCall(false);
      onCallStateChange?.({ isInCall: false, isMuted });
    } finally {
      // Make sure UI reflects that we're not in the call
      setIsInCall(false);
    }
  }, [callId, isMuted, onCallStateChange]);

  // Setup client for audio calls
  const setupClient = useCallback(async () => {
    if (
      !user ||
      !isAuthenticated ||
      initializedRef.current ||
      setupInProgressRef.current
    ) {
      return;
    }

    setupInProgressRef.current = true;
    console.log("Setting up client for user:", user.id);

    try {
      setIsLoading(true);
      setConnectionError(null);

      // Check microphone permissions directly via getUserMedia instead of the permissions API
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        console.log(
          "Microphone access granted:",
          stream.getAudioTracks().length > 0
        );

        // Release the stream immediately since we're just checking permissions
        stream.getTracks().forEach((track) => track.stop());
      } catch (micError) {
        console.error("Microphone access error:", micError);
        throw micError;
      }

      // Clean up any existing clients first
      if (user.id) {
        await disconnectClient(user.id);
      }

      // Initialize client
      const audioClient = await initializeVideoClient(user, true);
      clientRef.current = audioClient;
      setClient(audioClient);

      console.log("Client setup complete for:", user.id);
      return audioClient;
    } catch (error) {
      console.error("Error setting up client:", error);
      handlePermissionError(
        error instanceof Error ? error : new Error("Unknown error")
      );
      return null;
    } finally {
      setupInProgressRef.current = false;
    }
  }, [user, isAuthenticated, handlePermissionError]);

  // Separate function to setup call to avoid race conditions
  const setupCall = useCallback(
    async (audioClient: StreamVideoClient) => {
      if (!audioClient || !user) return null;

      try {
        console.log("Setting up audio call with ID:", callId);
        const newCall = await getOrCreateCall(audioClient, callId, user);
        callRef.current = newCall;
        setCallInstance(newCall);

        // Set up call event listeners
        setupCallEventListeners(newCall);

        // Handle call ending
        newCall.on("call.ended", (event) => {
          const endedBy = event.user?.id || "another user";
          const endedByName = event.user?.name || "Unknown user";

          if (endedBy !== user.id) {
            toast.info(`Call ended by ${endedByName}`);
            setIsInCall(false);
            onCallStateChange?.({ isInCall: false, isMuted });
          }
        });

        console.log("Audio call setup complete for:", callId);
        return newCall;
      } catch (error) {
        console.error("Error setting up audio call:", error);
        return null;
      }
    },
    [callId, user, isMuted, onCallStateChange]
  );

  // Use this function to join the call
  const joinCall = useCallback(
    async (call: Call) => {
      if (!call) return;

      try {
        console.log("=== Starting Audio Call Join Process ===");
        console.log("Call ID:", callId);
        console.log("Call type:", call.type);
        console.log("Call state:", call.state);

        // Check if user is call creator
        const isCreator = call.state.createdBy?.id === user?.id;
        console.log(`User role: ${isCreator ? "creator" : "participant"}`);

        // Log call capabilities
        console.log("Call capabilities:", call.state.ownCapabilities);

        // Check audio devices before joining
        console.log("=== Audio Device Status ===");
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioDevices = devices.filter(
            (device) => device.kind === "audioinput"
          );
          console.log("Available audio devices:", audioDevices);

          // Check if we have permission for audio
          const permissionStatus = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          console.log("Microphone permission status:", permissionStatus.state);

          // First get user media directly to ensure browser permission and prepare microphone
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          console.log(
            "Successfully acquired microphone stream:",
            stream.getAudioTracks().length > 0
          );
          console.log(
            "Audio tracks:",
            stream.getAudioTracks().map((track) => ({
              label: track.label,
              enabled: track.enabled,
              muted: track.muted,
              readyState: track.readyState,
            }))
          );

          // Release the stream as Stream SDK will get its own
          stream.getTracks().forEach((track) => track.stop());
        } catch (deviceError) {
          console.error("Error checking audio devices:", deviceError);
        }

        // Join the call with create option and explicitly request audio permissions
        console.log("Attempting to join audio call...");
        await call.join({
          create: true,
          // Standard parameters only
        });
        console.log("Successfully joined audio call");

        // After joining, need to EXPLICITLY wait before enabling microphone
        console.log("=== Setting Up Audio Devices ===");
        try {
          // Wait for 1 second to ensure call is fully established
          await new Promise((resolve) => setTimeout(resolve, 1000));

          console.log("Enabling microphone...");

          // Force microphone permission and initialization
          try {
            const micStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });
            console.log("Microphone permission confirmed");
            micStream.getTracks().forEach((track) => track.stop());
          } catch (micErr) {
            console.error("Could not get microphone permission:", micErr);
            throw micErr;
          }

          // Try a different approach to enable audio
          if (call.microphone) {
            // Method 1: Try standard approach
            await call.microphone.enable();
            console.log(
              "Microphone enabled successfully using standard method"
            );
          } else {
            console.error("No microphone object found on call");
            throw new Error("No microphone object available");
          }

          // Disable video if it exists (safety check)
          if (call.camera) {
            console.log("Disabling camera (not needed for audio calls)...");
            await call.camera.disable();
            console.log("Camera disabled successfully");
          }
        } catch (deviceError) {
          console.error("Error setting up audio devices:", deviceError);
          // Log specific error details
          if (deviceError instanceof Error) {
            console.error("Device error name:", deviceError.name);
            console.error("Device error message:", deviceError.message);
          }
        }

        // Log final device states
        console.log("=== Final Device States ===");
        console.log("Microphone state:", call.microphone?.state);
        console.log("Microphone enabled:", call.microphone?.enabled);

        // Update UI state
        setIsInCall(true);
        setIsMuted(false);
        onCallStateChange?.({ isInCall: true, isMuted: false });

        console.log("=== Audio Call Join Complete ===");
        console.log(
          `Successfully joined audio call as ${
            isCreator ? "creator" : "participant"
          }: ${callId}`
        );
      } catch (error) {
        console.error("=== Audio Call Join Error ===");
        console.error("Error joining audio call:", error);
        if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        toast.error("Failed to join audio call");
      } finally {
        setIsLoading(false);
      }
    },
    [callId, onCallStateChange, user]
  );

  // Reconnect function
  const handleReconnect = useCallback(async () => {
    if (setupInProgressRef.current) {
      console.log("Setup already in progress, ignoring reconnect request");
      return;
    }

    console.log("Attempting to reconnect to audio call...");
    setConnectionError(null);
    setIsLoading(true);

    try {
      // First setup the client
      const audioClient = await setupClient();
      if (!audioClient) {
        toast.error("Failed to initialize audio client");
        return;
      }

      // Then setup the call
      const newCall = await setupCall(audioClient);
      if (!newCall) {
        toast.error("Failed to setup audio call");
        return;
      }

      // Join the call if autoJoin is true
      if (autoJoin) {
        await joinCall(newCall);
      } else {
        setIsLoading(false);
      }

      initializedRef.current = true;
    } catch (error) {
      console.error("Audio call reconnection failed:", error);
      handlePermissionError(
        error instanceof Error ? error : new Error("Unknown error")
      );
    }
  }, [setupClient, setupCall, joinCall, autoJoin, handlePermissionError]);

  // Initialize client and call only once
  useEffect(() => {
    // Only proceed if not initialized and not in progress
    if (
      initializedRef.current ||
      setupInProgressRef.current ||
      !isAuthenticated ||
      !user
    ) {
      return;
    }

    console.log("Initial setup for AudioCall component");

    const initialize = async () => {
      // First setup the client
      const audioClient = await setupClient();
      if (!audioClient) return;

      // Then setup the call
      const newCall = await setupCall(audioClient);
      if (!newCall) return;

      // Join the call if autoJoin is true
      if (autoJoin) {
        await joinCall(newCall);
      } else {
        setIsLoading(false);
      }

      initializedRef.current = true;
    };

    initialize();

    // Cleanup function
    return () => {
      console.log("Unmounting AudioCall component");
      const cleanup = async () => {
        // First notify parent component that we're leaving the call
        // This is critical for socket notifications
        if (isInCall) {
          setIsInCall(false);
          onCallStateChange?.({ isInCall: false, isMuted });
        }

        // Then leave the call if we're in one
        if (callRef.current && isInCall) {
          try {
            await callRef.current.leave();
            console.log("Successfully left audio call during cleanup");
          } catch (error) {
            console.error("Error leaving audio call during cleanup:", error);
          }
        }

        // Finally disconnect the client
        if (user && user.id) {
          try {
            await disconnectClient(user.id);
            console.log(
              "Successfully disconnected audio client during cleanup"
            );
          } catch (error) {
            console.error(
              "Error disconnecting audio client during cleanup:",
              error
            );
          }
        }
      };

      // Execute cleanup
      cleanup().catch((err) => console.error("Cleanup error:", err));

      initializedRef.current = false;
    };
  }, [
    isAuthenticated,
    user,
    setupClient,
    setupCall,
    joinCall,
    autoJoin,
    isInCall,
    isMuted,
    onCallStateChange,
  ]);

  // Compact view component
  const CompactView = useCallback(
    () => (
      <div className="flex items-center gap-2">
        {connectionError ? (
          <>
            <span className="text-red-500 text-sm">{connectionError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReconnect}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {isLoading ? "Reconnecting..." : "Reconnect"}
            </Button>
          </>
        ) : isInCall ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              disabled={isLoading}
            >
              {isMuted ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={leaveCall}
              disabled={isLoading}
              className="bg-red-100 hover:bg-red-200 text-red-700"
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReconnect}
            disabled={isLoading}
            className="bg-green-100 hover:bg-green-200 text-green-700"
          >
            <Phone className="h-4 w-4 mr-1" />
            Join
          </Button>
        )}
      </div>
    ),
    [
      connectionError,
      isInCall,
      isLoading,
      handleReconnect,
      toggleMute,
      leaveCall,
      isMuted,
    ]
  );

  // Embedded view component
  const EmbeddedView = useCallback(
    () => (
      <div className="rounded-md overflow-hidden">
        {isInCall && callInstance ? (
          <StreamVideo client={client!}>
            <StreamCall call={callInstance}>
              <CallContent
                user={user}
                participantNames={participantNames}
                onLeave={leaveCall}
                theme={theme}
              />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div
            className={`p-3 rounded-md ${
              theme === "dark"
                ? "bg-gray-900"
                : "bg-white border border-gray-200"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin mr-2 w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full" />
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Connecting...
                </p>
              </div>
            ) : connectionError ? (
              <div className="flex flex-col items-center justify-center">
                <span
                  className={`text-sm mb-2 ${
                    theme === "dark" ? "text-red-400" : "text-red-600"
                  }`}
                >
                  {connectionError}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReconnect}
                  disabled={isLoading}
                  className={
                    theme === "dark"
                      ? "bg-background/10 text-white hover:bg-background/20"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleReconnect}
                disabled={isLoading}
                size="sm"
                className={`w-full ${
                  theme === "dark"
                    ? "bg-green-700 hover:bg-green-800 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                <Phone className="h-3 w-3 mr-1" />
                Join Voice Call
              </Button>
            )}
          </div>
        )}
      </div>
    ),
    [
      isInCall,
      callInstance,
      client,
      isLoading,
      connectionError,
      user,
      leaveCall,
      handleReconnect,
      participantNames,
      theme,
    ]
  );

  // Render based on selected mode
  const renderByMode = useCallback(() => {
    if (!client || !callInstance) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div
              className={`animate-spin mb-4 mx-auto w-12 h-12 border-4 border-t-transparent rounded-full ${
                theme === "dark" ? "border-primary" : "border-green-600"
              }`}
            />
            <p
              className={`text-lg ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              Initializing audio call...
            </p>
            {!isLoading && !isInCall && (
              <Button
                onClick={handleReconnect}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                Join Audio Call
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <StreamVideo client={client}>
        <StreamCall call={callInstance}>
          <div className="rounded-md overflow-hidden">
            <CallContent
              user={user}
              participantNames={participantNames}
              onLeave={leaveCall}
              theme={theme}
            />
          </div>
        </StreamCall>
      </StreamVideo>
    );
  }, [
    client,
    callInstance,
    isLoading,
    isInCall,
    handleReconnect,
    leaveCall,
    user,
    participantNames,
    theme,
  ]);

  // Main render
  if (isLoading && !isInCall && !connectionError) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div
            className={`animate-spin mb-4 mx-auto w-12 h-12 border-4 border-t-transparent rounded-full ${
              theme === "dark" ? "border-primary" : "border-green-600"
            }`}
          />
          <p
            className={`text-lg ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            Loading audio call...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {mode === "compact" ? (
        <CompactView />
      ) : mode === "embedded" ? (
        <EmbeddedView />
      ) : (
        renderByMode()
      )}
    </div>
  );
}

export default memo(AudioCall);
