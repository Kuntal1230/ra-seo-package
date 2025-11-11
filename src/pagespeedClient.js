// Small client function that calls your backend. Keep this in your frontend app.
export async function runPageSpeedForUrl(
  url,
  options = { endpoint: "/seo/pagespeed", strategy: "mobile" }
) {
  const res = await fetch(options.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, strategy: options.strategy }),
  });
  if (!res.ok) throw new Error("PageSpeed request failed: " + res.status);
  return res.json();
}
