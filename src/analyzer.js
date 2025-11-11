import he from "he";

export function analyzeSeoContent({
  title,
  description,
  content,
  focusKeyword,
} = {}) {
  const report = {
    titleLength: title ? title.length : 0,
    descriptionLength: description ? description.length : 0,
    wordCount: 0,
    keywordDensity: 0,
    headings: { h1: 0, h2: 0, h3: 0 },
    images: { total: 0, withAlt: 0 },
    links: { internal: 0, external: 0 },
    readability: 0,
    score: 0,
    tips: [],
  };

  if (content) {
    const text = he.decode(content.replace(/<[^>]+>/g, " "));
    const words = text.trim().length ? text.trim().split(/\s+/) : [];
    report.wordCount = words.length;
    if (focusKeyword && words.length) {
      const kwCount = words.filter((w) =>
        w.toLowerCase().includes(focusKeyword.toLowerCase())
      ).length;
      report.keywordDensity = (kwCount / words.length) * 100;
    }

    report.headings.h1 = (content.match(/<h1[\s>]/gi) || []).length;
    report.headings.h2 = (content.match(/<h2[\s>]/gi) || []).length;
    report.headings.h3 = (content.match(/<h3[\s>]/gi) || []).length;

    const imgTags = [...(content.matchAll(/<img [^>]*>/gi) || [])];
    report.images.total = imgTags.length;
    report.images.withAlt = imgTags.filter((img) =>
      /alt\s*=\s*("[^"]+"|'[^']+'|[^\s>]+)/i.test(img[0])
    ).length;

    const links = [...(content.matchAll(/<a [^>]*href=\"([^\"]+)\"/gi) || [])];
    links.forEach((link) => {
      const url = link[1] || "";
      try {
        if (
          url.startsWith("/") ||
          (typeof window !== "undefined" &&
            url.includes(window.location.hostname))
        )
          report.links.internal++;
        else report.links.external++;
      } catch (e) {
        report.links.external++;
      }
    });

    report.readability = Math.max(
      0,
      Math.min(100, 100 - Math.abs(15 - report.wordCount / 100) * 5)
    );
  }

  // Scoring
  let score = 0;
  if (report.titleLength >= 30 && report.titleLength <= 70) score += 15;
  else report.tips.push("Title should be 30–70 chars");
  if (report.descriptionLength >= 50 && report.descriptionLength <= 160)
    score += 10;
  else report.tips.push("Meta description should be 50–160 chars");
  if (report.wordCount >= 300) score += 10;
  else report.tips.push("Add more content (>300 words)");
  if (report.headings.h1 === 1) score += 10;
  else report.tips.push("Exactly one H1 recommended");
  if (report.headings.h2 >= 2) score += 5;
  if (report.images.total > 0 && report.images.withAlt === report.images.total)
    score += 10;
  else if (report.images.total > 0)
    report.tips.push("Some images missing alt text");
  if (report.keywordDensity >= 0.5 && report.keywordDensity <= 2.5) score += 10;
  else report.tips.push("Keep keyword density between 0.5-2.5%");
  if (report.links.internal >= 1) score += 5;
  if (report.links.external >= 1) score += 5;
  if (report.readability > 60) score += 10;
  report.score = Math.min(100, score);
  return report;
}
