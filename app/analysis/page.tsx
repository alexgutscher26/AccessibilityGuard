import { DetailedAnalysisView } from '@/components/analysis/detailed-analysis-view';

export const metadata = {
  title: 'Detailed Analysis | Accessibility Analyzer',
  description: 'Analyze websites for accessibility, performance, and SEO issues',
};

export default function AnalysisPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Website Analysis</h1>
        <DetailedAnalysisView />
      </div>
    </main>
  );
}
