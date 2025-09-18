import { colotToCss } from "@/lib/utils";
import { LayerType, TriangleLayer } from "@/types/canvas";

// We'll need to add this to your types file

interface TriangleProps {
  id: string,
  layer: TriangleLayer,
  onLayerPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Triangle = ({
  id,
  layer,
  onLayerPointerDown,
  selectionColor
}: TriangleProps) => {
  const { x, y, width, height, fill } = layer;
  
  // Define the points for the triangle
  // Bottom left, bottom right, top center
  const points = `${x},${y + height} ${x + width},${y + height} ${x + width/2},${y}`;
  
  return (
    <polygon
      className="drop-shadow-md"
      onPointerDown={(e) => onLayerPointerDown(e, id)}
      points={points}
      fill={fill ? colotToCss(fill) : "#000"}
      stroke={selectionColor || "transparent"}
      strokeWidth={1}
    />
  );
};