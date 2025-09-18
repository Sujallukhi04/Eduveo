import { LayerType } from "@/types/canvas";
import { useStorage } from "@liveblocks/react/suspense";
import React, { memo } from "react";
import { Rectangle } from "./rectangle";
import { Ellipse } from "./ellipse";
import { Text } from "./text";
import { Note } from "./note";
import { Path } from "./Path";
import { colotToCss } from "@/lib/utils";
import { Triangle } from "./triangle";
import { Star } from "./star";
import { Diamond } from "./diamond";
import { Hexagon } from "./hexagon";
import { Pentagon } from "./pentagon";
import { StraightLine } from "./straight-line";
import { ArrowLine } from "./arrow-line";
import { CurvedLine } from "./curved-line";
import { ZigzagLine } from "./zigzag-line";
interface LayerPreviewProps {
  id:string;
  onLayerPointerDown:(e:React.PointerEvent,layerId:string)=> void;
  selectionColor?:string;
}

export const LayerPreview = memo(({
  id,
  onLayerPointerDown,
  selectionColor
}:LayerPreviewProps) => {

  //@ts-ignore
  const layer = useStorage((root)=>root?.layers?.get(id));

  if(!layer) return null;

  console.log({layer},"LayerPreview");
  
  switch(layer.type){
    case LayerType.Path:
      return (
        <Path
          key={id}
          points={layer.points!}
          onPointerDown={(e)=>onLayerPointerDown(e,id)}
          x={layer.x}
          y={layer.y}
          fill={layer.fill?colotToCss(layer.fill):"#000"}
          stroke={selectionColor}
        />
      )
    case LayerType.Note:
      return (
        <Note 
          id={id}
          layer={layer}
          onLayerPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      )
    case LayerType.Ellipse:
      return (
        <Ellipse 
          id={id}
          layer={layer}
          onLayerPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      )
    case LayerType.Text:
      return (
        <Text 
          id={id}
          layer={layer}
          onLayerPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      )
    case LayerType.Reactangle:
      return (
          <Rectangle
            id={id}
            onLayerPointerDown={onLayerPointerDown}
            layer={layer}
            selectionColor={selectionColor}
          />
      );
    case LayerType.Triangle:
      return (
        <Triangle
          id={id}
          onLayerPointerDown={onLayerPointerDown}
          layer={layer}
          selectionColor={selectionColor}
        />
    )
    case LayerType.Star:
      return (
        <Star
          id={id}
          onLayerPointerDown={onLayerPointerDown}
          layer={layer}
          selectionColor={selectionColor}
        />
      )
    case LayerType.Diamond:
      return (
        <Diamond
          id={id}
          onLayerPointerDown={onLayerPointerDown}
          layer={layer}
          selectionColor={selectionColor}
        />
    )
    case LayerType.Hexagon:
      return (
        <Hexagon
          id={id}
          onLayerPointerDown={onLayerPointerDown}
          layer={layer}
          selectionColor={selectionColor}
        />
      )
    case LayerType.Pentagon:
      return (
        <Pentagon
          id={id}
          onLayerPointerDown={onLayerPointerDown}
          layer={layer}
          selectionColor={selectionColor}
        />
      )
    // New line types
    case LayerType.StraightLine:
      return (
        <StraightLine
          id={id}
          layer={layer}
          onLayerPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      );
    case LayerType.ArrowLine:
      return (
        <ArrowLine
          id={id}
          layer={layer}
          onLayerPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      );
    case LayerType.CurvedLine:
      return (
        <CurvedLine
          id={id}
          layer={layer}
          onLayerPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      );
    case LayerType.ZigzagLine:
      return (
        <ZigzagLine
          id={id}
          layer={layer}
          onLayerPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      );
    default:
      console.warn("Unknown layer type",layer);
      return null;
  }
});

LayerPreview.displayName = "LayerPreview";