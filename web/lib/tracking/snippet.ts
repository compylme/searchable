export function trackEndpointUrl(
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
): string {
  return `${supabaseUrl.replace(/\/$/, "")}/functions/v1/track`;
}

export function buildTrackingSnippet(
  siteId: string,
  trackUrl = trackEndpointUrl(),
): string {
  return `<script>
(function(s){
  var d=document,g=d.createElement('script');
  g.async=1;g.src='${trackUrl}?sid='+s;
  d.head.appendChild(g);
})('${siteId}');
</script>`;
}
