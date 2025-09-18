import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
import {Camera, CanvasMode, CanvasState, Color, EllipseLayer, LayerType, NoteLayer, PathLayer, Point, ReactangleLayer, TextLayer,Layer, Side, XYWH} from "@/types/canvas";
import { useCanRedo, useCanUndo, useHistory, useMutation, useOthersMapped, useStorage } from "@liveblocks/react/suspense";
import { CursorPresence } from "./cursor-presence";
import { colotToCss, connectionIdToColor, findIntersectingLayerWithRectangle, penPointsToPathLayer, pointerEventToCanvasPoint, resizeBounds } from "@/lib/utils";
import { nanoid } from "nanoid";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { useSelf } from "@liveblocks/react";
import { Path } from "./Path";
import { useDisableSchrollBounce } from "../../../hooks/use-sisable-scroll-bounce";
import { useDeleteLayers } from "../../../hooks/use-delete-layers";
import { useParams } from "react-router";

const MAX_LAYERS = 100;

export const Canvas = () => { 

  const {boardId} = useParams();

  const layerIds = useStorage((root)=>root.layerIds);

  const pencilDraft = useSelf((me)=>me.presence.pencilDraft);

  const [canvasState,setCanvasState] = useState<CanvasState>({mode:CanvasMode.None});

  const [camera,setCamera] = useState<Camera>({x:0,y:0});

  const [lastUsedColor,setLastUsedColor] = useState<Color>({
    r:0,
    g:0,
    b:0
  });

  
  useDisableSchrollBounce();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const history = useHistory();
  const deleteLayers = useDeleteLayers();
  
  useEffect(()=>{
    function inKeyDown(e:KeyboardEvent){
      switch(e.key){
        case "z":{
          if(e.ctrlKey || e.metaKey){
            if(e.shiftKey){
              history.redo();
            }else{
              history.undo();
            }
            break;
          }
        }
        case "y":{
          if(e.ctrlKey || e.metaKey){
              history.redo();
            break;
          }
        }
        case "Delete":{  
          deleteLayers();
          break;
        }
      }
    }

    document.addEventListener("keydown",inKeyDown);

    return ()=>{
      document.removeEventListener("keydown",inKeyDown);
    }
  },[deleteLayers,history]);


  const insertLayer = useMutation((
    {storage,setMyPresence},
    layerType:LayerType.Ellipse | LayerType.Reactangle | LayerType.Text | LayerType.Path |LayerType.Note | LayerType.Diamond |LayerType.Hexagon |LayerType.Pentagon |LayerType.Star |LayerType.Triangle |LayerType.StraightLine |LayerType.ArrowLine |LayerType.CurvedLine |LayerType.ZigzagLine,
    position: Point
  )=>{
    const liveLayers = storage.get("layers");
    //@ts-ignore
    if(liveLayers?.size>=MAX_LAYERS){
      return;
    }

    const liveLayersIds = storage.get("layerIds");
    const layerId=nanoid();

    let newlayer =  new LiveObject({
      type: layerType,
      x: position.x,
      y: position.y,
      height: 100,
      width: 100,
      fill: lastUsedColor,
    });

    console.log({newlayer});
    //@ts-ignore
    liveLayersIds?.push(layerId);
    //@ts-ignore
    liveLayers?.set(layerId, newlayer!);

    setMyPresence({selection:[layerId]},{addToHistory:true});
    setCanvasState({mode:CanvasMode.None});

  },[lastUsedColor]);
  // const insertLayer = useMutation(
  //   (
  //     { storage, setMyPresence },
  //     layerType: LayerType,
  //     position: Point
  //   ) => {
  //     const liveLayers = storage.get("layers");
  //     //@ts-ignore
  //     if (liveLayers?.size >= MAX_LAYERS) {
  //       return;
  //     }
  
  //     const liveLayersIds = storage.get("layerIds");
  //     const layerId = nanoid();
  
  //     // Check if the layer is a line type
  //     const isLine = [
  //       LayerType.StraightLine,
  //       LayerType.ArrowLine,
  //       LayerType.CurvedLine,
  //       LayerType.ZigzagLine
  //     ].includes(layerType);
  
  //     let newLayer;
      
  //     if (isLine) {
  //       // For lines, we'll use the existing structure but adapt it for lines
  //       // We'll set the start point at the position and create a temporary end point
  //       newLayer = new LiveObject({
  //         type: layerType,
  //         x: position.x,  // This becomes starting X
  //         y: position.y,  // This becomes starting Y
  //         // Setting a minimal width/height initially - will be updated during drawing
  //         width: 1,  
  //         height: 1,
  //         fill: lastUsedColor,
  //         strokeWidth: 2
  //       });
  
  //       // For curved lines, add control points
  //       if (layerType === LayerType.CurvedLine) {
  //         newLayer.update({
  //           controlPointX: position.x,
  //           controlPointY: position.y - 50 // Default control point above start
  //         });
  //       }
        
  //       // For zigzag lines, add segments
  //       if (layerType === LayerType.ZigzagLine) {
  //         newLayer.update({
  //           segments: 4 // Default number of zigzag segments
  //         });
  //       }
  //     } else {
  //       // For regular shapes, use your existing logic
  //       newLayer = new LiveObject({
  //         type: layerType,
  //         x: position.x,
  //         y: position.y,
  //         height: 100,
  //         width: 100,
  //         fill: lastUsedColor
  //       });
  //     }
  
  //     console.log({ newLayer });
  //     //@ts-ignore
  //     liveLayersIds?.push(layerId);
  //     //@ts-ignore
  //     liveLayers?.set(layerId, newLayer);
  
  //     setMyPresence({ selection: [layerId] }, { addToHistory: true });
      
  //     if (isLine) {
  //       // Enter a drawing mode for lines
  //       setCanvasState({ 
  //         mode: CanvasMode.Pencil,  // Using Pencil mode for drawing lines
  //         layerId: layerId  // You'll need to add this to your CanvasState type
  //       });
  //     } else {
  //       setCanvasState({ mode: CanvasMode.None });
  //     }
  //   },
  //   [lastUsedColor]
  // );

  const translateSelectedLayer = useMutation((
    {storage,self},
    point:Point
  )=>{
    if(canvasState.mode !== CanvasMode.Translating){
      return ;
    }
    const offset={
      x:point.x - canvasState.current.x,
      y:point.y - canvasState.current.y
    }

    const liveLayers = storage.get("layers");

        //@ts-ignore
    for(const id of self?.presence?.selection){
          //@ts-ignore
      const layer = liveLayers?.get(id);
      if(layer){
        layer.update({
          x:layer.get("x") + offset.x,
          y:layer.get("y") + offset.y
        });
      }
    }

    setCanvasState({mode:CanvasMode.Translating,current:point});
  },[canvasState]);

  const unSelectLayer = useMutation((
    {setMyPresence,self}
  )=>{
    //@ts-ignore
    if(self?.presence?.selection?.length>0){
      setMyPresence({selection:[]},{addToHistory:true});
    }

  },[]);

  const updateSelectionNet = useMutation((
    { storage,setMyPresence },
    current:Point,
    origin:Point
  )=>{
    const layers = storage.get("layers");
    setCanvasState({
      mode:CanvasMode.SelectionNet,
      origin,
      current
    });

    const ids = findIntersectingLayerWithRectangle(
      //@ts-ignore
      layerIds,
      new Map(
            //@ts-ignore
        Array.from(layers?.entries()).map(([key, liveObject]) => [key, liveObject.toObject()])
      ),
      origin,
      current
    );

    console.log("SELECTION NET IDS",{ids});

    setMyPresence({selection:ids});
  },[layerIds]);

  const startMultiSelection = useCallback((
    current:Point,
    origin:Point
  )=>{
    if(
      Math.abs(current.x-origin.x) + Math.abs(current.y-origin.y) > 5
    ){
      console.log("ATTEMPTING TO SELECTION NET");
      setCanvasState({
        mode:CanvasMode.SelectionNet,
        origin,
        current
      });
    }
  },[]);

  const insertPath =useMutation((
    {storage,self,setMyPresence}
  )=>{
    const liveLayers = storage.get("layers");
    const { pencilDraft } = self.presence;
    console.log({pencilDraft},"PENCILE-DRAFT INSERTPATH");

    if(
      pencilDraft==null ||
          //@ts-ignore
      pencilDraft.length<2 ||
          //@ts-ignore
      liveLayers?.size>=MAX_LAYERS
    ){
      setMyPresence({pencilDraft:null});
      return; 
    }

    const id = nanoid();
    //@ts-ignore
    liveLayers?.set(id,new LiveObject(penPointsToPathLayer(
          //@ts-ignore
      pencilDraft,
      lastUsedColor
    )));

    const liveLayersIds = storage.get("layerIds");
    //@ts-ignore
    liveLayersIds.push(id);

    setMyPresence({
      pencilDraft:null
    });

    setCanvasState({mode:CanvasMode.Pencil});
    console.log('Finished inserting path');
  },[lastUsedColor,setCanvasState]);

  const startDrawing = useMutation((
    {setMyPresence},
    point:Point,
    Pressure:number,
  )=>{
    console.log("STARTED DRAWING");
    setMyPresence({
      pencilDraft:[[point.x,point.y,Pressure]],
      penColor:lastUsedColor,
    });

  },[lastUsedColor]);
  
  const continueDrawing = useMutation((
    {self,setMyPresence},
    point:Point,
    e:React.PointerEvent,
  )=>{
    const { pencilDraft } = self.presence;

    console.log(pencilDraft)
    if(
      canvasState.mode !== CanvasMode.Pencil ||
      e.button === 1 ||
      pencilDraft == null
    ) {
      return;
    }
    console.log({pencilDraft},"PENCIL-DRAFT-ContinueDrawing");

    setMyPresence({
      cursor:point,
      pencilDraft:
          //@ts-ignore
        pencilDraft.length===1 &&
            //@ts-ignore
        pencilDraft[0][0] === point.x &&
            //@ts-ignore
        pencilDraft[0][1] === point.y 
        ? pencilDraft
        :
            //@ts-ignore
         [...pencilDraft,[point.x,point.y,e.pressure]]
    });
  },[canvasState.mode]);

  const resizeSelectedLayer = useMutation((
    {storage,self},
    point:Point,
  )=>{
    if(canvasState.mode !== CanvasMode.Resizing){
      return ;
    }

    const bounds=resizeBounds(canvasState.initialBounds,canvasState.corner,point);

    const liveLayers = storage.get("layers");
        //@ts-ignore
    const layer = liveLayers?.get(self?.presence?.selection[0]);

    if(layer){
      layer.update(bounds);
    };
  },[canvasState]);

  const onWheel = useCallback((e: React.WheelEvent)=>{
    setCamera((camera)=>({
      x:camera.x - e.deltaX,
      y:camera.y - e.deltaY,
    }))
  },[]);

  const onPointerMove = useMutation((
    {setMyPresence},
    e:React.PointerEvent
  )=>{
    e.preventDefault();
    const current = pointerEventToCanvasPoint(e,camera);

    // console.log({current});
    if(canvasState.mode==CanvasMode.Pressing){
      startMultiSelection(current,canvasState.origin);
    }else if(canvasState.mode==CanvasMode.SelectionNet){
      updateSelectionNet(current,canvasState.origin);
    }else if(canvasState.mode === CanvasMode.Translating){
      //console.log("Translating"); 
      translateSelectedLayer(current);
    }else if(canvasState.mode === CanvasMode.Resizing){
      //console.log("Resizing");
      resizeSelectedLayer(current);
    }else if(canvasState.mode === CanvasMode.Pencil){
      //console.log("Pencil");
      continueDrawing(current,e);
    }
    setMyPresence({cursor:current});
  },[canvasState,resizeSelectedLayer,camera,continueDrawing,startMultiSelection,updateSelectionNet,translateSelectedLayer]);

  const onPointerLeave=useMutation((
    {setMyPresence}
  )=>{
    setMyPresence({cursor:null})
  },[]);

  const onPointerDown = useCallback((e:React.PointerEvent)=>{
    e.preventDefault();
    const current = pointerEventToCanvasPoint(e,camera);

    if(canvasState.mode === CanvasMode.Inserting){
      return;
    }

    if(canvasState.mode === CanvasMode.Pencil){
        startDrawing(current,e.pressure);
        return;
    }

    setCanvasState({
      mode:CanvasMode.Pressing,
      origin:current
    });

  },[camera,canvasState.mode,setCanvasState]);

  const onPointerUp = useMutation((
    {},
    e
  )=>{
    const points = pointerEventToCanvasPoint(e,camera);

    console.log({points,mode:canvasState.mode});
    if(
      canvasState.mode === CanvasMode.None ||
      canvasState.mode === CanvasMode.Pressing 
    ){
      unSelectLayer();
      setCanvasState({
        mode:CanvasMode.None,
      });
    }else if(canvasState.mode===CanvasMode.Pencil){
      insertPath();
    }else if(canvasState.mode === CanvasMode.Inserting ){
      insertLayer(canvasState.layerType, points);
    }else{
      setCanvasState({
        mode:CanvasMode.None,
      });
    }

    history.resume();
  },[canvasState,camera,history,insertLayer,insertPath,unSelectLayer,setCanvasState]);

  const selections = useOthersMapped((other)=>other.presence.selection);

  const layerIdsToColorSelection = useMemo(() => {
    const layerIdToColor: Record<string, string> = {};
    //@ts-ignore
    layerIds?.forEach((layerId,connectionId) => {
      layerIdToColor[layerId] = connectionIdToColor(connectionId);
    });

    return layerIdToColor;
  },[selections]);

  const onLayerPointerDown = useMutation((
    {self,setMyPresence},
    e:React.PointerEvent,
    layerId:string
  )=>{
    if(
      canvasState.mode === CanvasMode.Pencil ||
      canvasState.mode === CanvasMode.Inserting
    ){
      return;
    }

    history.pause();
    e.stopPropagation();

    const point = pointerEventToCanvasPoint(e,camera);
    //@ts-ignore
    if(!self?.presence?.selection?.includes(layerId)){
      setMyPresence({selection:[layerId]},{addToHistory:true});  
    }

    setCanvasState({
      mode:CanvasMode.Translating,
      current:point,
    });
  },[setCanvasState,canvasState.mode,camera,history]);

  const onResizeHandlePointerDown = useCallback((corner:Side,initialBounds:XYWH)=>{
    history.pause();
    setCanvasState({
      mode:CanvasMode.Resizing,
      corner,
      initialBounds
    })

  },[history]);
  return (
    <main className="h-screen w-screen relative bg-neutral-100 touch-none">
      <Info boardId={boardId!}/>
      <Participants />
      <Toolbar 
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        undo={history.undo}
        redo={history.redo}
        canUndo={canUndo}
        canRedo={canRedo}
        boardId={boardId!}
      />
      <SelectionTools 
        camera={camera}
        setLastUsedColor={setLastUsedColor}
      />
      <svg
        id="mySvg"
        className="h-[100vh] w-[100vw] "
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerUp={onPointerUp}
        onPointerDown={onPointerDown}
      >
        <g 
          style={{
            transform:`translate(${camera.x}px, ${camera.y}px) `
          }}
        >
          {//@ts-ignore
          layerIds?.map((layerId)=>(
            <LayerPreview 
              key={layerId}
              id={layerId}
              onLayerPointerDown={onLayerPointerDown}
              selectionColor={layerIdsToColorSelection[layerId]}
            />
          ))}
          {canvasState.mode===CanvasMode.SelectionNet && canvasState.current != null && (
            <rect
              className="fill-blue-500/5 stroke-blue-500 stroke-1"
              x={Math.min(canvasState.current.x,canvasState.origin.x)}
              y={Math.min(canvasState.current.y,canvasState.origin.y)}
              width={Math.abs(canvasState.current.x-canvasState.origin.x)}
              height={Math.abs(canvasState.current.y-canvasState.origin.y)}
            /> 
          )}
          <SelectionBox
            onResizeHandlePointerDown={onResizeHandlePointerDown}
          />
          <CursorPresence />
          {pencilDraft!=null && 
          //@ts-ignore
          pencilDraft.length>0 &&(
            <Path
              //@ts-ignore
              points={pencilDraft}
              fill={colotToCss(lastUsedColor)}
              x={0}
              y={0}
              onPointerDown={onPointerDown}
            />
          )}
        </g>
      </svg>
    </main>
  )
};

