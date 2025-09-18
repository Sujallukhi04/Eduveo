import type { Request, Response } from "express";
import ogs from "open-graph-scraper";
import NodeCache from "node-cache";
import { URL } from "url";

const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

const sanitizeUrl = (inputUrl: string): string => {
  try {
    const urlObject = new URL(inputUrl);
    // Remove search params but keep the hash if present
    return `${urlObject.protocol}//${urlObject.host}`;
  } catch (error) {
    // If URL parsing fails, return the original URL
    return inputUrl;
  }
};

export const getOgData = async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Sanitize the URL before processing
    const sanitizedUrl = sanitizeUrl(url);

    // Check cache first using sanitized URL
    const cachedData = cache.get(sanitizedUrl);
    if (cachedData) {
      return res.json(cachedData);
    }

    const options = {
      url: sanitizedUrl,
      timeout: 5000,
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
    };

    const { result } = await ogs(options);

    const ogData = {
      url: sanitizedUrl,
      title: result.ogTitle,
      description: result.ogDescription,
      image: result.ogImage?.[0]?.url,
      siteName: result.ogSiteName,
    };

    // Store in cache using sanitized URL
    cache.set(sanitizedUrl, ogData);

    res.json(ogData);
  } catch (error) {
    console.error("Error fetching OG data:", error);
    res.status(500).json({ error: "Failed to fetch OG data" });
  }
};
