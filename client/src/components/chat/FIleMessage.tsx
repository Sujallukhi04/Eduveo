import React, { useState } from "react";
import {
  FileText,
  Image,
  Film,
  Music,
  Archive,
  File,
  Download,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type FileMessageProps = {
  type: "file";
  id: string;
  name: string;
  url: string;
  fileType: string;
  size: number;
  userId: string;
  groupId: string;
  caption?: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
};

const FileMessage = ({ file }: { file: FileMessageProps }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const getFileIcon = () => {
    const fileType = file.fileType;
    if (fileType.startsWith("image/")) return <Image className="w-5 h-5" />;
    if (fileType.startsWith("video/")) return <Film className="w-5 h-5" />;
    if (fileType.startsWith("audio/")) return <Music className="w-5 h-5" />;
    if (fileType.includes("pdf")) return <FileText className="w-5 h-5" />;
    if (fileType.includes("zip") || fileType.includes("rar"))
      return <Archive className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleDownload = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    window.open(file.url, "_blank");
  };

  const handlePlay = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsPlaying(true);
  };

  if (file.fileType.startsWith("image/")) {
    return (
      <div className="max-w-xs">
        <div className="relative rounded-xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm">
          <img
            src={file.previewUrl || file.thumbnailUrl || file.url}
            alt={file.name}
            className="w-full object-cover"
          />
          {file.caption && (
            <p className="text-sm p-2 text-gray-700 dark:text-gray-300">
              {file.caption}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (file.fileType.startsWith("video/")) {
    return (
      <div className="max-w-sm">
        <div className="relative rounded-xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm">
          {!isPlaying && file.thumbnailUrl ? (
            <>
              <div className="aspect-video relative">
                <img
                  src={file.thumbnailUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/10 hover:bg-black/20 transition-colors"
                  onClick={handlePlay}
                >
                  <div className="rounded-full bg-black/50 p-4 hover:bg-black/70 transition-colors">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="aspect-video">
              <video
                controls
                className="w-full h-full"
                autoPlay={isPlaying}
                src={file.url}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          <div className="p-3 border-t dark:border-zinc-700">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2 text-blue-600 dark:text-blue-400">
                <Film className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {formatFileSize(file.size)} •{" "}
                  {file.metadata?.duration &&
                    formatDuration(file.metadata.duration)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (file.fileType.startsWith("audio/")) {
    return (
      <div className="w-96 rounded-xl bg-white dark:bg-zinc-800 shadow-sm">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-blue-100/50 dark:bg-blue-900/30 p-3">
              <Music className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatFileSize(file.size)}
                {file.metadata?.duration &&
                  ` • ${formatDuration(file.metadata.duration)}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
              onClick={handleDownload}
            >
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </Button>
          </div>
          <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-3">
            <audio controls className="w-full h-10">
              <source src={file.url} type={file.fileType} />
            </audio>
          </div>
          {file.caption && (
            <p className="text-sm mt-3 text-gray-700 dark:text-gray-300">
              {file.caption}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm rounded-xl bg-white dark:bg-zinc-800 shadow-sm">
      {file.previewUrl && file.fileType.includes("pdf") && (
        <div className="h-32 overflow-hidden rounded-t-xl">
          <img
            src={file.previewUrl}
            alt={`Preview of ${file.name}`}
            className="w-full object-cover object-top"
          />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2 text-blue-600 dark:text-blue-400">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {formatFileSize(file.size)}
              {file.metadata?.pageCount &&
                ` • ${file.metadata.pageCount} pages`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </Button>
        </div>
        {file.caption && (
          <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
            {file.caption}
          </p>
        )}
      </div>
    </div>
  );
};

export default FileMessage;
