"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalysis } from "../providers/convex-client-hooks";
import { formatDistanceToNow } from "date-fns";

export function AnalysisHistory() {
  const { user } = useUser();
  const { analyses, isLoading } = useAnalysis();

  if (!user) return null;
  if (isLoading) return <div>Loading...</div>;
  if (!analyses?.length) return <div>No analysis history found</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Analysis History</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analyses.map((analysis) => (
          <Card key={analysis._id}>
            <CardHeader>
              <CardTitle className="text-lg">{analysis.url}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(analysis.timestamp), { addSuffix: true })}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Score:</span>
                  <span className="font-medium">{analysis.score}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium capitalize">{analysis.status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Issues:</span>
                  <span className="font-medium">{analysis.issues.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
