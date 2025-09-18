import { useMutation, useSelf } from "@liveblocks/react/suspense";

export const useDeleteLayers = () => {
  const selection = useSelf((me) => me.presence.selection);

  return useMutation(({ storage,setMyPresence }) => {
    const livelayers = storage.get("layers");
    const livelayersids = storage.get("layerIds");

    if(!livelayers || !livelayersids || !selection) return;
    for(const id of selection) {
      livelayers?.delete(id);
      
      const index = livelayersids?.indexOf(id);
      if(index!==-1) {
        livelayersids?.delete(index);
      }
    }

    setMyPresence({ selection: [] },{addToHistory:true});
  }, [selection]);
}
