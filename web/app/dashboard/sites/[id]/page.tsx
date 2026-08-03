import { notFound, redirect } from "next/navigation";
import { getSiteAnalytics } from "@/lib/analytics/site-analytics";
import { getSite } from "@/lib/sites/sites";
import { createClient } from "@/lib/supabase/server";
import { SiteActivity } from "../../components/site-activity";

type SiteActivityPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SiteActivityPage({
  params,
}: SiteActivityPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const site = await getSite(supabase, id);

  if (!site) {
    notFound();
  }

  const analytics = await getSiteAnalytics(supabase, site.id);

  return (
    <SiteActivity
      domain={site.domain}
      siteId={site.id}
      analytics={analytics}
    />
  );
}
