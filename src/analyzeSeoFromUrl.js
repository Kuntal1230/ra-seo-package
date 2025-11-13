import { analyzeSeoContent } from "./analyzeSeoContent.js";

export async function analyzeSeoFromUrl(url, focusKeyword) {
  try {
    const response = await fetch(
      `/api/fetch-seo-content?url=${encodeURIComponent(url)}`
    );
    const { html } = await response.json();
    if (!html) return null;

    // Extract standard SEO tags
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const metaDescMatch = html.match(
      /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i
    );

    const title = titleMatch ? titleMatch[1] : "";
    const description = metaDescMatch ? metaDescMatch[1] : "";

    // --- Extract Open Graph tags ---
    const ogTitleMatch = html.match(
      /<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i
    );
    const ogDescMatch = html.match(
      /<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i
    );
    const ogImageMatch = html.match(
      /<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i
    );

    const og_title = ogTitleMatch ? ogTitleMatch[1] : "";
    const og_description = ogDescMatch ? ogDescMatch[1] : "";
    const og_image = ogImageMatch ? ogImageMatch[1] : "";

    // --- Extract Twitter Card tags ---
    const twitterTitleMatch = html.match(
      /<meta\s+name=["']twitter:title["']\s+content=["'](.*?)["']/i
    );
    const twitterDescMatch = html.match(
      /<meta\s+name=["']twitter:description["']\s+content=["'](.*?)["']/i
    );
    const twitterImageMatch = html.match(
      /<meta\s+name=["']twitter:image["']\s+content=["'](.*?)["']/i
    );

    const twitter_title = twitterTitleMatch ? twitterTitleMatch[1] : "";
    const twitter_description = twitterDescMatch ? twitterDescMatch[1] : "";
    const twitter_image = twitterImageMatch ? twitterImageMatch[1] : "";

    // --- Extract Structured Data (JSON-LD) ---
    const schemaMatch = html.match(
      /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i
    );
    const structured_data = schemaMatch ? schemaMatch[1].trim() : "";

    // --- Pass everything into analyzeSeoContent ---
    return analyzeSeoContent({
      title,
      description,
      content: html,
      focusKeyword,
      og_title,
      og_description,
      og_image,
      twitter_title,
      twitter_description,
      twitter_image,
      structured_data,
    });
  } catch (err) {
    console.error("Error analyzing page:", err);
    return null;
  }
}
