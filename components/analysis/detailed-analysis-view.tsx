"use client";
import { useState } from 'react';
import { useDetailedAnalysis } from '@/hooks/useDetailedAnalysis';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalysisCategory } from '@/lib/services/analysis-service';

export const DetailedAnalysisView = () => {
  const [url, setUrl] = useState('');
  const { analyze, results, isLoading, error, exportAsCSV, exportAsPDF } = useDetailedAnalysis();

  const handleAnalyze = async () => {
    if (!url) return;
    await analyze(url);
  };

  const handleExportCSV = () => {
    const csv = exportAsCSV();
    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analysis-results.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const handleExportPDF = async () => {
    const pdf = await exportAsPDF();
    if (pdf) {
      const url = window.URL.createObjectURL(pdf);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analysis-results.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Website Analysis</CardTitle>
          <CardDescription>Enter a URL to analyze its accessibility, performance, and SEO</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAnalyze} disabled={isLoading || !url}>
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>Response Time: {results.responseTime}ms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Overall Score</h3>
              <div className="w-full bg-secondary rounded-full h-4">
                <div
                  className={cn(
                    "h-4 rounded-full",
                    results.overallScore >= 90 ? "bg-emerald-500" :
                    results.overallScore >= 70 ? "bg-amber-500" :
                    "bg-destructive"
                  )}
                  style={{ width: `${results.overallScore}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{results.overallScore}%</p>
            </div>

            <Tabs defaultValue="aria" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="aria">ARIA</TabsTrigger>
                <TabsTrigger value="contrast">Color Contrast</TabsTrigger>
                <TabsTrigger value="semantics">Semantics</TabsTrigger>
                <TabsTrigger value="keyboard">Keyboard</TabsTrigger>
              </TabsList>

              <TabsContent value="aria">
                <CategoryContent category={results.categories.aria} />
              </TabsContent>

              <TabsContent value="contrast">
                <CategoryContent category={results.categories.contrast} />
              </TabsContent>

              <TabsContent value="semantics">
                <CategoryContent category={results.categories.semantics} />
              </TabsContent>

              <TabsContent value="keyboard">
                <CategoryContent category={results.categories.keyboard} />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

const CategoryContent = ({ category }: { category: AnalysisCategory }) => (
  <ScrollArea className="h-[400px] rounded-md border p-4">
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-foreground">Score</h3>
        <div className="w-full bg-secondary rounded-full h-4">
          <div
            className={cn(
              "h-4 rounded-full",
              category.score >= 90 ? "bg-emerald-500" :
              category.score >= 70 ? "bg-amber-500" :
              "bg-destructive"
            )}
            style={{ width: `${category.score}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-1">{category.score}%</p>
      </div>

      <h3 className="font-semibold text-foreground">Issues ({category.issues.length})</h3>
      {category.issues.map((issue, index) => (
        <Alert
          key={index}
          variant={issue.impact === 'critical' ? 'destructive' : 'default'}
          className={cn(
            "border",
            issue.impact === 'critical' && 'border-destructive/50 bg-destructive/10',
            issue.impact === 'serious' && 'border-orange-500/50 bg-orange-500/10',
            issue.impact === 'moderate' && 'border-amber-500/50 bg-amber-500/10',
            issue.impact === 'minor' && 'border-blue-500/50 bg-blue-500/10'
          )}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-foreground">{issue.type}</AlertTitle>
          <AlertDescription>
            <p className="text-sm text-muted-foreground">{issue.message}</p>
            {issue.suggestion && (
              <p className="text-sm font-medium mt-2">Suggestion: {issue.suggestion}</p>
            )}
            {issue.element && (
              <pre className="mt-2 p-2 rounded bg-muted text-xs overflow-x-auto">
                {issue.element}
              </pre>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  </ScrollArea>
);
