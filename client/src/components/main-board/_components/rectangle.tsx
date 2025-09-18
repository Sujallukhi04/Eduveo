import { colotToCss } from "@/lib/utils";
import { ReactangleLayer } from "@/types/canvas";

interface ReactangleProps {
  id:string,
  layer:ReactangleLayer;
  onLayerPointerDown:(e:React.PointerEvent,id:string)=> void;
  selectionColor?:string;
}

export const Rectangle = ({
  id,
  layer,
  onLayerPointerDown,
  selectionColor
}:ReactangleProps) => {
  const {x,y,width,height,fill}=layer;

  return(
    <rect
    className="drop-shadow-md"
    onPointerDown={(e) => onLayerPointerDown(e, id)}
    x={x} // Use x from the layer
    y={y} // Use y from the layer
    width={width}
    height={height}
    fill={fill?colotToCss(fill):"#000"} // Default to black if no fill is specified
    stroke={selectionColor||"transparent"}
  />
  )
}