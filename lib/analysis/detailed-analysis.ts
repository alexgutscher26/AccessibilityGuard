import { AxeResults } from 'axe-core';
import axios from 'axios';
import { z } from 'zod';
import { analyzeColorContrast } from '@/lib/analyzers/color-contrast';

export const AnalysisResultSchema = z.object({
  url: z.string().url(),
  timestamp: z.string().datetime(),
  accessibility: z.object({
    violations: z.array(z.object({
      id: z.string(),
      impact: z.enum(['critical', 'serious', 'moderate', 'minor']),
      description: z.string(),
      nodes: z.array(z.object({
        html: z.string(),
        target: z.array(z.string()),
        failureSummary: z.string().optional()
      }))
    })),
    passes: z.array(z.object({
      id: z.string(),
      description: z.string(),
      nodes: z.array(z.object({
        html: z.string(),
        target: z.array(z.string())
      }))
    })),
    colorContrast: z.object({
      score: z.number(),
      issues: z.array(z.object({
        type: z.enum(['error', 'warning']),
        message: z.string(),
        code: z.string(),
        element: z.string(),
        impact: z.enum(['critical', 'serious', 'moderate', 'minor']),
        suggestion: z.string()
      })),
      summary: z.string(),
      recommendations: z.array(z.string())
    })
  }),
  performance: z.object({
    loadTime: z.number(),
    resourceCount: z.number(),
    errorCount: z.number()
  }),
  seo: z.object({
    title: z.string(),
    description: z.string().optional(),
    headings: z.array(z.object({
      level: z.number(),
      text: z.string()
    }))
  })
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export class DetailedAnalyzer {
  private retryCount: number = 3;
  private retryDelay: number = 1000; // ms

  constructor(private cacheEnabled: boolean = true) {}

  private async fetchHtml(url: string): Promise<string> {
    const response = await axios.post('/api/analyze/fetch', { url }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (!response.data.html) {
      throw new Error('No HTML content received from server');
    }

    return response.data.html;
  }

  async analyze(url: string): Promise<AnalysisResult> {
    try {
      const result = await this.executeWithRetry(async () => {
        const startTime = performance.now();
        const html = await this.fetchHtml(url);
        const responseTime = performance.now() - startTime;

        // Create a virtual DOM environment
        const { JSDOM } = require('jsdom');
        const dom = new JSDOM(html, {
          runScripts: 'dangerously',
          resources: 'usable',
          url: url
        });
        const { window } = dom;

        // Run all analyses
        const [accessibilityResults, performanceMetrics, seoData, colorContrastResults] = await Promise.all([
          this.runAccessibilityTests(window.document),
          this.gatherPerformanceMetrics(window.document),
          this.analyzeSEO(window.document),
          analyzeColorContrast(window.document)
        ]);

        return {
          url,
          timestamp: new Date().toISOString(),
          accessibility: {
            ...this.formatAccessibilityResults(accessibilityResults),
            colorContrast: colorContrastResults
          },
          performance: {
            ...performanceMetrics,
            loadTime: Math.round(responseTime)
          },
          seo: seoData
        };
      });

      return result;
    } catch (error) {
      throw new Error(`Analysis failed for ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (attempt < this.retryCount) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }

    throw lastError;
  }

  private async runAccessibilityTests(document: Document): Promise<AxeResults> {
    // Initialize axe-core
    const axe = require('axe-core');
    return await new Promise((resolve, reject) => {
      axe.run(document, {
        rules: [
          { id: 'color-contrast', enabled: true }
        ]
      }, (err: Error, results: AxeResults) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  private async gatherPerformanceMetrics(document: Document) {
    // Count resources (scripts, stylesheets, images)
    const scripts = document.getElementsByTagName('script').length;
    const styles = document.getElementsByTagName('link').length;
    const images = document.getElementsByTagName('img').length;
    
    return {
      resourceCount: scripts + styles + images,
      errorCount: 0 // This would need to be implemented with actual error tracking
    };
  }

  private async analyzeSEO(document: Document) {
    // Get title
    const title = document.querySelector('title')?.textContent || '';
    
    // Get meta description
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    
    // Get headings
    const headings: { level: number; text: string }[] = [];
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((tag, index) => {
      document.querySelectorAll(tag).forEach((heading) => {
        headings.push({
          level: index + 1,
          text: heading.textContent?.trim() || ''
        });
      });
    });
    
    return {
      title,
      description: metaDescription || undefined,
      headings
    };
  }

  private formatAccessibilityResults(results: AxeResults) {
    return {
      violations: results.violations.map(violation => ({
        id: violation.id,
        impact: violation.impact as 'critical' | 'serious' | 'moderate' | 'minor',
        description: violation.help,
        nodes: violation.nodes.map(node => ({
          html: node.html,
          target: Array.isArray(node.target) ? node.target : [node.target.toString()],
          failureSummary: node.failureSummary
        }))
      })),
      passes: results.passes.map(pass => ({
        id: pass.id,
        description: pass.help,
        nodes: pass.nodes.map(node => ({
          html: node.html,
          target: Array.isArray(node.target) ? node.target : [node.target.toString()]
        }))
      }))
    };
  }

  async exportToCSV(results: AnalysisResult): Promise<string> {
    const rows = [
      ['URL', 'Timestamp', 'Category', 'Type', 'ID', 'Description'],
      // Violations
      ...results.accessibility.violations.map(v => [
        results.url,
        results.timestamp,
        'Accessibility',
        'Violation',
        v.id,
        v.description
      ]),
      // Passes
      ...results.accessibility.passes.map(p => [
        results.url,
        results.timestamp,
        'Accessibility',
        'Pass',
        p.id,
        p.description
      ]),
      // Performance
      [
        results.url,
        results.timestamp,
        'Performance',
        'Metric',
        'Load Time',
        `${results.performance.loadTime}ms`
      ],
      [
        results.url,
        results.timestamp,
        'Performance',
        'Metric',
        'Resource Count',
        results.performance.resourceCount.toString()
      ],
      // SEO
      [
        results.url,
        results.timestamp,
        'SEO',
        'Title',
        'Page Title',
        results.seo.title
      ]
    ];

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  async exportToPDF(results: AnalysisResult): Promise<Buffer> {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    const chunks: Uint8Array[] = [];

    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    
    // Add content to PDF
    doc.fontSize(20).text('Analysis Results', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`URL: ${results.url}`);
    doc.text(`Analyzed at: ${results.timestamp}`);
    
    // Accessibility
    doc.moveDown().fontSize(16).text('Accessibility');
    doc.fontSize(14).text('Violations');
    results.accessibility.violations.forEach(v => {
      doc.fontSize(12).text(`${v.id} (${v.impact})`);
      doc.fontSize(10).text(v.description);
      doc.moveDown(0.5);
    });
    
    // Performance
    doc.moveDown().fontSize(16).text('Performance');
    doc.fontSize(12).text(`Load Time: ${results.performance.loadTime}ms`);
    doc.text(`Resource Count: ${results.performance.resourceCount}`);
    
    // SEO
    doc.moveDown().fontSize(16).text('SEO');
    doc.fontSize(12).text(`Title: ${results.seo.title}`);
    if (results.seo.description) {
      doc.text(`Description: ${results.seo.description}`);
    }
    
    doc.end();
    
    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.from(Buffer.concat(chunks)));
      });
    });
  }
}
