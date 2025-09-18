import { colotToCss } from "@/lib/utils";
import { DiamondLayer, LayerType } from "@/types/canvas";

// Add this to your types file

interface DiamondProps {
  id: string,
  layer: DiamondLayer,
  onLayerPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Diamond = ({
  id,
  layer,
  onLayerPointerDown,
  selectionColor
}: DiamondProps) => {
  const { x, y, width, height, fill } = layer;
  
  // Calculate diamond points (centered rhombus)
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  // Four points: top, right, bottom, left
  const points = `
    ${centerX},${y}
    ${x + width},${centerY}
    ${centerX},${y + height}
    ${x},${centerY}
  `;
  
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