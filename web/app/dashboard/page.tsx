import { redirect } from "next/navigation";
import { listSites } from "@/lib/sites/sites";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "./components/dashboard-header";
import { ProfileCard } from "./components/profile-card";
import { SitesList } from "./components/sites-list";
import { TrackingSetup } from "./components/tracking-setup";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const sites = await listSites(supabase);

  return (
    <main className="flex flex-1 flex-col px-4 py-12">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <DashboardHeader />
        <ProfileCard
          email={user.email}
          userId={user.id}
          createdAt={user.created_at}
        />
        <TrackingSetup />
        <SitesList initialSites={sites} userId={user.id} />
      </div>
    </main>
  );
}
