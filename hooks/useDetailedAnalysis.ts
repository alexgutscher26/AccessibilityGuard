import { useState } from 'react';
import { AnalysisService, AnalysisResult } from '@/lib/services/analysis-service';
import { jsPDF } from 'jspdf';
import { Parser } from '@json2csv/plainjs';

interface UseDetailedAnalysisProps {
  cacheEnabled?: boolean;
}

interface UseDetailedAnalysisReturn {
  analyze: (url: string) => Promise<void>;
  results: AnalysisResult | null;
  isLoading: boolean;
  error: Error | null;
  exportAsCSV: () => string | null;
  exportAsPDF: () => Promise<Blob | null>;
}

export const useDetailedAnalysis = ({ 
  cacheEnabled = true 
}: UseDetailedAnalysisProps = {}): UseDetailedAnalysisReturn => {
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analysisService = new AnalysisService();

  const analyze = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const analysisResults = await analysisService.analyzeUrl(url);
      setResults(analysisResults);
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Unknown error occurred');
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportAsCSV = () => {
    if (!results) return null;
    
    try {
      // Flatten the results for CSV export
      const flattenedData = {
        url: results.url,
        responseTime: results.responseTime,
        overallScore: results.overallScore,
        ariaScore: results.categories.aria.score,
        colorContrastScore: results.categories.colorContrast.score,
        semanticsScore: results.categories.semantics.score,
        keyboardScore: results.categories.keyboard.score,
      };

      const parser = new Parser();
      return parser.parse(flattenedData);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      return null;
    }
  };

  const exportAsPDF = async () => {
    if (!results) return null;

    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Accessibility Analysis Report', 20, 20);
      
      // Add basic info
      doc.setFontSize(12);
      doc.text(`URL: ${results.url}`, 20, 40);
      doc.text(`Overall Score: ${results.overallScore}%`, 20, 50);
      doc.text(`Response Time: ${results.responseTime}ms`, 20, 60);
      
      // Add category scores
      doc.setFontSize(16);
      doc.text('Category Scores', 20, 80);
      doc.setFontSize(12);
      doc.text(`ARIA: ${results.categories.aria.score}%`, 30, 90);
      doc.text(`Color Contrast: ${results.categories.colorContrast.score}%`, 30, 100);
      doc.text(`Semantics: ${results.categories.semantics.score}%`, 30, 110);
      doc.text(`Keyboard Navigation: ${results.categories.keyboard.score}%`, 30, 120);
      
      // Add issues section
      let yPosition = 140;
      Object.entries(results.categories).forEach(([category, data]) => {
        if (data.issues.length > 0) {
          doc.setFontSize(14);
          doc.text(`${category} Issues`, 20, yPosition);
          yPosition += 10;
          
          data.issues.forEach((issue) => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
            doc.setFontSize(10);
            doc.text(`• ${issue.message}`, 30, yPosition);
            yPosition += 10;
          });
          
          yPosition += 10;
        }
      });
      
      return doc.output('blob');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      return null;
    }
  };

  return {
    analyze,
    results,
    isLoading,
    error,
    exportAsCSV,
    exportAsPDF
  };
};
