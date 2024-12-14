import {
  analyzeAria,
  analyzeColorContrast,
  analyzeSemantics,
  analyzeKeyboardNavigation,
} from '../analyzers';
import axios from 'axios';

export interface AccessibilityIssue {
  type: string;
  message: string;
  code: string;
  impact: string;
  selector?: string;
}

export interface CategoryResult {
  score: number;
  issues: AccessibilityIssue[];
}

export interface AnalysisResult {
  url: string;
  responseTime: number;
  overallScore: number;
  categories: {
    aria: CategoryResult;
    colorContrast: CategoryResult;
    semantics: CategoryResult;
    keyboard: CategoryResult;
  };
}

export class AnalysisService {
  private async fetchAndParse(url: string): Promise<{ document: Document; responseTime: number }> {
    const startTime = performance.now();
    
    try {
      // Use the Next.js API route to fetch the URL
      const response = await axios.post('/api/analyze/fetch', { url }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (!response.data.html) {
        throw new Error('No HTML content received from server');
      }

      const responseTime = performance.now() - startTime;
      
      // Create a new parser and parse the HTML
      const parser = new DOMParser();
      const document = parser.parseFromString(response.data.html, 'text/html');
      
      return { document, responseTime };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        }
        if (error.response) {
          throw new Error(`Failed to fetch URL: ${error.response.status} ${error.response.statusText}`);
        }
        if (error.request) {
          throw new Error('No response received from server. Please check the URL and try again.');
        }
      }
      throw new Error('Failed to fetch and parse the URL. Please check the URL and try again.');
    }
  }

  async analyzeUrl(url: string): Promise<AnalysisResult> {
    try {
      const formattedUrl = this.formatUrl(url);
      const { document, responseTime } = await this.fetchAndParse(formattedUrl);

      // Run all analyzers in parallel for better performance
      const [
        ariaResults,
        colorContrastResults,
        semanticsResults,
        keyboardResults
      ] = await Promise.all([
        analyzeAria(document),
        analyzeColorContrast(document),
        analyzeSemantics(document),
        analyzeKeyboardNavigation(document)
      ]);

      // Calculate overall score as weighted average
      const weights = {
        aria: 0.25,
        colorContrast: 0.25,
        semantics: 0.25,
        keyboard: 0.25
      };

      const overallScore = Math.round(
        (ariaResults.score * weights.aria +
        colorContrastResults.score * weights.colorContrast +
        semanticsResults.score * weights.semantics +
        keyboardResults.score * weights.keyboard)
      );

      return {
        url: formattedUrl,
        responseTime,
        overallScore,
        categories: {
          aria: {
            score: ariaResults.score,
            issues: ariaResults.issues,
          },
          colorContrast: {
            score: colorContrastResults.score,
            issues: colorContrastResults.issues,
          },
          semantics: {
            score: semanticsResults.score,
            issues: semanticsResults.issues,
          },
          keyboard: {
            score: keyboardResults.score,
            issues: keyboardResults.issues,
          },
        },
      };
    } catch (error) {
      console.error('Error in analyzeUrl:', error);
      throw error instanceof Error ? error : new Error('An unknown error occurred');
    }
  }

  private formatUrl(url: string): string {
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      const urlObject = new URL(url);
      return urlObject.toString();
    } catch (error) {
      throw new Error('Invalid URL format. Please enter a valid URL.');
    }
  }
}
