import { shallow, useOthersConnectionIds, useOthersMapped } from "@liveblocks/react/suspense";
import { memo } from "react";
import { Cursor } from "./cursor";
import { Path } from "./Path";
import { colotToCss } from "@/lib/utils";
const Cursors = () => {
  const ids = useOthersConnectionIds();
  return (
    <>
      {ids.map((connectionId) => (
        <Cursor
          key={connectionId}
          connectionId={connectionId}
        />
      ))}
    </>
  )
}

const Drafts = () => {
  const others = useOthersMapped((other)=>({
    pencilDraft:other.presence.pencilDraft,
    penColor:other.presence.penColor,
  }),shallow);
  
  return (
    <>
      {others.map(([Key,other])=>{
        if(other.pencilDraft){
          return (
            <Path
              x={0}
              y={0}
              //@ts-ignore
              points={other.pencilDraft}
              //@ts-ignore
              fill={other.penColor?colotToCss(other.penColor):"#000"}
              key={Key}
            />
          )
        }
        return null;
      })}
    </>
  )
}

export const CursorPresence = memo(() => {
  return (
    <>
      <Drafts/>
      <Cursors/>
    </>
  )
});

CursorPresence.displayName = "CursorPresence";