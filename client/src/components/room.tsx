// import { ReactNode } from "react";
// import {
//   LiveblocksProvider,
//   RoomProvider,
//   ClientSideSuspense,
// } from "@liveblocks/react/suspense";
// import { LiveList,LiveMap,LiveObject } from "@liveblocks/client";
// import { Layer } from "@/types/canvas";
// import { useParams } from "react-router";
// import axios from "axios";
// import { useTheme } from "./providers/theme-provider";

// interface RoomProps{
//   children: ReactNode;
//   fallback:NonNullable<ReactNode>|null;
// }

// export function Room({
//    children,
//    fallback
//   }: RoomProps) {
//   const {boardId:roomId} = useParams();
//   console.log("roomID",roomId);
//   const { setTheme } = useTheme();
//   setTheme("light");
//   return (
//     <LiveblocksProvider 
//       authEndpoint=
//         {async (room) => {
//           try{
//             const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/liveblocks-auth`, 
//               { room },
//               {withCredentials:true}
//             )
//             console.log("Responce liveblocks: ",{response})
//             return response.data;
//           } catch (error) {
//             console.error("Liveblocks auth error:", error);
//             throw error; // Make sure errors are properly thrown
//           }
//         }}
//       //publicApiKey={`${import.meta.env.VITE_LIVEBLOCK_PUBLICKEY}`}
//      throttle={20}>
//       <RoomProvider id={roomId as string} initialPresence={{
//         cursor:null,
//         selection:[],
//         pencilDraft:null,
//         penColor:null
//       }}
//         initialStorage={{
//           layers: new LiveMap<string,LiveObject<Layer>>(),
//           layerIds: new LiveList<string>([]),
//         }}
//       >
//         <ClientSideSuspense fallback={fallback}>
//           {children}
//         </ClientSideSuspense>
//       </RoomProvider>
//     </LiveblocksProvider>

//   );
// }

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import { Layer } from "@/types/canvas";
import { useParams } from "react-router";
import axios from "axios";
import { useTheme } from "./providers/theme-provider";
import { Chat } from "./main-board/_components/chat";

interface RoomProps {
  children: ReactNode;
  fallback: NonNullable<ReactNode> | null;
}

export function Room({
  children,
  fallback
}: RoomProps) {
  const { boardId: roomId } = useParams();
  console.log("roomID", roomId);
  const { setTheme } = useTheme();
  setTheme("light");
  
  return (
    <LiveblocksProvider
      authEndpoint={async (room) => {
        try {
          const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/liveblocks-auth`,
            { room },
            { withCredentials: true }
          )
          console.log("Responce liveblocks: ", { response })
          return response.data;
        } catch (error) {
          console.error("Liveblocks auth error:", error);
          throw error; // Make sure errors are properly thrown
        }
      }}
      throttle={20}>
      <RoomProvider 
        id={roomId as string} 
        initialPresence={{
          cursor: null,
          selection: [],
          pencilDraft: null,
          penColor: null
        }}
        initialStorage={{
          layers: new LiveMap<string, LiveObject<Layer>>(),
          layerIds: new LiveList<string>([]),
          messages: new LiveList([]), // Add messages to your initial storage
        }}
      >
        <ClientSideSuspense fallback={fallback}>
          <>
            {children}
            <Chat />
          </>
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}