// "use client"

// import type React from "react"
// import { useCallback, useEffect, useMemo, useState } from "react"
// import { Info } from "./info"
// import { Participants } from "./participants"
// import { Toolbar } from "./toolbar"
// import {
//   type Camera,
//   CanvasMode,
//   type CanvasState,
//   type Color,
//   LayerType,
//   type Point,
//   Side,
//   type XYWH,
// } from "@/types/canvas"
// import {
//   useCanRedo,
//   useCanUndo,
//   useHistory,
//   useMutation,
//   useOthersMapped,
//   useStorage,
// } from "@liveblocks/react/suspense"
// import { CursorPresence } from "./cursor-presence"
// import {
//   colotToCss,
//   connectionIdToColor,
//   findIntersectingLayerWithRectangle,
//   penPointsToPathLayer,
//   pointerEventToCanvasPoint,
//   resizeBounds,
// } from "@/lib/utils"
// import { nanoid } from "nanoid"
// import { LiveObject } from "@liveblocks/client"
// import { LayerPreview } from "./layer-preview"
// import { SelectionBox } from "./selection-box"
// import { SelectionTools } from "./selection-tools"
// import { useSelf } from "@liveblocks/react"
// import { Path } from "./Path"
// import { useDisableSchrollBounce } from "../../../hooks/use-sisable-scroll-bounce"
// import { useDeleteLayers } from "../../../hooks/use-delete-layers"
// import { useParams } from "react-router"
// import { LineSelectionBox } from "./line-selection-box"

