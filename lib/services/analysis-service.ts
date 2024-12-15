import { AxeResults } from 'axe-core';
import axios from 'axios';
import { analyzeColorContrast } from '@/lib/analyzers/color-contrast';
import { AnalysisIssue } from '@/lib/types/analysis';

export interface AccessibilityIssue {
  type: string;
  message: string;
  code?: string;
  element?: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  suggestion?: string;
  target?: string[];
}

export interface AnalysisCategory {
  score: number;
  issues: AccessibilityIssue[];
}

export interface AnalysisResult {
  url: string;
  responseTime: number;
  overallScore: number;
  categories: {
    aria: AnalysisCategory;
    contrast: AnalysisCategory;
    semantics: AnalysisCategory;
    keyboard: AnalysisCategory;
  };
}

export class AnalysisService {
  private async fetchAndAnalyze(url: string): Promise<{ html: string; axeResults: AxeResults; responseTime: number }> {
    const startTime = performance.now();
    
    try {
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
      
      return { 
        html: response.data.html,
        axeResults: response.data.axeResults,
        responseTime 
      };
    } catch (error) {
      console.error('Error fetching URL:', error);
      throw error;
    }
  }

  private formatUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  }

  private calculateCategoryScore(issues: AccessibilityIssue[]): number {
    if (issues.length === 0) return 100;

    // Calculate weighted score based on impact
    const weights = {
      critical: 25,
      serious: 15,
      moderate: 10,
      minor: 5
    };

    const totalDeductions = issues.reduce((sum, issue) => {
      return sum + weights[issue.impact];
    }, 0);

    // Cap the maximum deduction at 100 points
    return Math.max(0, 100 - totalDeductions);
  }

  async analyzeUrl(url: string): Promise<AnalysisResult> {
    try {
      const formattedUrl = this.formatUrl(url);
      const { html, axeResults, responseTime } = await this.fetchAndAnalyze(formattedUrl);

      // Create a temporary DOM for color contrast analysis
      const parser = new DOMParser();
      const document = parser.parseFromString(html, 'text/html');
      const colorContrastResults = analyzeColorContrast(document);

      // Process axe results by category with more specific categorization
      const ariaIssues = axeResults.violations
        .filter(v => v.id.startsWith('aria') || 
          ['button-name', 'input-button-name', 'label', 'role-presentation'].includes(v.id))
        .map(v => ({
          type: v.id,
          message: v.description,
          impact: v.impact as 'critical' | 'serious' | 'moderate' | 'minor',
          element: v.nodes[0]?.html,
          suggestion: v.nodes[0]?.failureSummary,
          target: v.nodes[0]?.target.map(t => t.toString())
        }));

      const semanticsIssues = axeResults.violations
        .filter(v => [
          'document-title',
          'html-has-lang',
          'list',
          'listitem',
          'meta-viewport',
          'landmark-one-main',
          'region',
          'page-has-heading-one',
          'landmark-complementary-is-top-level'
        ].includes(v.id))
        .map(v => ({
          type: v.id,
          message: v.description,
          impact: v.impact as 'critical' | 'serious' | 'moderate' | 'minor',
          element: v.nodes[0]?.html,
          suggestion: v.nodes[0]?.failureSummary,
          target: v.nodes[0]?.target.map(t => t.toString())
        }));

      const keyboardIssues = axeResults.violations
        .filter(v => [
          'button-name',
          'link-name',
          'input-button-name',
          'tabindex',
          'focus-order-semantics',
          'keyboard-nav-focusable',
          'interactive-element-keyboard',
          'focusable-element'
        ].includes(v.id))
        .map(v => ({
          type: v.id,
          message: v.description,
          impact: v.impact as 'critical' | 'serious' | 'moderate' | 'minor',
          element: v.nodes[0]?.html,
          suggestion: v.nodes[0]?.failureSummary,
          target: v.nodes[0]?.target.map(t => t.toString())
        }));

      // Convert color contrast issues to the correct format
      const contrastIssues: AccessibilityIssue[] = colorContrastResults.issues.map(issue => ({
        type: 'color-contrast',
        message: issue.message,
        code: issue.code,
        element: issue.element,
        impact: issue.type === 'error' ? 'serious' : 
               issue.type === 'warning' ? 'moderate' : 'minor',
        suggestion: issue.suggestion
      }));

      const categories = {
        aria: {
          score: this.calculateCategoryScore(ariaIssues),
          issues: ariaIssues
        },
        contrast: {
          score: this.calculateCategoryScore(contrastIssues),
          issues: contrastIssues
        },
        semantics: {
          score: this.calculateCategoryScore(semanticsIssues),
          issues: semanticsIssues
        },
        keyboard: {
          score: this.calculateCategoryScore(keyboardIssues),
          issues: keyboardIssues
        }
      };

      // Calculate weighted overall score
      const weights = {
        aria: 0.3,      // 30% weight for ARIA
        contrast: 0.2,  // 20% weight for contrast
        semantics: 0.3, // 30% weight for semantics
        keyboard: 0.2   // 20% weight for keyboard
      };

      const overallScore = Math.round(
        Object.entries(categories).reduce((sum, [category, data]) => {
          return sum + (data.score * weights[category as keyof typeof weights]);
        }, 0)
      );

      return {
        url: formattedUrl,
        responseTime,
        overallScore,
        categories
      };
    } catch (error) {
      console.error('Error in analyzeUrl:', error);
      throw error;
    }
  }
}
