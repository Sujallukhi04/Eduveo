import { colotToCss } from "@/lib/utils";
import { ArrowLineLayer } from "@/types/canvas";

interface ArrowLineProps {
  id: string,
  layer: ArrowLineLayer,
  onLayerPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const ArrowLine = ({
  id,
  layer,
  onLayerPointerDown,
  selectionColor
}: ArrowLineProps) => {
  const { x, y, width, height, fill, strokeWidth = 2 } = layer;
  
  // Calculate angle for arrow head
  const angle = Math.atan2(height, width);
  const arrowLength = 15;
  
  const endX = x + width;
  const endY = y + height;
  
  // Calculate arrow head points
  const arrow1X = endX - arrowLength * Math.cos(angle - Math.PI/6);
  const arrow1Y = endY - arrowLength * Math.sin(angle - Math.PI/6);
  const arrow2X = endX - arrowLength * Math.cos(angle + Math.PI/6);
  const arrow2Y = endY - arrowLength * Math.sin(angle + Math.PI/6);
  
  return (
    <g
      onPointerDown={(e) => onLayerPointerDown(e, id)}
      style={{ 
        outline: selectionColor ? `2px solid ${selectionColor}` : "none",
      }}
    >
      {/* Main line */}
      <line
        x1={x}
        y1={y}
        x2={endX}
        y2={endY}
        stroke={fill ? colotToCss(fill) : "#000"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className="drop-shadow-md"
      />
      
      {/* Arrow head */}
      <polyline
        points={`${arrow1X},${arrow1Y} ${endX},${endY} ${arrow2X},${arrow2Y}`}
        stroke={fill ? colotToCss(fill) : "#000"}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </g>
  );
};