// const MAX_LAYERS = 100

// export const Canvas = () => {
//   const { boardId } = useParams()

//   const layerIds = useStorage((root) => root.layerIds)

//   const pencilDraft = useSelf((me) => me.presence.pencilDraft)

//   const [canvasState, setCanvasState] = useState<CanvasState>({ mode: CanvasMode.None })

//   const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 })

//   const [lastUsedColor, setLastUsedColor] = useState<Color>({
//     r: 0,
//     g: 0,
//     b: 0,
//   })

//   useDisableSchrollBounce()
//   const canUndo = useCanUndo()
//   const canRedo = useCanRedo()
//   const history = useHistory()
//   const deleteLayers = useDeleteLayers()

//   useEffect(() => {
//     function inKeyDown(e: KeyboardEvent) {
//       switch (e.key) {
//         case "z": {
//           if (e.ctrlKey || e.metaKey) {
//             if (e.shiftKey) {
//               history.redo()
//             } else {
//               history.undo()
//             }
//             break
//           }
//         }
//         case "y": {
//           if (e.ctrlKey || e.metaKey) {
//             history.redo()
//             break
//           }
//         }
//         case "Delete": {
//           deleteLayers()
//           break
//         }
//       }
//     }

//     document.addEventListener("keydown", inKeyDown)

