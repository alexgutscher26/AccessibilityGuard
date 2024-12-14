export interface AnalysisIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  code: string;
  element?: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  suggestion?: string;
}

export interface AnalysisSection {
  score: number;
  issues: AnalysisIssue[];
  summary: string;
  recommendations: string[];
}

export interface DetailedAnalysisResult {
  url: string;
  timestamp: string;
  overallScore: number;
  sections: {
    altText: AnalysisSection;
    colorContrast: AnalysisSection;
    semanticStructure: AnalysisSection;
    keyboardNavigation: AnalysisSection;
    readability: AnalysisSection;
  };
  metadata: {
    pageTitle: string;
    description?: string;
    language?: string;
    responseTime: number;
  };
}
