// import { Hint } from '@/components/hint';
// import { Button } from '@/components/ui/button';
// import { Download } from 'lucide-react';
// import React from 'react';

// interface SvgDownloaderProps {
//   svgId: string; // ID of the SVG element to download
//   fileName?: string; // Optional custom filename
//   buttonText?: string; // Optional custom button text
//   embedFonts?: boolean; // Whether to embed fonts
// }

// const SvgDownloader: React.FC<SvgDownloaderProps> = ({
//   svgId,
//   fileName = 'image.svg',
//   buttonText = 'Download SVG',
//   embedFonts = true,
// }) => {
//   const downloadSvg = () => {
//     // Get the SVG element
//     const svgElement = document.getElementById(svgId);
    
//     if (!svgElement) {
//       console.error(`SVG element with ID "${svgId}" not found`);
//       return;
//     }
    
//     // Clone the SVG to avoid modifying the original
//     const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
//     if (embedFonts) {
//       // Get computed styles for the original SVG
//       const svgStyle = window.getComputedStyle(svgElement);
      
//       // Add font styles inline to the SVG
//       const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
//       style.textContent = `

//         @font-face {
//           font-family: "${svgStyle.fontFamily}";
//           font-weight: ${svgStyle.fontWeight};
//           font-style: ${svgStyle.fontStyle};
//           src: local("${svgStyle.fontFamily}");
//         }
        
//         text {
//           font-family: "${svgStyle.fontFamily}";
//           font-size: ${svgStyle.fontSize};
//           font-weight: ${svgStyle.fontWeight};
//           font-style: ${svgStyle.fontStyle};
//         }
//       `;
      
//       clonedSvg.insertBefore(style, clonedSvg.firstChild);
      
//       // Set explicit text attributes on all text elements
//       const textElements = clonedSvg.querySelectorAll('text');
//       textElements.forEach(textEl => {
//         if (!textEl.getAttribute('font-family')) {
//           textEl.setAttribute('font-family', svgStyle.fontFamily.replace(/["']/g, ''));
//         }
//         if (!textEl.getAttribute('font-size')) {
//           textEl.setAttribute('font-size', svgStyle.fontSize);
//         }
//         if (!textEl.getAttribute('font-weight')) {
//           textEl.setAttribute('font-weight', svgStyle.fontWeight);
//         }
//       });
//     }
    
//     // Add XML namespace
//     if (!clonedSvg.getAttribute('xmlns')) {
//       clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
//     }
    
//     // Convert to viewBox if width/height is used without viewBox
//     if (!clonedSvg.getAttribute('viewBox') && clonedSvg.getAttribute('width') && clonedSvg.getAttribute('height')) {
//       const width = clonedSvg.getAttribute('width')?.replace('px', '') || '0';
//       const height = clonedSvg.getAttribute('height')?.replace('px', '') || '0';
//       clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
//     }
    
//     // Get the SVG content with the embedded styles
//     const svgData = new XMLSerializer().serializeToString(clonedSvg);
    
//     // Add XML declaration
//     const svgDoctype = '<?xml version="1.0" standalone="no"?>\n';
//     const finalSvgData = svgDoctype + svgData;
    
//     // Create a Blob with the SVG data
//     const svgBlob = new Blob([finalSvgData], { type: 'image/svg+xml;charset=utf-8' });
    
//     // Create a URL for the Blob
//     const svgUrl = URL.createObjectURL(svgBlob);
    
//     // Create a temporary link element for downloading
//     const downloadLink = document.createElement('a');
//     downloadLink.href = svgUrl;
//     downloadLink.download = fileName;
    
//     // Append the link to the body, click it, and remove it
//     document.body.appendChild(downloadLink);
//     downloadLink.click();
//     document.body.removeChild(downloadLink);
    
//     // Release the URL object
//     URL.revokeObjectURL(svgUrl);
//   };

//   return (
//     <Hint lable={buttonText} side="right" sideOffset={14}>
//     <Button
//       onClick={downloadSvg}
//       variant={"board"}
//       size={"icon"}
//     >
//       <Download />
//     </Button>
//   </Hint>
//   );
// };

// export default SvgDownloader;

import { Hint } from '@/components/hint';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import React from 'react';

interface SvgDownloaderProps {
  svgId: string; // ID of the SVG element to download
  fileName?: string; // Optional custom filename
  buttonText?: string; // Optional custom button text
}

