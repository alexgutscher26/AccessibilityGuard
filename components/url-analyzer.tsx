'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { AnalysisService } from '@/lib/services/analysis-service';
import { useUser } from '@clerk/nextjs';
import { LoadingSpinner } from './loading-spinner';
import { useAnalysis } from './providers/convex-client-hooks';
import { ResultsDisplay } from './analysis/results-display';

export default function UrlAnalyzer() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<{
    url: string;
    score: number;
    issues: any[];
  } | null>(null);
  
  const { toast } = useToast();
  const { user } = useUser();
  const { startAnalysis, updateAnalysisResult } = useAnalysis();
  const analysisService = new AnalysisService();

  const validateUrl = (url: string): boolean => {
    try {
      if (!url) return false;
      // Add https:// if no protocol is specified
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;
      new URL(urlToTest);
      return true;
    } catch {
      return false;
    }
  };

  const handleAnalysis = async () => {
    if (!validateUrl(url)) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid website URL (e.g., example.com)',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to analyze URLs',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setCurrentResult(null);
      
      // Start analysis in Convex
      const analysisId = await startAnalysis(url);

      // Perform the actual analysis
      const result = await analysisService.analyzeUrl(url);

      // Extract all issues from categories
      const allIssues = Object.values(result.categories).flatMap(category => category.issues);

      // Update analysis with results
      await updateAnalysisResult(
        analysisId,
        result.overallScore,
        allIssues,
        'completed'
      );
      
      // Update current result
      setCurrentResult({
        url,
        score: result.overallScore,
        issues: allIssues,
      });
      
      toast({
        title: 'Analysis Complete',
        description: `Overall accessibility score: ${result.overallScore}%`,
      });
    } catch (error) {
      console.error('Error analyzing URL:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze URL',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="flex w-full items-center space-x-2">
        <Input
          type="url"
          placeholder="Enter website URL (e.g., example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isAnalyzing}
          className="flex-1"
        />
        <Button 
          onClick={handleAnalysis}
          disabled={isAnalyzing || !url.trim()}
        >
          {isAnalyzing ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Analyzing...
            </>
          ) : (
            'Analyze'
          )}
        </Button>
      </div>

      {currentResult && (
        <ResultsDisplay
          url={currentResult.url}
          score={currentResult.score}
          issues={currentResult.issues}
        />
      )}
    </div>
  );
}