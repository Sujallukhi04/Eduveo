import { cn, colotToCss, getContrastingTextColor } from '@/lib/utils';
import ContentEditable , {ContentEditableEvent} from "react-contenteditable";
import { NoteLayer } from "@/types/canvas";
import { useMutation } from '@liveblocks/react';


const calculateFontSize = (width: number,height:number) => {
  const maxFontSize = 96;
  const scaleFactor = 0.15;

  const fontSizeBasedOnWidth = width * scaleFactor;
  const fontSizeBasedOnHeight = height * scaleFactor;

  return Math.min(maxFontSize , fontSizeBasedOnWidth, fontSizeBasedOnHeight);
}

interface NoteProps {
  id:string;
  layer:NoteLayer;
  onLayerPointerDown:(e:React.PointerEvent,id:string)=> void;
  selectionColor?:string;
}

export const Note = ({
  id,
  layer,
  onLayerPointerDown,
  selectionColor
}:NoteProps) => {
  const {x,y,width,height,fill,value} = layer;

  console.log({id,layer},"NOTE");

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
        backgroundColor:fill?colotToCss(fill):"#000",
        fontSize:calculateFontSize(width,height)
      }}
      className='shadow-md drop-shadow-xl'
    >
      <ContentEditable
        html={value || "Text"}
        onChange={handleContentChange}
        className=
          "h-full w-full flex items-center justify-center text-center outline-none font-kamal"
        style={{
          color:fill?getContrastingTextColor(fill):"#000"
        }}
      />
    </foreignObject>
  );
};