//     return () => {
//       document.removeEventListener("keydown", inKeyDown)
//     }
//   }, [deleteLayers, history])

//   // const insertLayer = useMutation((
//   //   {storage,setMyPresence},
//   //   layerType:LayerType.Ellipse | LayerType.Reactangle | LayerType.Text | LayerType.Path |LayerType.Note | LayerType.Diamond |LayerType.Hexagon |LayerType.Pentagon |LayerType.Star |LayerType.Triangle |LayerType.StraightLine |LayerType.ArrowLine |LayerType.CurvedLine |LayerType.ZigzagLine,
//   //   position: Point
//   // )=>{
//   //   const liveLayers = storage.get("layers");
//   //   //@ts-ignore
//   //   if(liveLayers?.size>=MAX_LAYERS){
//   //     return;
//   //   }

//   //   const liveLayersIds = storage.get("layerIds");
//   //   const layerId=nanoid();

//   //   let newlayer =  new LiveObject({
//   //     type: layerType,
//   //     x: position.x,
//   //     y: position.y,
//   //     height: 100,
//   //     width: 100,
//   //     fill: lastUsedColor,
//   //   });

//   //   console.log({newlayer});
//   //   //@ts-ignore
//   //   liveLayersIds?.push(layerId);
//   //   //@ts-ignore
//   //   liveLayers?.set(layerId, newlayer!);