const SvgDownloader: React.FC<SvgDownloaderProps> = ({
  svgId,
  fileName = 'image.svg',
  buttonText = 'Download SVG',
}) => {
  const downloadSvg = () => {
    // Get the SVG element
    const svgElement = document.getElementById(svgId);
    
    if (!svgElement) {
      console.error(`SVG element with ID "${svgId}" not found`);
      return;
    }
    
    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Add XML namespace if not present
    if (!clonedSvg.getAttribute('xmlns')) {
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    
    // Attempt to find Kamal font in the document
    const fontKamalStyles = Array.from(document.styleSheets)
      .flatMap(sheet => {
        try {
          return Array.from(sheet.cssRules);
        } catch (e) {
          // Cross-origin stylesheet - can't access rules
          return [];
        }
      })
      .filter(rule => rule.type === CSSRule.FONT_FACE_RULE)
      .filter(rule => {
        const fontRule = rule as CSSFontFaceRule;
        return fontRule.style.fontFamily.includes('Kamal') || 
               fontRule.style.fontFamily.includes('kamal');
      });
    
    // Extract font URL if available from loaded stylesheets
    let fontSrc = '';
    if (fontKamalStyles.length > 0) {
      const fontRule = fontKamalStyles[0] as CSSFontFaceRule;

      //@ts-ignore
      fontSrc = fontRule.style.src;
    }
    
    // Create a style element
    const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleElement.setAttribute('type', 'text/css');
    
    // Build style content
    let styleContent = '';
    
    // Add Kamal font-face if available
    if (fontSrc) {
      styleContent += `
        @font-face {
          font-family: 'Kamal';
          src: ${fontSrc};
          font-weight: normal;
          font-style: normal;
        }
      `;
    } else {
      // Fallback to referencing the font by name
      styleContent += `
        @font-face {
          font-family: 'Kamal';
          src: local('Kamal');
          font-weight: normal;
          font-style: normal;
        }
      `;
    }
    
    // Add general text styling
    styleContent += `
      text, tspan {
        font-family: 'Kamal', sans-serif !important;
      }
      
      .text-kamal {
        font-family: 'Kamal', sans-serif !important;
      }
    `;
    
    // Set the style content
    styleElement.textContent = styleContent;
    
    // Insert the style element as the first child
    clonedSvg.insertBefore(styleElement, clonedSvg.firstChild);
    
    // Process all text elements
    const textElements = clonedSvg.querySelectorAll('text');
    textElements.forEach(el => {
      el.setAttribute('font-family', 'Kamal, sans-serif');
      el.classList.add('text-kamal');
    });
    
    // Process all tspan elements
    const tspanElements = clonedSvg.querySelectorAll('tspan');
    tspanElements.forEach(el => {
      el.setAttribute('font-family', 'Kamal, sans-serif');
      el.classList.add('text-kamal');
    });
    
    // Process foreignObject elements (might contain HTML with Tailwind classes)
    const foreignObjects = clonedSvg.querySelectorAll('foreignObject');
    foreignObjects.forEach(foreignObj => {
      // Find elements with Tailwind Kamal font classes
      const kamalElements = foreignObj.querySelectorAll('[class*="font-kamal"]');
      kamalElements.forEach(el => {
        (el as HTMLElement).style.fontFamily = 'Kamal, sans-serif';
      });
      
      // Also set font on all text elements inside foreignObject
      const textElements = foreignObj.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6');
      textElements.forEach(el => {
        (el as HTMLElement).style.fontFamily = 'Kamal, sans-serif';
      });
    });
    
    // Convert to viewBox if needed
    if (!clonedSvg.getAttribute('viewBox') && clonedSvg.getAttribute('width') && clonedSvg.getAttribute('height')) {
      const width = clonedSvg.getAttribute('width')?.replace('px', '') || '0';
      const height = clonedSvg.getAttribute('height')?.replace('px', '') || '0';
      clonedSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
    
    // Get the SVG content with the embedded styles
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    
    // Add XML declaration
    const svgDoctype = '<?xml version="1.0" standalone="no"?>\n';
    const finalSvgData = svgDoctype + svgData;
    
    // Create a Blob with the SVG data
    const svgBlob = new Blob([finalSvgData], { type: 'image/svg+xml;charset=utf-8' });
    
    // Create a URL for the Blob
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // Create a temporary link element for downloading
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = fileName;
    
    // Append the link to the body, click it, and remove it
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Release the URL object
    URL.revokeObjectURL(svgUrl);
  };

  return (
    <Hint lable={buttonText} side="right" sideOffset={14}>
      <Button
        onClick={downloadSvg}
        variant="board"
        size="icon"
      >
        <Download />
      </Button>
    </Hint>
  );
};

export default SvgDownloader;