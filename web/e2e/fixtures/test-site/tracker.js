(() => {
  const script = document.currentScript;
  const siteId = script?.dataset.siteId;

  if (!siteId) return;

  const payload = {
    site_id: siteId,
    page_url: window.location.href,
    timestamp: new Date().toISOString(),
  };

  fetch("http://127.0.0.1:54321/functions/v1/track", {
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
