/**
 * Same behavior as api/parse-job.js — Firebase Hosting rewrite: /api/parse-job → this function.
 */
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const html = await fetchPage(url);
    const text = extractJobText(html, url);

    if (!text || text.length < 100) {
      return res.status(422).json({
        error: "Could not extract job description from this page. Please paste the text manually.",
      });
    }

    return res.status(200).json({ text });
  } catch (err) {
    console.error("parse-job error:", err.message);
    return res.status(500).json({
      error:
        "Failed to fetch the page. The site may block automated access. Please paste the text manually.",
    });
  }
}

function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchPage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,it;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function extractJobText(html, urlString) {
  const hostname = new URL(urlString).hostname;

  if (hostname.includes("linkedin.com")) {
    return extractBySelectors(html, [
      "div.description__text",
      "div.show-more-less-html__markup",
      "section.description",
    ]);
  }
  if (hostname.includes("indeed.com")) {
    return extractBySelectors(html, [
      "div#jobDescriptionText",
      "div.jobsearch-jobDescriptionText",
    ]);
  }
  if (hostname.includes("infojobs.it") || hostname.includes("infojobs.net")) {
    return extractBySelectors(html, [
      "div.offer-description",
      'div[class*="description"]',
    ]);
  }
  if (hostname.includes("glassdoor.com")) {
    return extractBySelectors(html, [
      "div.jobDescriptionContent",
      'div[class*="JobDescription"]',
    ]);
  }
  return extractGeneric(html);
}

function extractBySelectors(html, selectors) {
  for (const selector of selectors) {
    const text = extractByPattern(html, selector);
    if (text && text.length > 100) return text;
  }
  return extractGeneric(html);
}

function extractByPattern(html, cssSelector) {
  const classMatch = cssSelector.match(/\.([\w-]+)$/);
  const idMatch = cssSelector.match(/#([\w-]+)/);
  const tagMatch = cssSelector.match(/^(\w+)/);

  let pattern;
  if (idMatch) {
    pattern = new RegExp(`id=["']${idMatch[1]}["'][^>]*>([\\s\\S]*?)<\\/`, "i");
  } else if (classMatch) {
    pattern = new RegExp(
      `class=["'][^"']*${classMatch[1]}[^"']*["'][^>]*>([\\s\\S]*?)<\\/(?:div|section|article)`,
      "i"
    );
  } else if (tagMatch) {
    pattern = new RegExp(`<${tagMatch[1]}[^>]*>([\\s\\S]*?)<\\/${tagMatch[1]}>`, "i");
  }

  if (!pattern) return null;
  const match = html.match(pattern);
  if (!match) return null;
  return cleanHtml(match[1]);
}

function extractGeneric(html) {
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "");

  const divMatches = [...cleaned.matchAll(/<(?:div|section|article)[^>]*>([\s\S]{300,3000}?)<\/(?:div|section|article)>/gi)];
  if (!divMatches.length) return cleanHtml(cleaned);

  const best = divMatches
    .map((m) => ({ raw: m[1], text: cleanHtml(m[1]) }))
    .filter((b) => b.text.length > 150)
    .sort((a, b) => b.text.length - a.text.length)[0];

  return best ? best.text : cleanHtml(cleaned);
}

function cleanHtml(htmlFragment) {
  return htmlFragment
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

module.exports = handler;