//   //   setMyPresence({selection:[layerId]},{addToHistory:true});
//   //   setCanvasState({mode:CanvasMode.None});

//   // },[lastUsedColor]);
//   const insertLayer = useMutation(
//     ({ storage, setMyPresence }, layerType: LayerType, position: Point) => {
//       const liveLayers = storage.get("layers")
//       //@ts-ignore
//       if (liveLayers?.size >= MAX_LAYERS) {
//         return
//       }

//       const liveLayersIds = storage.get("layerIds")
//       const layerId = nanoid()

//       // Check if the layer is a line type
//       const isLine = [LayerType.StraightLine, LayerType.ArrowLine, LayerType.CurvedLine, LayerType.ZigzagLine].includes(
//         layerType,
//       )

//       let newLayer

//       if (isLine) {
//         // For lines, we'll use the existing structure but adapt it for lines
//         // We'll set the start point at the position and create a temporary end point
//         newLayer = new LiveObject({
//           type: layerType,
//           x: position.x, // This becomes starting X
//           y: position.y, // This becomes starting Y
//           // Setting a minimal width/height initially - will be updated during drawing
//           width: 1,
//           height: 1,
//           fill: lastUsedColor,
//           strokeWidth: 2,
//         })

//         // For curved lines, add control points
//         if (layerType === LayerType.CurvedLine) {
//           newLayer.update({
//             controlPointX: position.x,
//             controlPointY: position.y - 50, // Default control point above start
//           })
//         }

//         // For zigzag lines, add segments
//         if (layerType === LayerType.ZigzagLine) {
//           newLayer.update({
//             segments: 4, // Default number of zigzag segments
//           })
//         }
//       } else {
//         // For regular shapes, use your existing logic
//         newLayer = new LiveObject({
//           type: layerType,
//           x: position.x,
//           y: position.y,
//           height: 100,
//           width: 100,
//           fill: lastUsedColor,
//         })
//       }

