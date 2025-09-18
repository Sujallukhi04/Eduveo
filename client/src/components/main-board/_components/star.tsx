import { colotToCss } from "@/lib/utils";
import { LayerType, StarLayer } from "@/types/canvas";


interface StarProps {
  id: string,
  layer: StarLayer,
  onLayerPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Star = ({
  id,
  layer,
  onLayerPointerDown,
  selectionColor
}: StarProps) => {
  const { x, y, width, height, fill, points: numPoints = 5 } = layer;
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const outerRadius = Math.min(width, height) / 2;
  const innerRadius = outerRadius * 0.4; // Inner radius for the star points
  
  let pointsString = "";
  
  // Calculate points for the star
  for (let i = 0; i < numPoints * 2; i++) {
    // Alternate between outer and inner radius
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * i) / numPoints;
    
    const pointX = centerX + radius * Math.sin(angle);
    const pointY = centerY - radius * Math.cos(angle);
    
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