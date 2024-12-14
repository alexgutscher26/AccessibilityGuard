'use client';

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { AccessibilityIssue } from "@/lib/services/analysis-service";
import { useUser } from "@clerk/nextjs";

export const useAnalysis = () => {
  const { user } = useUser();
  const createAnalysis = useMutation(api.analysis.createAnalysis);
  const updateAnalysis = useMutation(api.analysis.updateAnalysis);
  const analyses = useQuery(
    api.analysis.getUserAnalyses,
    user?.id ? { userId: user.id } : "skip"
  );

  const startAnalysis = async (url: string) => {
    if (!user?.id) throw new Error("User must be logged in to analyze URLs");
    return await createAnalysis({ url, userId: user.id });
  };

  const updateAnalysisResult = async (
    id: string,
    score: number,
    issues: AccessibilityIssue[],
    status: "completed" | "failed" | "in-progress"
  ) => {
    await updateAnalysis({ id, score, issues, status });
  };

  return {
    startAnalysis,
    updateAnalysisResult,
    analyses: analyses ?? [],
    isLoading: !user || analyses === undefined,
  };
};
