import { Camera, Color, Layer, LayerType, PathLayer, Point, Side, XYWH } from "@/types/canvas";
import { clsx, type ClassValue } from "clsx"
import React from "react";
import { twMerge } from "tailwind-merge"

const COLORS = [
  "#FF5733", // Red-Orange
  "#33FF57", // Green
  "#3357FF", // Blue
  "#F1C40F", // Yellow
  "#8E44AD", // Purple
  "#1ABC9C", // Turquoise
  "#E74C3C", // Red
  "#16A085", // Dark Green
  "#2C3E50", // Dark Blue
  "#F39C12", // Amber
  "#DB2777", // Pink
];


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function connectionIdToColor(connectionId: number):string {
  const index = connectionId % COLORS.length;
  return COLORS[index];
}

export function pointerEventToCanvasPoint(
  e:React.PointerEvent,
  camera:Camera,
){
  return {
    x:Math.round(e.clientX) - camera.x,
    y:Math.round(e.clientY) - camera.y
  }
}

export function colotToCss(color:Color){
  return `#${color.r.toString(16).padStart(2,"0")}${color.g.toString(16).padStart(2,"0")}${color.b.toString(16).padStart(2,"0")}`;
}

export function resizeBounds(bounds:XYWH,corner:Side,point:Point):XYWH {
  const result = {
    x:bounds.x,
    y:bounds.y,
    width:bounds.width,
    height:bounds.height
  }

  if((corner & Side.Left) === Side.Left){
    result.x=Math.min(point.x,bounds.x+bounds.width);
    result.width=Math.abs(bounds.x+bounds.width-point.x);
  }
  if((corner & Side.Right) === Side.Right){
    result.x=Math.min(point.x,bounds.x);
    result.width=Math.abs(point.x -bounds.x);
  }
  if((corner & Side.Top) === Side.Top){
    result.y=Math.min(point.y,bounds.y+bounds.height);
    result.height=Math.abs(bounds.y+bounds.height-point.y);
  }
  if((corner & Side.Bottom) === Side.Bottom){
    result.y=Math.min(point.y,bounds.y);
    result.height=Math.abs(point.y -bounds.y);
  }


  return result;
}

export function findIntersectingLayerWithRectangle(
  layerIds:readonly string[],
  layers:ReadonlyMap<string,Layer>,
  a:Point,
  b:Point
){
  const rect = {
    x:Math.min(a.x,b.x),
    y:Math.min(a.y,b.y),
    width:Math.abs(a.x-b.x),
    height:Math.abs(a.y-b.y)
  };

  const ids=[];

  for(const layerId of layerIds){
    const layer = layers.get(layerId);

    if(!layer){
      continue;
    }

    const {x,y,height,width}=layer;

    if(
      rect.x < x + width &&
      rect.x + rect.width > x &&
      rect.y < y + height &&
      rect.y + rect.height > y
    ){
      ids.push(layerId);
    }
  }

  return ids;
}

export function getContrastingTextColor(color:Color){
  const yiq = ((color.r * 299) + (color.g * 587) + (color.b * 114)) / 1000;
  return yiq >= 128 ? "#000000" : "#FFFFFF";
}

export function penPointsToPathLayer(
  points:number[][],
  color:Color
):PathLayer{
  if(points.length < 2){
    throw new Error("Path must have at least 2 points");
  }

  let left = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for(const [x,y] of points){
    
    if(left>x)
      left=x;

    if(top>y)
      top=y;

    if(right<x)
      right=x;

    if(bottom<y)
      bottom=y;

  }
  return {
    type:LayerType.Path,
    x:left,
    y:top,
    width:right-left,
    height:bottom-top,
    fill:color,
    points:points.map(([X,y,pressure]) => [X-left,y-top,pressure])
  }
}

export function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke || stroke.length === 0) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
}

