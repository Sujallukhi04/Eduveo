import { colotToCss } from "@/lib/utils";
import { ZigzagLineLayer } from "@/types/canvas";

interface ZigzagLineProps {
  id: string,
  layer: ZigzagLineLayer,
  onLayerPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const ZigzagLine = ({
  id,
  layer,
  onLayerPointerDown,
  selectionColor
}: ZigzagLineProps) => {
  const { x, y, width, height, fill, strokeWidth = 2, segments = 4 } = layer;
  
  // Calculate points for zigzag line
  let pathData = `M ${x} ${y}`;
  const segmentWidth = width / segments;
  const segmentHeight = height / segments;
  
  for (let i = 1; i <= segments; i++) {
    const newX = x + i * segmentWidth;
    const newY = y + (i % 2 === 0 ? 0 : height);
    pathData += ` L ${newX} ${newY}`;
  }
  
  return (
    <path
      className="drop-shadow-md"
      onPointerDown={(e) => onLayerPointerDown(e, id)}
      d={pathData}
      stroke={fill ? colotToCss(fill) : "#000"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      strokeDasharray={selectionColor ? "5,5" : "none"}
      style={{ 
        outline: selectionColor ? `2px solid ${selectionColor}` : "none",
      }}
    />
  );
};