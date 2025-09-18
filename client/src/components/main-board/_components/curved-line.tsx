import { colotToCss } from "@/lib/utils";
import { CurvedLineLayer } from "@/types/canvas";

interface CurvedLineProps {
  id: string,
  layer: CurvedLineLayer,
  onLayerPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const CurvedLine = ({
  id,
  layer,
  onLayerPointerDown,
  selectionColor
}: CurvedLineProps) => {
  const { x, y, width, height, fill, strokeWidth = 2, controlPointX, controlPointY } = layer;
  
  // Default control point if not provided
  const ctrlX = controlPointX ?? x + width/2;
  const ctrlY = controlPointY ?? y - height/2;
  
  // Create a bezier curve path
  const pathData = `M ${x} ${y} Q ${ctrlX} ${ctrlY}, ${x + width} ${y + height}`;
  
  return (
    <path
      className="drop-shadow-md"
      onPointerDown={(e) => onLayerPointerDown(e, id)}
      d={pathData}
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
