'use client';

import { useUser } from "@clerk/nextjs";
import AnalyticsDashboard from "./AnalyticsDashboard";

export default function DashboardPage() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-8">Analytics Dashboard</h1>
      <AnalyticsDashboard userId={user.id} />
    </div>
  );
}
