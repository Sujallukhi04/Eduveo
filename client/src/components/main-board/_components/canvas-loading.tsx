import { Loader } from "lucide-react";
import { InfoSkeleton } from "./info";
import { ParticipantsSkeleton } from "./participants";
import { ToolbarSkeleton } from "./toolbar";
import { ChatSkeleton } from "./chat";

export const Loading = () => {
  return (
    <main className="h-screen w-screen relative bg-neutral-100 touch-none
    flex items-center justify-center ">
      <Loader className="h-6 w-6 text-muted-foreground animate-spin"/>
      <InfoSkeleton />
      <ParticipantsSkeleton />
      <ToolbarSkeleton />
      <ChatSkeleton/>
    </main>
  )
}