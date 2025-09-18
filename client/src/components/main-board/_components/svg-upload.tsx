// import { Hint } from '@/components/hint';
// import { Button } from '@/components/ui/button';
// import { Upload } from 'lucide-react';
// import React, { useRef, useState } from 'react';

// interface SvgUploaderProps {
//   targetSvgId: string; // ID of the SVG element to update
//   onSvgLoaded?: (svgContent: string) => void; // Optional callback when SVG is loaded
//   buttonText?: string; // Optional custom button text
//   defaultViewBox?: string; // Default viewBox to use if none is provided in the uploaded SVG
//   defaultWidth?: string; // Default width if none provided
//   defaultHeight?: string; // Default height if none provided
// }

// const SvgUploader: React.FC<SvgUploaderProps> = ({
//   targetSvgId,
//   onSvgLoaded,
//   buttonText = 'Upload SVG',
//   defaultViewBox = '0 0 800 600',
//   defaultWidth = '100%',
//   defaultHeight = '100%',
// }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const handleUploadClick = () => {
//     // Clear previous errors
//     setError(null);
    
//     // Trigger the hidden file input click
//     if (fileInputRef.current) {
//       fileInputRef.current.click();
//     }
//   };

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
    
//     if (!file) {
//       setError('No file selected');
//       return;
//     }
    
//     if (!file.type.includes('svg') && !file.name.toLowerCase().endsWith('.svg')) {
//       setError('Please select a valid SVG file');
//       return;
//     }
    
//     setIsLoading(true);
//     setError(null);
    
//     const reader = new FileReader();
    
//     reader.onload = (e) => {
//       try {
//         const svgContent = e.target?.result as string;
        
//         // Get the target SVG element
//         const targetSvg = document.getElementById(targetSvgId);
        
//         if (!targetSvg) {
//           throw new Error(`Target SVG element with ID "${targetSvgId}" not found`);
//         }
        
//         // Create a temporary div to parse the SVG content
//         const tempDiv = document.createElement('div');
//         tempDiv.innerHTML = svgContent;
        
//         const uploadedSvg = tempDiv.querySelector('svg');
        
//         if (!uploadedSvg) {
//           throw new Error('Invalid SVG content - no SVG element found');
//         }

//         // Extract SVG properties from uploaded SVG
//         const viewBox = uploadedSvg.getAttribute('viewBox') || defaultViewBox;
//         const width = uploadedSvg.getAttribute('width') || defaultWidth;
//         const height = uploadedSvg.getAttribute('height') || defaultHeight;
        
//         // Preserve original styling if present
//         const style = uploadedSvg.getAttribute('style') || '';
        
//         // Set SVG properties on target
//         targetSvg.setAttribute('viewBox', viewBox);
//         targetSvg.setAttribute('width', width);
//         targetSvg.setAttribute('height', height);
        
//         if (style) {
//           targetSvg.setAttribute('style', `${style}; display: block;`);
//         } else {
//           targetSvg.setAttribute('style', 'display: block;');
//         }
        
//         // Make sure SVG is visible
//         targetSvg.style.visibility = 'visible';
//         targetSvg.style.opacity = '1';
        
//         // Replace the content of the target SVG with the content of the uploaded SVG
//         targetSvg.innerHTML = uploadedSvg.innerHTML;
        
//         // Force a repaint (can sometimes help with rendering issues)
//         targetSvg.style.display = 'none';
//         // This forces a reflow
//         void targetSvg.offsetHeight;
//         targetSvg.style.display = 'block';
        
//         console.log('SVG uploaded successfully', {
//           viewBox,
//           width,
//           height,
//           childElementCount: targetSvg.childElementCount
//         });
        
//         // If a callback was provided, call it with the SVG content
//         if (onSvgLoaded) {
//           onSvgLoaded(svgContent);
//         }
        
//         // Reset the file input
//         if (fileInputRef.current) {
//           fileInputRef.current.value = '';
//         }
//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Unknown error processing SVG';
//         console.error('Error processing SVG file:', errorMessage);
//         setError(errorMessage);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     reader.onerror = () => {
//       setError('Error reading file');
//       setIsLoading(false);
//     };
    
//     reader.readAsText(file);
//   };

//   return (
//     <div className="flex flex-col">
//       <input
//         type="file"
//         ref={fileInputRef}
//         accept=".svg"
//         onChange={handleFileChange}
//         style={{ display: 'none' }}
//       />
//       <Hint lable={buttonText} side="right" sideOffset={14}>
//         <Button
//           onClick={handleUploadClick}
//           variant="board"
//           size="icon"
//           disabled={isLoading}
//         >
//           <Upload />
//         </Button>
//       </Hint>
//       {isLoading && <span className="text-sm mt-2">Loading...</span>}
//       {error && <span className="text-sm text-red-500 mt-2">{error}</span>}
//     </div>
//   );
// };

