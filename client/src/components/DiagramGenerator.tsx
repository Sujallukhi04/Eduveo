import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Copy,
  Download,
  Loader2,
  RefreshCw,
  Maximize2,
  Minimize2,
  FileCode,
  Clipboard,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { githubLight } from "@uiw/codemirror-theme-github";
import { Mermaid } from "mermaid";
import {
  darkModeStyles,
  diagramTemplates,
  mermaidLanguage,
} from "@/lib/code-Editor";

export default function DiagramGenerator() {
  const [prompt, setPrompt] = useState("");
  const [mermaidCode, setMermaidCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("editor");
  const previewRef = useRef<HTMLDivElement>(null);
  const [mermaid, setMermaid] = useState(null);
  const [fullScreenPreview, setFullScreenPreview] = useState(false);
  const [diagramTheme, setDiagramTheme] = useState<
    "default" | "dark" | "base" | "forest" | "neutral" | "null"
  >("default");
  const [exportSize, setExportSize] = useState("auto");
  const [customWidth, setCustomWidth] = useState(800);
  const [customHeight, setCustomHeight] = useState(600);
  const [copied, setCopied] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [exportFormat, setExportFormat] = useState<
    "svg" | "png" | "jpeg" | "pdf"
  >("png");

  // Update Mermaid theme based on dark mode
  useEffect(() => {
    // Auto-switch diagram theme based on dark mode
    const autoTheme = isDarkMode ? "dark" : "default";

    // Only auto-switch if user hasn't manually selected a theme
    if (diagramTheme === "default" || diagramTheme === "dark") {
      setDiagramTheme(autoTheme);
    }

    if (mermaid) {
      //
      (mermaid as Mermaid).initialize({
        startOnLoad: true,
        theme: diagramTheme,
        securityLevel: "loose",
        flowchart: { curve: "basis" },
        darkMode: isDarkMode,
      });
      renderDiagram();
    }
  }, [isDarkMode, mermaid]);

  // Load Mermaid library once on component mount
  useEffect(() => {
    import("mermaid")
      .then((m) => {
        m.default.initialize({
          startOnLoad: true,
          theme: diagramTheme,
          securityLevel: "loose",
          flowchart: { curve: "basis" },
          darkMode: isDarkMode,
        });

        //@ts-ignore
        setMermaid(m.default);
      })
      .catch((err) => {
        console.error("Failed to load Mermaid", err);
        setError("Failed to load diagram rendering library");
      });
  }, []);

  // Update theme when it changes
  useEffect(() => {
    if (mermaid) {
      (mermaid as Mermaid).initialize({
        startOnLoad: true,
        theme: diagramTheme,
        securityLevel: "loose",
        flowchart: { curve: "basis" },
        darkMode: isDarkMode,
      });
      renderDiagram();
    }
  }, [diagramTheme]);

  // Custom CSS for dark mode diagram preview
  const previewStyles = {
    backgroundColor: isDarkMode ? "rgb(17, 24, 39)" : "rgb(249, 250, 251)",
    color: isDarkMode ? "rgb(229, 231, 235)" : "rgb(17, 24, 39)",
  };

  // Add dark mode CSS to adjust diagram colors
  useEffect(() => {
    const styleId = "mermaid-dark-mode-styles";
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = darkModeStyles;
  }, []);

  // Check for dark mode on component mount and when system preference changes
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Initial check
      const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDarkMode(
        darkModeQuery.matches ||
          document.documentElement.classList.contains("dark")
      );

      // Listen for changes
      const darkModeListener = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };

      // Also check for class-based dark mode
      const observeClassChanges = () => {
        const isDark = document.documentElement.classList.contains("dark");
        setIsDarkMode(isDark);
      };

      // Create mutation observer to watch for class changes
      const observer = new MutationObserver(observeClassChanges);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      darkModeQuery.addEventListener("change", darkModeListener);

      return () => {
        darkModeQuery.removeEventListener("change", darkModeListener);
        observer.disconnect();
      };
    }
  }, []);

  // CodeMirror theme based on dark mode
  const editorTheme = isDarkMode ? vscodeDark : githubLight;

  // Load Mermaid library once on component mount
  useEffect(() => {
    import("mermaid")
      .then((m) => {
        m.default.initialize({
          startOnLoad: true,
          theme: diagramTheme,
          securityLevel: "loose",
          flowchart: { curve: "basis" },
        });

        //@ts-ignore
        setMermaid(m.default);
      })
      .catch((err) => {
        console.error("Failed to load Mermaid", err);
        setError("Failed to load diagram rendering library");
      });
  }, []);

  // Update theme when it changes
  useEffect(() => {
    if (mermaid) {
      (mermaid as Mermaid).initialize({
        startOnLoad: true,
        theme: diagramTheme,
        securityLevel: "loose",
        flowchart: { curve: "basis" },
      });
      renderDiagram();
    }
  }, [diagramTheme]);

  // Render diagram when mermaid code changes or when the component is visible
  useEffect(() => {
    if (mermaid && mermaidCode) {
      renderDiagram();
    }
  }, [mermaid, mermaidCode, activeTab]);

  // Re-render diagram when tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && mermaid && mermaidCode) {
        // Force re-render when tab becomes visible again
        renderDiagram();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [mermaid, mermaidCode]);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const renderDiagram = () => {
    if (!previewRef.current || !mermaid || !mermaidCode) return;

    try {
      // Clear previous diagram
      previewRef.current.innerHTML = "";

      // Create a container for the diagram
      const container = document.createElement("div");
      container.className =
        "mermaid h-full w-full justify-center items-center flex";
      container.textContent = mermaidCode;

      previewRef.current.appendChild(container);

      // Let Mermaid render the diagram

      (mermaid as Mermaid).contentLoaded();
    } catch (err) {
      console.error("Failed to render diagram", err);
      previewRef.current.innerHTML = `<div class="text-red-500">Error rendering diagram: ${
        (err as any).message
      }</div>`;
    }
  };
  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/diagram",
        { prompt },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      setMermaidCode(response.data.mermaidCode);
      toast.success("Diagram generated", {
        description: "Your diagram has been successfully created",
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.message ||
        "An error occurred while generating the diagram";

      setError(errorMessage);
      toast.error("Error", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (type: "code" | "image") => {
    if (type === "code") {
      navigator.clipboard.writeText(mermaidCode);
      setCopied(true);
      toast.success("Copied!", {
        description: "Diagram code copied to clipboard",
      });
    } else if (previewRef.current) {
      // For copying the diagram as an SVG
      const svgElement = previewRef.current.querySelector("svg");
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        navigator.clipboard.writeText(svgData);
        setCopied(true);
        toast.success("Copied!", {
          description: "SVG code copied to clipboard",
        });
      }
    }
  };

  const copyImageToClipboard = async () => {
    if (!previewRef.current) return;

    const svgElement = previewRef.current.querySelector("svg");
    if (!svgElement) return;

    try {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas dimensions
      const svgRect = svgElement.getBoundingClientRect();
      canvas.width = exportSize === "custom" ? customWidth : svgRect.width;
      canvas.height = exportSize === "custom" ? customHeight : svgRect.height;

      // Create an image from the SVG
      const img = new Image();
      img.crossOrigin = "anonymous";

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      // Wait for the image to load, then draw it on the canvas
      img.onload = async () => {
        (ctx as CanvasRenderingContext2D).drawImage(
          img,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          try {
            // Create a ClipboardItem and write it to the clipboard
            // @ts-ignore
            const item = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard.write([item]);

            toast.success("Copied!", {
              description: "Diagram image copied to clipboard",
            });
          } catch (err) {
            console.error("Failed to copy image to clipboard:", err);
            toast.error("Error", {
              description: "Failed to copy image to clipboard",
            });
          } finally {
            URL.revokeObjectURL(url);
          }
        });
      };

      img.src = url;
    } catch (err) {
      console.error("Failed to copy image to clipboard:", err);
      toast.error("Error", {
        description: "Failed to copy image to clipboard",
      });
    }
  };

  const handleExport = (
    type: "code" | "image",
    format: "svg" | "png" | "jpeg" | "pdf" = "png"
  ) => {
    if (type === "code") {
      // Download code as text file
      const element = document.createElement("a");
      const file = new Blob([mermaidCode], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "diagram.mmd";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);

      toast.success("Exported!", {
        description: "Diagram code exported as .mmd file",
      });
    } else if (previewRef.current) {
      const svgElement = previewRef.current.querySelector("svg");
      if (!svgElement) return;

      if (format === "svg") {
        // Download SVG
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], {
          type: "image/svg+xml;charset=utf-8",
        });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = "diagram.svg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);

        toast.success("Exported!", {
          description: "Diagram exported as SVG",
        });
      } else if (format === "png") {
        // Download PNG
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions based on export size settings
        const svgRect = svgElement.getBoundingClientRect();
        canvas.width = exportSize === "custom" ? customWidth : svgRect.width;
        canvas.height = exportSize === "custom" ? customHeight : svgRect.height;

        // Create an image from the SVG
        const img = new Image();
        img.crossOrigin = "anonymous";

        // Convert SVG to data URL
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          // Draw the image on the canvas
          (ctx as CanvasRenderingContext2D).drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
          );

          // Convert canvas to data URL and download
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = "diagram.png";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);

          toast.success("Exported!", {
            description: "Diagram exported as PNG",
          });
        };

        img.src = url;
      } else if (format === "jpeg") {
        // Download JPEG
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions based on export size settings
        const svgRect = svgElement.getBoundingClientRect();
        canvas.width = exportSize === "custom" ? customWidth : svgRect.width;
        canvas.height = exportSize === "custom" ? customHeight : svgRect.height;

        // Create an image from the SVG
        const img = new Image();
        img.crossOrigin = "anonymous";

        // Convert SVG to data URL
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], {
          type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          // Fill with white background for JPEG
          (ctx as CanvasRenderingContext2D).fillStyle = "white";
          (ctx as CanvasRenderingContext2D).fillRect(
            0,
            0,
            canvas.width,
            canvas.height
          );

          // Draw the image on the canvas
          (ctx as CanvasRenderingContext2D).drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
          );

          // Convert canvas to data URL and download
          const jpegUrl = canvas.toDataURL("image/jpeg", 0.9);
          const downloadLink = document.createElement("a");
          downloadLink.href = jpegUrl;
          downloadLink.download = "diagram.jpg";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(url);

          toast.success("Exported!", {
            description: "Diagram exported as JPEG",
          });
        };

        img.src = url;
      } else if (format === "pdf") {
        // For PDF export, we'll use jsPDF library
        // First, dynamically import jsPDF
        import("jspdf")
          .then(({ default: jsPDF }) => {
            const svgRect = svgElement.getBoundingClientRect();
            const width = exportSize === "custom" ? customWidth : svgRect.width;
            const height =
              exportSize === "custom" ? customHeight : svgRect.height;

            // Create a canvas to render the SVG
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");

            // Create an image from the SVG
            const img = new Image();
            img.crossOrigin = "anonymous";

            // Convert SVG to data URL
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], {
              type: "image/svg+xml;charset=utf-8",
            });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
              // Fill with white background
              (ctx as CanvasRenderingContext2D).fillStyle = "white";
              (ctx as CanvasRenderingContext2D).fillRect(0, 0, width, height);

              // Draw the image on the canvas
              (ctx as CanvasRenderingContext2D).drawImage(
                img,
                0,
                0,
                width,
                height
              );

              // Convert to PDF
              const pdf = new jsPDF({
                orientation: width > height ? "landscape" : "portrait",
                unit: "px",
                compress: false,
                format: [width, height],
              });

              // Add the image to the PDF
              pdf.addImage(
                canvas.toDataURL("image/png"),
                "PNG",
                0,
                0,
                width,
                height
              );

              // Save the PDF
              pdf.save("diagram.pdf");

              URL.revokeObjectURL(url);

              toast.success("Exported!", {
                description: "Diagram exported as PDF",
              });
            };

            img.src = url;
          })
          .catch((err) => {
            console.error("Failed to load jsPDF", err);
            toast.error("Error", {
              description: "Failed to load PDF export library",
            });
          });
      }
    }
  };

  const toggleFullScreenPreview = () => {
    setFullScreenPreview(!fullScreenPreview);
  };

  const loadTemplate = (
    type: "flowchart" | "sequence" | "mindmap" | "gantt" | "classDiagram"
  ) => {
    setMermaidCode(diagramTemplates[type] || diagramTemplates.flowchart);
    toast.success("Template loaded", {
      description: `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } template loaded`,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl">Diagram Generator</CardTitle>
            <div className="flex flex-wrap gap-2">
              {/*@ts-ignore*/}
              <Select value={diagramTheme} onValueChange={setDiagramTheme}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="forest">Forest</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileCode className="mr-2 h-4 w-4" />
                    Templates
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => loadTemplate("flowchart")}>
                    Flowchart
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => loadTemplate("sequence")}>
                    Sequence Diagram
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => loadTemplate("mindmap")}>
                    Mind Map
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => loadTemplate("gantt")}>
                    Gantt Chart
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => loadTemplate("classDiagram")}
                  >
                    Class Diagram
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label htmlFor="prompt" className="block text-sm font-medium mb-2">
              Enter your diagram prompt:
            </label>
            <Textarea
              id="prompt"
              placeholder="Describe the diagram you want to create (e.g., 'Create a mindmap for language learning')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Diagram"
            )}
          </Button>
          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
        </CardContent>
      </Card>

      {mermaidCode && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Diagram Editor</CardTitle>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="hidden sm:block"
              >
                <TabsList>
                  <TabsTrigger value="editor">Side-by-Side</TabsTrigger>
                  <TabsTrigger value="codeOnly">Code Only</TabsTrigger>
                  <TabsTrigger value="previewOnly">Preview Only</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className={`${
                activeTab === "editor"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-0"
                  : "block"
              }`}
            >
              {/* Code Editor */}
              {(activeTab === "editor" || activeTab === "codeOnly") && (
                <div className="border-r p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Code</h3>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyToClipboard("code")}
                            >
                              {copied ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy code</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExport("code")}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Export code</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="w-full border rounded-md overflow-hidden">
                    {/* Replace the SyntaxHighlighter with CodeMirror */}
                    <CodeMirror
                      value={mermaidCode}
                      height="300px"
                      extensions={[mermaidLanguage]}
                      onChange={(value) => setMermaidCode(value)}
                      theme={editorTheme}
                      basicSetup={{
                        lineNumbers: true,
                        highlightActiveLine: true,
                        highlightSelectionMatches: true,
                        autocompletion: true,
                        foldGutter: true,
                        indentOnInput: true,
                      }}
                      className="text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Preview */}
              {(activeTab === "editor" || activeTab === "previewOnly") && (
                <div
                  className={`p-4 ${
                    fullScreenPreview
                      ? "fixed inset-0 z-50 bg-white dark:bg-gray-950"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium">Preview</h3>
                    <div className="flex gap-2">
                      <Dialog
                        open={showExportDialog}
                        onOpenChange={setShowExportDialog}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Export Diagram</DialogTitle>
                            <DialogDescription>
                              Choose your export format and options
                            </DialogDescription>
                          </DialogHeader>

                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="format">Format</Label>
                              <RadioGroup
                                defaultValue="png"
                                value={exportFormat}
                                //@ts-ignore
                                onValueChange={setExportFormat}
                                className="flex gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="png" id="png" />
                                  <Label htmlFor="png">PNG</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="svg" id="svg" />
                                  <Label htmlFor="svg">SVG</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="jpeg" id="jpeg" />
                                  <Label htmlFor="jpeg">JPEG</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="pdf" id="pdf" />
                                  <Label htmlFor="pdf">PDF</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="size">Size</Label>
                              <RadioGroup
                                defaultValue="auto"
                                value={exportSize}
                                onValueChange={setExportSize}
                                className="flex gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="auto" id="auto" />
                                  <Label htmlFor="auto">Auto</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="custom" id="custom" />
                                  <Label htmlFor="custom">Custom</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {exportSize === "custom" && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="width">Width (px)</Label>
                                  <Input
                                    id="width"
                                    type="number"
                                    value={customWidth}
                                    onChange={(e) =>
                                      setCustomWidth(Number(e.target.value))
                                    }
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="height">Height (px)</Label>
                                  <Input
                                    id="height"
                                    type="number"
                                    value={customHeight}
                                    onChange={(e) =>
                                      setCustomHeight(Number(e.target.value))
                                    }
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setShowExportDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                handleExport("image", exportFormat);
                                setShowExportDialog(false);
                              }}
                            >
                              Export
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={copyImageToClipboard}
                            >
                              <Clipboard className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy image to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={toggleFullScreenPreview}
                            >
                              {fullScreenPreview ? (
                                <Minimize2 className="h-4 w-4" />
                              ) : (
                                <Maximize2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {fullScreenPreview
                                ? "Exit fullscreen"
                                : "Fullscreen"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div
                    className="bg-gray-50 dark:bg-gray-400 rounded overflow-auto min-h-[300px] flex items-center justify-center p-0"
                    ref={previewRef}
                    style={previewStyles}
                  >
                    {!mermaidCode && (
                      <div className="text-gray-400 p-8 text-center">
                        No diagram to preview yet
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t p-4">
            <Button variant="outline" onClick={() => setMermaidCode("")}>
              Clear
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
