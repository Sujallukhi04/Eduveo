import { colotToCss } from "@/lib/utils";
import { LayerType, PentagonLayer } from "@/types/canvas";

// Add this to your types file
interface PentagonProps {
  id: string,
  layer: PentagonLayer,
  onLayerPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Pentagon = ({
  id,
  layer,
  onLayerPointerDown,
  selectionColor
}: PentagonProps) => {
  const { x, y, width, height, fill } = layer;
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const radius = Math.min(width, height) / 2;
  
  let pointsString = "";
  
  // Calculate points for the pentagon (5 points)
  for (let i = 0; i < 5; i++) {
    // Start at -90 degrees (top point)
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    
    const pointX = centerX + radius * Math.cos(angle);
    const pointY = centerY + radius * Math.sin(angle);
    
    pointsString += `${pointX},${pointY} `;
  }
  
  return (
    <polygon
      className="drop-shadow-md"
      onPointerDown={(e) => onLayerPointerDown(e, id)}
      points={pointsString.trim()}
      fill={fill ? colotToCss(fill) : "#000"}
      stroke={selectionColor || "transparent"}
      strokeWidth={1}
    />
  );
};