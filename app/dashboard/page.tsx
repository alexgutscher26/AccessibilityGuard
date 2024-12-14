import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { AnalysisHistory } from "@/components/dashboard/analysis-history";

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <DashboardHeader 
        heading="Dashboard" 
        text="View your website accessibility analysis history"
      />
      <div className="grid gap-4">
        <AnalysisHistory />
      </div>
    </div>
  );
}
