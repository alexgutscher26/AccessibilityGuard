import { AnalysisSection, AnalysisIssue } from '@/lib/types/analysis';

export function analyzeSemanticStructure(document: Document): AnalysisSection {
  const issues: AnalysisIssue[] = [];

  // Check heading hierarchy
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  let previousLevel = 0;
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName[1]);
    if (previousLevel > 0 && level - previousLevel > 1) {
      issues.push({
        type: 'error',
        message: `Skipped heading level: from h${previousLevel} to h${level}`,
        code: 'SEMANTIC_HEADING_SKIP',
        element: heading.outerHTML,
        impact: 'serious',
        suggestion: `Use h${previousLevel + 1} instead of h${level} to maintain hierarchy`
      });
    }
    previousLevel = level;
  });

  // Check for main landmark
  if (!document.querySelector('main')) {
    issues.push({
      type: 'error',
      message: 'No main landmark found',
      code: 'SEMANTIC_NO_MAIN',
      impact: 'serious',
      suggestion: 'Add a <main> element to identify the main content area'
    });
  }

  // Check for header and footer
  if (!document.querySelector('header')) {
    issues.push({
      type: 'warning',
      message: 'No header element found',
      code: 'SEMANTIC_NO_HEADER',
      impact: 'moderate',
      suggestion: 'Add a <header> element to identify the introductory content'
    });
  }

  if (!document.querySelector('footer')) {
    issues.push({
      type: 'warning',
      message: 'No footer element found',
      code: 'SEMANTIC_NO_FOOTER',
      impact: 'moderate',
      suggestion: 'Add a <footer> element to identify the footer content'
    });
  }

  // Check for nav
  if (!document.querySelector('nav')) {
    issues.push({
      type: 'info',
      message: 'No navigation element found',
      code: 'SEMANTIC_NO_NAV',
      impact: 'moderate',
      suggestion: 'Consider adding a <nav> element for navigation sections'
    });
  }

  // Check for list usage in navigation
  const navs = document.querySelectorAll('nav');
  navs.forEach(nav => {
    if (!nav.querySelector('ul, ol')) {
      issues.push({
        type: 'warning',
        message: 'Navigation not using list elements',
        code: 'SEMANTIC_NAV_NO_LIST',
        element: nav.outerHTML,
        impact: 'moderate',
        suggestion: 'Use <ul> or <ol> elements for navigation links'
      });
    }
  });

  return {
    score: 0, // Will be calculated by AnalysisService
    issues,
    summary: `Found ${issues.length} semantic structure ${issues.length === 1 ? 'issue' : 'issues'}`,
    recommendations: [
      'Maintain proper heading hierarchy (h1 → h2 → h3)',
      'Use semantic landmarks (main, header, footer, nav)',
      'Structure navigation using lists',
      'Use appropriate HTML elements for content structure'
    ]
  };
}