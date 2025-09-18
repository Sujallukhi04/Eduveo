import { getSvgPathFromStroke } from "@/lib/utils";
import getStroke from "perfect-freehand";

interface pathPops{
  x:number
  y:number
  points:number[][]
  fill:string
  onPointerDown?:(e:React.PointerEvent) => void;
  stroke?:string 
}

export const Path=({
  x,
  y,
  points,
  fill,
  onPointerDown,
  stroke
}:pathPops)=>{
  console.log("Layer Points:", points);
console.log("Layer X, Y:", x, y);
console.log("Layer Fill:", fill);
const strokeData = points ? getStroke(points, {
  size: 16,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
}) : [];

console.log("Processed Stroke for Layer:", strokeData);
console.log("SVG Path for Layer:", getSvgPathFromStroke(strokeData));


  return (
    <path
      className="drop-shadow-md"
      onPointerDown={onPointerDown}
      d={getSvgPathFromStroke(getStroke(points,{
        size:16,
        thinning:0.5,
        smoothing:0.5,
        streamline:0.5,
        })
      )}
      style={{
        transform:`translate(${x}px,${y}px)`
      }}
      x={0}
      y={0}
      fill={fill||"black"}
      stroke={fill||"black"}
      strokeWidth={1}
    />

  )
}