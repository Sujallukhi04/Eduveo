// StraightLine.tsx
import { colotToCss } from "@/lib/utils";
import { StraightLineLayer } from "@/types/canvas";

interface StraightLineProps {
  id: string,
  layer: StraightLineLayer,
  onLayerPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const StraightLine = ({
  id,
  layer,
  onLayerPointerDown,
  selectionColor
}: StraightLineProps) => {
  const { x, y, width, height, fill, strokeWidth = 2 } = layer;
  
  return (
    <line
      className="drop-shadow-md"
      onPointerDown={(e) => onLayerPointerDown(e, id)}
      x1={x}
      y1={y}
      x2={x + width}
      y2={y + height}
      stroke={fill ? colotToCss(fill) : "#000"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
      strokeDasharray={selectionColor ? "5,5" : "none"}
      style={{ 
        outline: selectionColor ? `2px solid ${selectionColor}` : "none",
      }}
    />
  );
};