//       console.log({ newLayer })
//       //@ts-ignore
//       liveLayersIds?.push(layerId)
//       //@ts-ignore
//       liveLayers?.set(layerId, newLayer)

//       setMyPresence({ selection: [layerId] }, { addToHistory: true })

//       if (isLine) {
//         // Enter a drawing mode for lines
//         setCanvasState({
//           mode: CanvasMode.Pencil, // Using Pencil mode for drawing lines
//           layerId: layerId, // You'll need to add this to your CanvasState type
//         })
//       } else {
//         setCanvasState({ mode: CanvasMode.None })
//       }
//     },
//     [lastUsedColor],
//   )

//   const translateSelectedLayer = useMutation(
//     ({ storage, self }, point: Point) => {
//       if (canvasState.mode !== CanvasMode.Translating) {
//         return
//       }
//       const offset = {
//         x: point.x - canvasState.current.x,
//         y: point.y - canvasState.current.y,
//       }

//       const liveLayers = storage.get("layers")

//       //@ts-ignore
//       for (const id of self?.presence?.selection) {
//         //@ts-ignore
//         const layer = liveLayers?.get(id)
//         if (layer) {
//           layer.update({
//             x: layer.get("x") + offset.x,
//             y: layer.get("y") + offset.y,
//           })
//         }
//       }

//       setCanvasState({ mode: CanvasMode.Translating, current: point })
//     },
//     [canvasState],
//   )

//   const unSelectLayer = useMutation(({ setMyPresence, self }) => {
//     //@ts-ignore
//     if (self?.presence?.selection?.length > 0) {
//       setMyPresence({ selection: [] }, { addToHistory: true })
//     }
//   }, [])

//   const updateSelectionNet = useMutation(
//     ({ storage, setMyPresence }, current: Point, origin: Point) => {
//       const layers = storage.get("layers")
//       setCanvasState({
//         mode: CanvasMode.SelectionNet,
//         origin,
//         current,
//       })

//       const ids = findIntersectingLayerWithRectangle(
//         //@ts-ignore
//         layerIds,
//         new Map(
//           //@ts-ignore
//           Array.from(layers?.entries()).map(([key, liveObject]) => [key, liveObject.toObject()]),
//         ),
//         origin,
//         current,
//       )

//       console.log("SELECTION NET IDS", { ids })

//       setMyPresence({ selection: ids })
//     },
//     [layerIds],
//   )

//   const startMultiSelection = useCallback((current: Point, origin: Point) => {
//     if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
//       console.log("ATTEMPTING TO SELECTION NET")
//       setCanvasState({
//         mode: CanvasMode.SelectionNet,
//         origin,
//         current,
//       })
//     }
//   }, [])

//   const insertPath = useMutation(
//     ({ storage, self, setMyPresence }) => {
//       const liveLayers = storage.get("layers")
//       const { pencilDraft } = self.presence
//       console.log({ pencilDraft }, "PENCILE-DRAFT INSERTPATH")

//       if (
//         pencilDraft == null ||
//         //@ts-ignore
//         pencilDraft.length < 2 ||
//         //@ts-ignore
//         liveLayers?.size >= MAX_LAYERS
//       ) {
//         setMyPresence({ pencilDraft: null })
//         return
//       }

//       const id = nanoid()
//       //@ts-ignore
//       liveLayers?.set(
//         id,
//         new LiveObject(
//           penPointsToPathLayer(
//             //@ts-ignore
//             pencilDraft,
//             lastUsedColor,
//           ),
//         ),
//       )

//       const liveLayersIds = storage.get("layerIds")
//       //@ts-ignore
//       liveLayersIds.push(id)

//       setMyPresence({
//         pencilDraft: null,
//       })

//       setCanvasState({ mode: CanvasMode.Pencil })
//       console.log("Finished inserting path")
//     },
//     [lastUsedColor, setCanvasState],
//   )

//   const startDrawing = useMutation(
//     ({ setMyPresence }, point: Point, Pressure: number) => {
//       console.log("STARTED DRAWING")
//       setMyPresence({
//         pencilDraft: [[point.x, point.y, Pressure]],
//         penColor: lastUsedColor,
//       })
//     },
//     [lastUsedColor],
//   )

//   const continueDrawing = useMutation(
//     ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
//       const { pencilDraft } = self.presence

//       console.log(pencilDraft)
//       if (canvasState.mode !== CanvasMode.Pencil || e.button === 1 || pencilDraft == null) {
//         return
//       }
//       console.log({ pencilDraft }, "PENCIL-DRAFT-ContinueDrawing")

