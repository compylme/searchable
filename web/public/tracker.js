(() => {
  const script = document.currentScript;
  const siteId = script?.dataset.siteId;
  const endpoint = script?.dataset.endpoint;

  if (!siteId || !endpoint) return;

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
  });
})();
