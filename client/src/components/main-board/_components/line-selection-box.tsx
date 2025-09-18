import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { LayerType, Side, XYWH } from "@/types/canvas";
import { useSelf, useStorage } from "@liveblocks/react/suspense";
import { memo } from "react";

interface LineSelectionBoxProps {
  onResizeHandlePointerDown: (corner: Side, initialBounds: XYWH) => void;
}

const HANDLE_WIDTH = 8;

export const LineSelectionBox = memo(({ onResizeHandlePointerDown }: LineSelectionBoxProps) => {
  // Get the selected layer ID
  const soleLayerId = useSelf((me) => {
    const selection = me.presence.selection;
    return selection.length === 1 ? selection[0] : null;
  });

  // Get the layer data
  const layer = useStorage((root) => {
    return soleLayerId ? root.layers?.get(soleLayerId) : null;
  });

  // Get the selection bounds
  const bounds = useSelectionBounds();

  // Check if the layer is a line type - must be done after all hooks
  if (!soleLayerId || !layer || !bounds) return null;

  const isLineLayer = [
    LayerType.StraightLine,
    LayerType.ArrowLine,
    LayerType.CurvedLine,
    LayerType.ZigzagLine
  ].includes(layer.type);

  // If not a line layer, don't render this selection box
  if (!isLineLayer) return null;

  // For curved lines, we need to get the control point
  const isCurvedLine = layer.type === LayerType.CurvedLine;
  const controlPointX = isCurvedLine ? layer.controlPointX || bounds.x + bounds.width / 2 : 0;
  const controlPointY = isCurvedLine ? layer.controlPointY || bounds.y - bounds.height / 2 : 0;

  // Generate zigzag points if needed
  const generateZigzagPoints = (bounds: XYWH, segments: number): string => {
    const { x, y, width, height } = bounds;
    const segmentWidth = width / segments;
    
    let points = `${x},${y}`;
    for (let i = 1; i <= segments; i++) {
      const pointX = x + i * segmentWidth;
      const pointY = y + (i % 2 === 0 ? 0 : height);
      points += ` ${pointX},${pointY}`;
    }
    
    return points;
  };

  return (
    <>
      {/* For straight and arrow lines, just show a line */}
      {(layer.type === LayerType.StraightLine || layer.type === LayerType.ArrowLine) && (
        <line
          className="stroke-blue-500 stroke-1 pointer-events-none"
          x1={bounds.x}
          y1={bounds.y}
          x2={bounds.x + bounds.width}
          y2={bounds.y + bounds.height}
        />
      )}
      
      {/* For curved lines, show the curve path */}
      {layer.type === LayerType.CurvedLine && (
        <path
          className="stroke-blue-500 stroke-1 pointer-events-none fill-transparent"
          d={`M${bounds.x},${bounds.y} Q${controlPointX},${controlPointY} ${bounds.x + bounds.width},${bounds.y + bounds.height}`}
        />
      )}
      
      {/* For zigzag lines, show the zigzag path */}
      {layer.type === LayerType.ZigzagLine && (
        <polyline
          className="stroke-blue-500 stroke-1 pointer-events-none fill-transparent"
          points={generateZigzagPoints(bounds, layer.segments || 4)}
        />
      )}
      
      {/* Start point handle */}
      <rect
        className="fill-white stroke-blue-500 stroke-1"
        x={0}
        y={0}
        style={{
          transform: `translate(${bounds.x - HANDLE_WIDTH/2}px, ${bounds.y - HANDLE_WIDTH/2}px)`,
          cursor: "move",
          width: `${HANDLE_WIDTH}px`,
          height: `${HANDLE_WIDTH}px`
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onResizeHandlePointerDown(Side.Left + Side.Top, bounds);
        }}
      />
      
      {/* End point handle */}
      <rect
        className="fill-white stroke-blue-500 stroke-1"
        x={0}
        y={0}
        style={{
          transform: `translate(${bounds.x + bounds.width - HANDLE_WIDTH/2}px, ${bounds.y + bounds.height - HANDLE_WIDTH/2}px)`,
          cursor: "move",
          width: `${HANDLE_WIDTH}px`,
          height: `${HANDLE_WIDTH}px`
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onResizeHandlePointerDown(Side.Right + Side.Bottom, bounds);
        }}
      />
      
      {/* Control point handle for curved lines */}
      {isCurvedLine && (
        <rect
          className="fill-white stroke-blue-500 stroke-1"
          x={0}
          y={0}
          style={{
            transform: `translate(${controlPointX - HANDLE_WIDTH/2}px, ${controlPointY - HANDLE_WIDTH/2}px)`,
            cursor: "move",
            width: `${HANDLE_WIDTH}px`,
            height: `${HANDLE_WIDTH}px`
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            // Special handling for control point
            onResizeHandlePointerDown(Side.Top, {
              ...bounds,
              x: controlPointX,
              y: controlPointY
            });
          }}
        />
      )}
    </>
  );
});

LineSelectionBox.displayName = "LineSelectionBox";
