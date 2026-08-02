(() => {
    const script = document.currentScript;
    const siteId = script?.dataset.siteId;
  
    if (!siteId) return;
  
    const payload = {
      site_id: siteId,
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
    };
  
    navigator.sendBeacon(
      "http://127.0.0.1:54321/functions/v1/track",
      new Blob([JSON.stringify(payload)], {
        type: "application/json",
      }),
    );
  })();