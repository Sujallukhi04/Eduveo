import { cn, colotToCss } from '@/lib/utils';
import ContentEditable , {ContentEditableEvent} from "react-contenteditable";
import { TextLayer } from "@/types/canvas";
import { useMutation } from '@liveblocks/react';

const calculateFontSize = (width: number,height:number) => {
  const maxFontSize = 96;
  const scaleFactor = 0.5;

  const fontSizeBasedOnWidth = width * scaleFactor;
  const fontSizeBasedOnHeight = height * scaleFactor;

  return Math.min(maxFontSize , fontSizeBasedOnWidth, fontSizeBasedOnHeight);
}

interface TextProps {
  id:string;
  layer:TextLayer;
  onLayerPointerDown:(e:React.PointerEvent,id:string)=> void;
  selectionColor?:string;
}

export const Text = ({
  id,
  layer,
  onLayerPointerDown,
  selectionColor
}:TextProps) => {
  const {x,y,width,height,fill,value} = layer;

  const updateValue = useMutation((
    {storage},
    newValue:string
  )=>{
    const liveLayers = storage.get("layers");
    //@ts-ignore
    liveLayers?.get(id)?.set("value",newValue);
  },[]);

  const handleContentChange = (e: ContentEditableEvent) => {
    updateValue(e.target.value);
  }

  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      onPointerDown={(e) => onLayerPointerDown(e, id)}
      style={{
        outline:selectionColor? `1px solid ${selectionColor}`:"none",
        fontSize:calculateFontSize(width,height)
      }}
    >
      <ContentEditable
        html={value||"Text"}
        onChange={handleContentChange}
        className="h-full w-full flex items-center justify-center text-center drop-shadow-md outline-none font-kamal"
        style={{
          color:fill?colotToCss(fill):"#000"
        }}
      />
    </foreignObject>
  );
};