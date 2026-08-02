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
      "https://YOUR_PROJECT.supabase.co/functions/v1/track",
      new Blob([JSON.stringify(payload)], {
        type: "application/json",
      }),
    );
  })();