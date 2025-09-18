import { SessionType } from "./Session";
import SessionCard from "./SessionCard";

interface SessionListProps {
  title: string;
  sessions: SessionType[];
  onEdit: (session: SessionType) => void;
  onDelete: (sessionId: string) => void;
  onEndSession: (sessionId: string) => Promise<void>;
  isSessionCreator: (session: SessionType) => boolean;
}

export const SessionList = ({ title, sessions, onEdit, onDelete }: SessionListProps) => {
  return (
    <>
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => (
          <div className="w-full" key={session.id}>
            <SessionCard
              session={session}
              onEdit={() => onEdit(session)}
              onDelete={() => onDelete(session.id)}
            >
            </SessionCard>
          </div>
        ))}
      </div>
    </>
  );
}; 