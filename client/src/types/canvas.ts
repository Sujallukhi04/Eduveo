export type Color = {
  r: number,
  g: number,
  b: number
}

export type Camera = {
  x: number,
  y: number
}

export enum LayerType {
  Reactangle,
  Ellipse,
  Path,
  Text,
  Note,
  Triangle,
  Hexagon,
  Star,
  Diamond,
  Pentagon,
  StraightLine,   
  ArrowLine,
  CurvedLine,
  ZigzagLine,
  SVGImage, 
};

export type ReactangleLayer = {
  type: LayerType.Reactangle,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  value?: string,
};

export type EllipseLayer = {
  type: LayerType.Ellipse,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  value?: string,
};

export type PathLayer = {
  type: LayerType.Path,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  points?: number[][],
  value?: string,
};

export type TextLayer = {
  type: LayerType.Text,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  value?: string,
};

export type NoteLayer = {
  type: LayerType.Note,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  value?: string,
};

export type TriangleLayer = {
  type: LayerType.Triangle,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  value?: string,
};

export type HexagonLayer = {
  type: LayerType.Hexagon,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  value?: string,
};

export type StarLayer = {
  type: LayerType.Star,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  points?: number, // Number of points in the star (default: 5)
  value?: string,
};

export type DiamondLayer = {
  type: LayerType.Diamond,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  value?: string,
};

export type PentagonLayer = {
  type: LayerType.Pentagon,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  value?: string,
};

export type Point = {
  x: number,
  y: number
};

export type XYWH = {
  x: number,
  y: number,
  width: number,
  height: number
};

export enum Side {
  Top = 1,
  Bottom = 2,
  Left = 4,
  Right = 8,
};

export enum CanvasMode {
  None,
  Pressing,
  SelectionNet,
  Translating,
  Inserting,
  Resizing,
  Pencil,
};

// Add new layer types
export type StraightLineLayer = {
  type: LayerType.StraightLine,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  strokeWidth?: number,
  value?: string,
};

export type ArrowLineLayer = {
  type: LayerType.ArrowLine,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  strokeWidth?: number,
  value?: string,
};

export type CurvedLineLayer = {
  type: LayerType.CurvedLine,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  strokeWidth?: number,
  controlPointX?: number, // For the bezier curve
  controlPointY?: number,
  value?: string,
};

export type ZigzagLineLayer = {
  type: LayerType.ZigzagLine,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  strokeWidth?: number,
  segments?: number, // Number of zigzag segments
  value?: string,
};

// New SVGImage layer type
export type SVGImageLayer = {
  type: LayerType.SVGImage,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: Color,
  svgContent: string, // Store the SVG content
  viewBox?: string,   // Store the viewBox attribute
  value?: string,     // Optional caption or description
};

// Update your Layer type union
export type Layer = 
  | ReactangleLayer 
  | EllipseLayer 
  | PathLayer 
  | TextLayer 
  | NoteLayer
  | TriangleLayer
  | HexagonLayer
  | StarLayer
  | DiamondLayer
  | PentagonLayer
  | StraightLineLayer
  | ArrowLineLayer
  | CurvedLineLayer
  | ZigzagLineLayer
  | SVGImageLayer;  // Added new layer type

// Update CanvasState for the Inserting mode
export type CanvasState =
  | {
    mode: CanvasMode.None,
    }
  | {
      mode: CanvasMode.SelectionNet,
      origin: Point;
      current?: Point;
    }
  | {
      mode: CanvasMode.Translating,
      current: Point
    }
  | {
      mode: CanvasMode.Pressing,
      origin: Point;
    }
  | {
      mode: CanvasMode.Inserting,
      layerType: 
        | LayerType.Ellipse 
        | LayerType.Reactangle 
        | LayerType.Text 
        | LayerType.Note
        | LayerType.Triangle
        | LayerType.Hexagon
        | LayerType.Star
        | LayerType.Diamond
        | LayerType.Pentagon
        | LayerType.StraightLine
        | LayerType.ArrowLine
        | LayerType.CurvedLine
        | LayerType.ZigzagLine
        | LayerType.SVGImage;  // Added SVGImage to supported insertion types
    }
  | {
      mode: CanvasMode.Resizing,
      initialBounds: XYWH,
      corner: Side;
    }
  | {
      mode: CanvasMode.Pencil
    };