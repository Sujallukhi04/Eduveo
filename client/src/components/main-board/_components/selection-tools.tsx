import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { Camera, Color } from "@/types/canvas";
import { useMutation, useSelf } from "@liveblocks/react/suspense";
import { memo } from "react";
import { ColorPicker } from "./color-picker";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import { Hint } from "../../hint";
import { BringToFront, SendToBack, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelectionToolsProps {
  camera:Camera,
  setLastUsedColor:(color:Color)=>void,
}

export const SelectionTools = memo(({ camera, setLastUsedColor }: SelectionToolsProps) => {
  const selection = useSelf((me) => me.presence.selection);

  const moveToBack = useMutation((
    {storage}
  )=>{
    const liveLayersIds = storage.get("layerIds");

    const indices:number[]=[];
    //@ts-ignore
    const arr = liveLayersIds?.toImmutable();

    for(let i=0;i<arr.length;i++){
          //@ts-ignore
      if(selection?.includes(arr[i])){
        indices.push(i);
      }
    }

    for(let i=0;i<indices.length;i++){
          //@ts-ignore
      liveLayersIds?.move(indices[i],i);
    }

  },[selection]);

  const moveToFront = useMutation(({ storage }) => {
    const liveLayersIds = storage.get("layerIds");
  
    const indices: number[] = [];
        //@ts-ignore
    const arr = liveLayersIds?.toImmutable();
  
    for (let i = 0; i < arr.length; i++) {
          //@ts-ignore
      if (selection?.includes(arr[i])) {
        indices.push(i);
      }
    }
  
    // Move each selected item to its correct position near the end
    const totalLayers = arr.length;
    indices.forEach((index, i) => {
          //@ts-ignore
      liveLayersIds?.move(index, totalLayers - indices.length + i);
    });
  
  }, [selection]);
  

  const setFill = useMutation(
    ({ storage }, fill: Color) => {
      const liveLayers = storage.get("layers");

      setLastUsedColor(fill);
    //@ts-ignore
      selection?.forEach((layerId) => {
            //@ts-ignore
        liveLayers?.get(layerId)?.set("fill", fill);
      });
    },
    [selection, setLastUsedColor]
  );

  const deleteLayers = useDeleteLayers();

  const selectionBounds = useSelectionBounds();

  if (!selectionBounds) return null;

  const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
  const y = selectionBounds.y + camera.y;

  console.log('x:', x, 'y:', y); // Check if x and y are correct values

  return (
    <div
      className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-none"
      style={{
        transform: `translateX(calc(${x}px - 50%)) translateY(calc(${y - 16}px - 100%))`,
      }}
    >
      <ColorPicker onChange={setFill} />
      <div className="flex flex-col gap-y-0.5">
        <Hint lable={"Bring to front"}>
          <Button
            variant={"board"}
            size={"icon"}
            onClick={moveToFront}
          >
            <BringToFront/>
          </Button>
        </Hint>
        <Hint lable={"Send to back"} side="bottom">
          <Button
            variant={"board"}
            size={"icon"}
            onClick={moveToBack}
          >
            <SendToBack/>
          </Button>
        </Hint>
      </div>
      <div className="flex items-center pl-2 ml-2 border-l border-neutral-200">
        <Hint lable="Delete">
          <Button variant={"board"} size="icon" onClick={deleteLayers}>
            <Trash2 />
          </Button>
        </Hint>
      </div>
    </div>
  );
});

SelectionTools.displayName = "SelectionTools";