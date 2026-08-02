import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "./components/dashboard-header";
import { ProfileCard } from "./components/profile-card";
import { SitesList, type Site } from "./components/sites-list";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: sites } = await supabase
    .from("sites")
    .select("id, domain, created_at")
    .order("created_at", { ascending: true });

  return (
    <main className="flex flex-1 flex-col px-4 py-12">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <DashboardHeader />
        <ProfileCard
          email={user.email}
          userId={user.id}
          createdAt={user.created_at}
        />
        <SitesList
          initialSites={(sites ?? []) as Site[]}
          userId={user.id}
        />
      </div>
    </main>
  );
}