//       setMyPresence({
//         cursor: point,
//         pencilDraft:
//           //@ts-ignore
//           pencilDraft.length === 1 &&
//           //@ts-ignore
//           pencilDraft[0][0] === point.x &&
//           //@ts-ignore
//           pencilDraft[0][1] === point.y
//             ? pencilDraft
//             : //@ts-ignore
//               [...pencilDraft, [point.x, point.y, e.pressure]],
//       })
//     },
//     [canvasState.mode],
//   )

//   const updateControlPoint = useMutation(
//     ({ storage, self }, point: Point) => {
//       if (canvasState.mode !== CanvasMode.Resizing) {
//         return
//       }

//       const liveLayers = storage.get("layers")
//       const selection = self.presence.selection

//       if (!selection || selection.length !== 1) return

//       const layerId = selection[0]
//       const layer = liveLayers?.get(layerId)

//       if (layer && layer.get("type") === LayerType.CurvedLine) {
//         layer.update({
//           controlPointX: point.x,
//           controlPointY: point.y,
//         })
//       }
//     },
//     [canvasState],
//   )

//   const resizeSelectedLayer = useMutation(
//     ({ storage, self }, point: Point) => {
//       if (canvasState.mode !== CanvasMode.Resizing) {
//         return
//       }

//       const liveLayers = storage.get("layers")
//       const selection = self.presence.selection

//       if (!selection || selection.length !== 1) return

//       const layerId = selection[0]
//       const layer = liveLayers?.get(layerId)

//       if (!layer) return

//       // Check if it's a line type
//       const isLine = [LayerType.StraightLine, LayerType.ArrowLine, LayerType.CurvedLine, LayerType.ZigzagLine].includes(
//         layer.get("type"),
//       )

//       if (isLine) {
//         // For curved line control point
//         if (layer.get("type") === LayerType.CurvedLine && canvasState.corner === Side.Top) {
//           updateControlPoint(point)
//           return
//         }

//         // For start point (top-left corner)
//         if (canvasState.corner === Side.Top + Side.Left) {
//           layer.update({
//             x: point.x,
//             y: point.y,
//           })
//           return
//         }

//         // For end point (bottom-right corner)
//         if (canvasState.corner === Side.Bottom + Side.Right) {
//           const newWidth = point.x - layer.get("x")
//           const newHeight = point.y - layer.get("y")

//           layer.update({
//             width: newWidth,
//             height: newHeight,
//           })
//           return
//         }
//       }

//       // For regular shapes, use the existing bounds calculation
//       const bounds = resizeBounds(canvasState.initialBounds, canvasState.corner, point)
//       layer.update(bounds)
//     },
//     [canvasState, updateControlPoint],
//   )

//   const onWheel = useCallback((e: React.WheelEvent) => {
//     setCamera((camera) => ({
//       x: camera.x - e.deltaX,
//       y: camera.y - e.deltaY,
//     }))
//   }, [])

//   const onPointerMove = useMutation(
//     ({ setMyPresence }, e: React.PointerEvent) => {
//       e.preventDefault()
//       const current = pointerEventToCanvasPoint(e, camera)

//       // console.log({current});
//       if (canvasState.mode == CanvasMode.Pressing) {
//         startMultiSelection(current, canvasState.origin)
//       } else if (canvasState.mode == CanvasMode.SelectionNet) {
//         updateSelectionNet(current, canvasState.origin)
//       } else if (canvasState.mode === CanvasMode.Translating) {
//         //console.log("Translating");
//         translateSelectedLayer(current)
//       } else if (canvasState.mode === CanvasMode.Resizing) {
//         //console.log("Resizing");
//         resizeSelectedLayer(current)
//       } else if (canvasState.mode === CanvasMode.Pencil) {
//         //console.log("Pencil");
//         continueDrawing(current, e)
//       }
//       setMyPresence({ cursor: current })
//     },
//     [
//       canvasState,
//       resizeSelectedLayer,
//       camera,
//       continueDrawing,
//       startMultiSelection,
//       updateSelectionNet,
//       translateSelectedLayer,
//     ],
//   )

//   const onPointerLeave = useMutation(({ setMyPresence }) => {
//     setMyPresence({ cursor: null })
//   }, [])

//   const onPointerDown = useCallback(
//     (e: React.PointerEvent) => {
//       e.preventDefault()
//       const current = pointerEventToCanvasPoint(e, camera)

//       if (canvasState.mode === CanvasMode.Inserting) {
//         return
//       }

//       if (canvasState.mode === CanvasMode.Pencil) {
//         startDrawing(current, e.pressure)
//         return
//       }

