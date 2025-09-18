import { colotToCss } from "@/lib/utils";
import { HexagonLayer, LayerType } from "@/types/canvas";

// Add this to your types file

interface HexagonProps {
  id: string,
  layer: HexagonLayer,
  onLayerPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Hexagon = ({
  id,
  layer,
  onLayerPointerDown,
  selectionColor
}: HexagonProps) => {
  const { x, y, width, height, fill } = layer;
  
  // Calculate hexagon points
  // For a regular hexagon with width and height constraints
  const w = width;
  const h = height;
  const centerX = x + w/2;
  const centerY = y + h/2;
  
  // Distance from center to each point (using the smaller of width or height)
  const radius = Math.min(w, h) / 2;
  
  // Hexagon points calculation (6 points around the center)
  let points = "";
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i - 30; // Start at -30 degrees for flat-topped hexagon
    const angleRad = (Math.PI / 180) * angleDeg;
    const pointX = centerX + radius * Math.cos(angleRad);
    const pointY = centerY + radius * Math.sin(angleRad);
    points += `${pointX},${pointY} `;
  }
  
  return (
    <polygon
      className="drop-shadow-md"
      onPointerDown={(e) => onLayerPointerDown(e, id)}
      points={points.trim()}
      fill={fill ? colotToCss(fill) : "#000"}
      stroke={selectionColor || "transparent"}
      strokeWidth={1}
    />
  );
};