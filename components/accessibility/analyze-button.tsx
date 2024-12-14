"use client";

import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";

interface AnalyzeButtonProps {
  loading: boolean;
  onClick: () => void;
}

export function AnalyzeButton({ loading, onClick }: AnalyzeButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className="md:w-auto w-full"
    >
      {loading ? (
        "Analyzing..."
      ) : (
        <>
          <SearchIcon className="mr-2 h-4 w-4" />
          Analyze Website
        </>
      )}
    </Button>
  );
}