//       setCanvasState({
//         mode: CanvasMode.Pressing,
//         origin: current,
//       })
//     },
//     [camera, canvasState.mode, setCanvasState],
//   )

//   const onPointerUp = useMutation(
//     ({}, e) => {
//       const points = pointerEventToCanvasPoint(e, camera)

//       console.log({ points, mode: canvasState.mode })
//       if (canvasState.mode === CanvasMode.None || canvasState.mode === CanvasMode.Pressing) {
//         unSelectLayer()
//         setCanvasState({
//           mode: CanvasMode.None,
//         })
//       } else if (canvasState.mode === CanvasMode.Pencil) {
//         insertPath()
//       } else if (canvasState.mode === CanvasMode.Inserting) {
//         insertLayer(canvasState.layerType, points)
//       } else {
//         setCanvasState({
//           mode: CanvasMode.None,
//         })
//       }

//       history.resume()
//     },
//     [canvasState, camera, history, insertLayer, insertPath, unSelectLayer, setCanvasState],
//   )

//   const selections = useOthersMapped((other) => other.presence.selection)

//   const layerIdsToColorSelection = useMemo(() => {
//     const layerIdToColor: Record<string, string> = {}
//     //@ts-ignore
//     layerIds?.forEach((layerId, connectionId) => {
//       layerIdToColor[layerId] = connectionIdToColor(connectionId)
//     })

//     return layerIdToColor
//   }, [selections])

//   const onLayerPointerDown = useMutation(
//     ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
//       if (canvasState.mode === CanvasMode.Pencil || canvasState.mode === CanvasMode.Inserting) {
//         return
//       }

//       history.pause()
//       e.stopPropagation()

//       const point = pointerEventToCanvasPoint(e, camera)
//       //@ts-ignore
//       if (!self?.presence?.selection?.includes(layerId)) {
//         setMyPresence({ selection: [layerId] }, { addToHistory: true })
//       }

//       setCanvasState({
//         mode: CanvasMode.Translating,
//         current: point,
//       })
//     },
//     [setCanvasState, canvasState.mode, camera, history],
//   )

//   const onResizeHandlePointerDown = useCallback(
//     (corner: Side, initialBounds: XYWH) => {
//       history.pause()
//       setCanvasState({
//         mode: CanvasMode.Resizing,
//         corner,
//         initialBounds,
//       })
//     },
//     [history],
//   )
//   return (
//     <main className="h-screen w-screen relative bg-neutral-100 touch-none">
//       <Info boardId={boardId!} />
//       <Participants />
//       <Toolbar
//         canvasState={canvasState}
//         setCanvasState={setCanvasState}
//         undo={history.undo}
//         redo={history.redo}
//         canUndo={canUndo}
//         canRedo={canRedo}
//         boardId={boardId!}
//       />
//       <SelectionTools camera={camera} setLastUsedColor={setLastUsedColor} />
//       <svg
//         id="mySvg"
//         className="h-[100vh] w-[100vw] "
//         onWheel={onWheel}
//         onPointerMove={onPointerMove}
//         onPointerLeave={onPointerLeave}
//         onPointerUp={onPointerUp}
//         onPointerDown={onPointerDown}
//       >
//         <g
//           style={{
//             transform: `translate(${camera.x}px, ${camera.y}px) `,
//           }}
//         >
//           {
//             //@ts-ignore
//             layerIds?.map((layerId) => (
//               <LayerPreview
//                 key={layerId}
//                 id={layerId}
//                 onLayerPointerDown={onLayerPointerDown}
//                 selectionColor={layerIdsToColorSelection[layerId]}
//               />
//             ))
//           }
//           {canvasState.mode === CanvasMode.SelectionNet && canvasState.current != null && (
//             <rect
//               className="fill-blue-500/5 stroke-blue-500 stroke-1"
//               x={Math.min(canvasState.current.x, canvasState.origin.x)}
//               y={Math.min(canvasState.current.y, canvasState.origin.y)}
//               width={Math.abs(canvasState.current.x - canvasState.origin.x)}
//               height={Math.abs(canvasState.current.y - canvasState.origin.y)}
//             />
//           )}
//           <SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
//           <LineSelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
//           <CursorPresence />
//           {pencilDraft != null &&
//             //@ts-ignore
//             pencilDraft.length > 0 && (
//               <Path
//                 //@ts-ignore
//                 points={pencilDraft}
//                 fill={colotToCss(lastUsedColor)}
//                 x={0}
//                 y={0}
//                 onPointerDown={onPointerDown}
//               />
//             )}
//         </g>
//       </svg>
//     </main>
//   )
// }

