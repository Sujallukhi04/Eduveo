import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { LayerType, Side, XYWH } from "@/types/canvas";
import { useSelf, useStorage } from "@liveblocks/react/suspense";
import {memo} from "react";

interface SelectionBoxProps {
  onResizeHandlePointerDown: (corner:Side,initialBounds:XYWH) => void;
};

const HANDLE_WIDTH = 8;

export const SelectionBox = memo(({ onResizeHandlePointerDown }: SelectionBoxProps) => {
  const soleLayerId = useSelf((me)=>
    //@ts-ignore
    me?.presence?.selection?.length === 1 ? me?.presence?.selection[0] : null
  )
  
  const isShowingHandles = useStorage((root)=>{
    //@ts-ignore
    return soleLayerId && root?.layers?.get(soleLayerId)?.type !== LayerType.Path
  });

  const bounds = useSelectionBounds();

  if(!bounds)
    return null;

  console.log(isShowingHandles, "isShowingHandles state");
  console.log(bounds, "Bounds");


  return (
    <>
      <rect
        className="fill-transparent stroke-blue-500 stroke-1
        pointer-events-none"
        x={0}
        y={0}
        width={bounds.width}
        height={bounds.height}
        style={{
          transform:`translate(${bounds.x}px,${bounds.y}px)`
        }}
      />
      {isShowingHandles &&(
        <>
          <rect
            className="fill-white stroke-blue-500 stroke-1"
            x={0}
            y={0}
            style={{
              transform:`translate(${bounds.x - HANDLE_WIDTH/2}px,${bounds.y - HANDLE_WIDTH/2}px)`,
              cursor:"nwse-resize",
              width:`${HANDLE_WIDTH}px`,
              height:`${HANDLE_WIDTH}px`
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Top + Side.Left,bounds);
            }}
          />
          <rect
            className="fill-white stroke-blue-500 stroke-1"
            x={0}
            y={0}
            style={{
              transform:`translate(${bounds.x + bounds.width/2 - HANDLE_WIDTH/2}px,${bounds.y - HANDLE_WIDTH/2}px)`,
              cursor:"ns-resize",
              width:`${HANDLE_WIDTH}px`,
              height:`${HANDLE_WIDTH}px`
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Top,bounds);
            }}
          />
          <rect
            className="fill-white stroke-blue-500 stroke-1"
            x={0}
            y={0}
            style={{
              transform:`translate(${bounds.x + bounds.width - HANDLE_WIDTH/2}px,${bounds.y+ bounds.height - HANDLE_WIDTH/2}px)`,
              cursor:"ns-resize",
              width:`${HANDLE_WIDTH}px`,
              height:`${HANDLE_WIDTH}px`
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Right + Side.Bottom,bounds);
            }}
          />
          <rect
            className="fill-white stroke-blue-500 stroke-1"
            x={0}
            y={0}
            style={{
              transform:`translate(${bounds.x - HANDLE_WIDTH/2 + bounds.width }px,${bounds.y - HANDLE_WIDTH/2}px)`,
              cursor:"nesw-resize",
              width:`${HANDLE_WIDTH}px`,
              height:`${HANDLE_WIDTH}px`
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Top + Side.Right,bounds);
            }}
          />

          <rect
            className="fill-white stroke-blue-500 stroke-1"
            x={0}
            y={0}
            style={{
              transform:`translate(${bounds.x - HANDLE_WIDTH/2 + bounds.width }px,${bounds.y - HANDLE_WIDTH/2 + bounds.height/2}px)`,
              cursor:"ew-resize",
              width:`${HANDLE_WIDTH}px`,
              height:`${HANDLE_WIDTH}px`
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Right,bounds);
            }}
          />
          
          <rect
            className="fill-white stroke-blue-500 stroke-1"
            x={0}
            y={0}
            style={{
              transform:`translate(
                ${bounds.x - HANDLE_WIDTH/2 +bounds.width}px,
                ${bounds.y - HANDLE_WIDTH/2 + bounds.height}px)`,
              cursor:"nwse-resize",
              width:`${HANDLE_WIDTH}px`,
              height:`${HANDLE_WIDTH}px`
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Right + Side.Bottom,bounds);
            }}
          />

          <rect
            className="fill-white stroke-blue-500 stroke-1"
            x={0}
            y={0}
            style={{
              transform:`translate(
                ${bounds.x - HANDLE_WIDTH/2 +bounds.width/2}px,
                ${bounds.y - HANDLE_WIDTH/2 + bounds.height}px)`,
              cursor:"ns-resize",
              width:`${HANDLE_WIDTH}px`,
              height:`${HANDLE_WIDTH}px`
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Bottom,bounds);
            }}
          />

          <rect
            className="fill-white stroke-blue-500 stroke-1"
            x={0}
            y={0}
            style={{
              transform:`translate(
                ${bounds.x - HANDLE_WIDTH/2}px,
                ${bounds.y - HANDLE_WIDTH/2 + bounds.height}px)`,
              cursor:"nesw-resize",
              width:`${HANDLE_WIDTH}px`,
              height:`${HANDLE_WIDTH}px`
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Left + Side.Bottom,bounds);
            }}
          />

          <rect
            className="fill-white stroke-blue-500 stroke-1"
            x={0}
            y={0}
            style={{
              transform:`translate(
                ${bounds.x - HANDLE_WIDTH/2}px,
                ${bounds.y - HANDLE_WIDTH/2 + bounds.height/2}px)`,
              cursor:"ew-resize",
              width:`${HANDLE_WIDTH}px`,
              height:`${HANDLE_WIDTH}px`
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onResizeHandlePointerDown(Side.Left,bounds);
            }}
          />

         </>
      )}
    </>
  );
});

SelectionBox.displayName = "SelectionBox";