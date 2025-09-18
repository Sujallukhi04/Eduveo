import { useSession } from "@/contexts/SessionContext";
import { Room } from "../room";
import { Canvas } from "./_components/canvas";
import { Loading } from "./_components/canvas-loading";
import { SessionTimer } from "../session/SessionTimer";
import { useAuth } from "../providers/auth";

export const Board = () => {
  const { activeSessions, endSession, leaveSession } = useSession();
  const { user } = useAuth();
  return (
    <>
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
      <Room fallback={<Loading />}>
        <Canvas />
      </Room>
    </>
  );
};
