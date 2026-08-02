import { notFound, redirect } from "next/navigation";
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

  const { data: site } = await supabase
    .from("sites")
    .select("id, domain, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!site) {
    notFound();
  }

  return <SiteActivity domain={site.domain} siteId={site.id} />;
}