// export default SvgUploader;


import { Hint } from '@/components/hint';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useMutation } from '@liveblocks/react';
import { v4 as uuidv4 } from 'uuid';
import { Layer, LayerType, PathLayer, Color } from '@/types/canvas';
interface SvgUploaderProps {
  onSvgUploaded?: () => void; // Optional callback when SVG is successfully processed
  buttonText?: string; // Optional custom button text
}

const SvgUploader: React.FC<SvgUploaderProps> = ({
  onSvgUploaded,
  buttonText = 'Upload SVG',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Liveblocks mutation to add layers
  const addLayers = useMutation(({ storage }, layers: Layer[], layerIds: string[]) => {
    // Get the existing LiveMap and LiveList
    const liveLayersMap = storage.get('layers');
    const liveLayerIds = storage.get('layerIds');

    // Add each layer to the LiveMap
    layers.forEach(layer => {
      //@ts-ignore
      liveLayersMap.set(layer.id, layer);
    });

    // Add layer IDs to the end of the list
    layerIds.forEach(id => {
      //@ts-ignore
      liveLayerIds.push(id);
    });
  }, []);

  const handleUploadClick = () => {
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Convert SVG path element to a PathLayer
  const pathElementToLayer = (pathElement: SVGPathElement, index: number): PathLayer => {
    // Generate a unique ID for this layer
    const id = uuidv4();
    
    // Get bounding box of the path
    const bbox = pathElement.getBBox();
    
    // Get path data
    const pathData = pathElement.getAttribute('d') || '';
    
    // Get fill color (with fallback)
    const fill = pathElement.getAttribute('fill') || '#000000';
    const fillColor: Color = {
      r: 0,
      g: 0,
      b: 0
    };
    
    // Try to parse the fill color if it's in hex format
    if (fill.startsWith('#')) {
      const hex = fill.substring(1);
      const bigint = parseInt(hex, 16);
      fillColor.r = (bigint >> 16) & 255;
      fillColor.g = (bigint >> 8) & 255;
      fillColor.b = bigint & 255;
    }
    
    // Create the layer object
    const layer: PathLayer = {
      //@ts-ignore
      id,
      type: LayerType.Path,
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
      fill: fillColor,
      // Convert path to points if needed for your application
      // This is a simplified version - you may need more complex path parsing
      points: [], // You would parse the SVG path to points here
      value: pathData, // Store the original path data
    };
    
    return layer;
  };

  // Convert an SVG element to layers
  const svgToLayers = (svg: SVGSVGElement): { layers: Layer[], layerIds: string[] } => {
    const layers: Layer[] = [];
    const layerIds: string[] = [];
    
    // Get all path elements
    const pathElements = svg.querySelectorAll('path');
    
    // Convert each path to a layer
    pathElements.forEach((pathElement, index) => {
      const layer = pathElementToLayer(pathElement as SVGPathElement, index);
      layers.push(layer);
      //@ts-ignore
      layerIds.push(layer.id);
    });
    
    // You can add more conversions for other SVG elements here (circles, rectangles, etc.)
    // This would follow a similar pattern to the path conversion
    
    return { layers, layerIds };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      setError('No file selected');
      return;
    }
    
    if (!file.type.includes('svg') && !file.name.toLowerCase().endsWith('.svg')) {
      setError('Please select a valid SVG file');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const svgContent = e.target?.result as string;
        
        // Create a temporary div to parse the SVG content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgContent;
        
        const uploadedSvg = tempDiv.querySelector('svg');
        
        if (!uploadedSvg) {
          throw new Error('Invalid SVG content - no SVG element found');
        }

        // Convert SVG to layers
        const { layers, layerIds } = svgToLayers(uploadedSvg as SVGSVGElement);
        
        if (layers.length === 0) {
          throw new Error('No valid elements found in SVG');
        }
        
        // Add layers to Liveblocks storage
        addLayers(layers, layerIds);
        
        console.log('SVG uploaded successfully', {
          layerCount: layers.length,
          layers: layers
        });
        
        // If a callback was provided, call it
        if (onSvgUploaded) {
          onSvgUploaded();
        }
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error processing SVG';
        console.error('Error processing SVG file:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        accept=".svg"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Hint lable={buttonText} side="right" sideOffset={14}>
        <Button
          onClick={handleUploadClick}
          variant="board"
          size="icon"
          disabled={isLoading}
        >
          <Upload />
        </Button>
      </Hint>
      {isLoading && <span className="text-sm mt-2">Processing SVG...</span>}
      {error && <span className="text-sm text-red-500 mt-2">{error}</span>}
    </div>
  );
};

export default SvgUploader;