import type React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { ExternalLink } from "lucide-react";

interface MessageContentProps {
  content: string;
}

interface OGData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

type OGDataCache = {
  [url: string]: {
    data: OGData;
    timestamp: number;
  };
};

const CACHE_DURATION = 5 * 60 * 1000;
const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const ogDataCache: OGDataCache = {};

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  const [firstLink, setFirstLink] = useState<string | null>(null);
  const [ogData, setOgData] = useState<OGData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOGData = async (url: string) => {
    const cachedData = ogDataCache[url];
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      setOgData(cachedData.data);
      return;
    }

    setLoading(true);

    try {
      const response = await api.get("/og-data", { params: { url } });
      const data = response.data;

      ogDataCache[url] = {
        data,
        timestamp: Date.now(),
      };

      setOgData(data);
    } catch (error) {
      console.error("Error fetching OG data:", error);
      setOgData({ url }); // Fallback with just the URL
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const links = content.match(URL_REGEX);
    if (links && links.length > 0) {
      setFirstLink(links[0]);
      fetchOGData(links[0]);
    }
  }, [content]);

  // Create an array of parts with their types
  const parts: { text: string; isLink: boolean }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset the regex state
  URL_REGEX.lastIndex = 0;

  // Find all matches and build the parts array
  while ((match = URL_REGEX.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        text: content.slice(lastIndex, match.index),
        isLink: false,
      });
    }
    parts.push({
      text: match[0],
      isLink: true,
    });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text if any
  if (lastIndex < content.length) {
    parts.push({
      text: content.slice(lastIndex),
      isLink: false,
    });
  }

  return (
    <div className="space-y-2">
      <div className="space-x-1">
        {parts.map((part, i) =>
          part.isLink ? (
            <a
              key={i}
              href={part.text}
              target="_blank"
              rel="noopener noreferrer"
              className="text-black dark:text-white  hover:underline inline-flex items-center space-x-1 font-medium"
            >
              <span>{part.text}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
      </div>
      {firstLink && (
        <LinkPreview url={firstLink} ogData={ogData} isLoading={loading} />
      )}
    </div>
  );
};

const LinkPreview: React.FC<{
  url: string;
  ogData: OGData | null;
  isLoading: boolean;
}> = ({ url, ogData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-lg border bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm overflow-hidden hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out p-3">
        <div className="flex gap-3">
          <div className="w-[100px] h-[100px] bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-1">
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ogData) return null;

  try {
    const domain = new URL(url).hostname.replace("www.", "");

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-md overflow-hidden hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 ease-in-out p-3"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {ogData.image && (
            <div className="relative w-full sm:w-[120px] h-[140px] sm:h-[100px] flex-shrink-0 overflow-hidden rounded-md">
              <img
                src={ogData.image || "/placeholder.svg"}
                alt=""
                className="absolute inset-0 w-full h-full object-cover rounded-md"
              />
            </div>
          )}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="text-xs font-medium text-blue-500 dark:text-blue-400">
              {domain}
            </div>
            <h3 className="font-semibold text-sm leading-tight truncate text-gray-900 dark:text-gray-100">
              {ogData.title || "Visit Link"}
            </h3>
            {ogData.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {ogData.description}
              </p>
            )}
          </div>
        </div>
      </a>
    );
  } catch {
    // Fallback for invalid URLs
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-md p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 ease-in-out"
      >
        <div className="flex items-center space-x-2">
          <ExternalLink className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
            {url}
          </span>
        </div>
      </a>
    );
  }
};

export { MessageContent, LinkPreview };
