(() => {
  const script = document.currentScript;
  const siteId = script?.dataset.siteId;

  if (!siteId || !script?.src) return;

  const endpoint =
    script.dataset.endpoint || new URL("/api/track", script.src).href;

  const payload = {
    site_id: siteId,
    page_url: window.location.href,
    timestamp: new Date().toISOString(),
  };

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "omit",
    mode: "cors",
    keepalive: true,
  }).catch(() => {
    // Tracking must never break the host page.
  });
})();
