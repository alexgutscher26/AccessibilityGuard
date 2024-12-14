import tinycolor from 'tinycolor2';
import { AnalysisSection, AnalysisIssue } from '@/lib/types/analysis';

function calculateContrastRatio(color1: string, color2: string): number {
  const c1 = tinycolor(color1);
  const c2 = tinycolor(color2);
  return tinycolor.readability(c1, c2);
}

function getStyleAttribute(element: Element, property: string): string {
  const style = element.getAttribute('style');
  if (!style) return '';

  const match = style.match(new RegExp(`${property}:\\s*([^;]+)`));
  return match ? match[1].trim() : '';
}

function getComputedColor(element: Element): { color: string; backgroundColor: string } {
  // Get inline styles
  let color = getStyleAttribute(element, 'color') || '#000000';
  let backgroundColor = getStyleAttribute(element, 'background-color') || '#FFFFFF';

  // Check for common class-based color schemes
  const className = element.className;
  if (className) {
    if (className.includes('text-white')) color = '#FFFFFF';
    if (className.includes('text-black')) color = '#000000';
    if (className.includes('bg-white')) backgroundColor = '#FFFFFF';
    if (className.includes('bg-black')) backgroundColor = '#000000';
  }

  return { color, backgroundColor };
}

export function analyzeColorContrast(document: Document): AnalysisSection {
  const issues: AnalysisIssue[] = [];
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a');
  let elementsChecked = 0;

  textElements.forEach((element) => {
    const { color, backgroundColor } = getComputedColor(element);
    const ratio = calculateContrastRatio(color, backgroundColor);
    elementsChecked++;
    
    // Check for font size in style attribute
    const style = element.getAttribute('style') || '';
    const fontSizeMatch = style.match(/font-size:\s*(\d+)px/);
    const fontSize = fontSizeMatch ? parseInt(fontSizeMatch[1]) : 16;
    const fontWeightMatch = style.match(/font-weight:\s*(\d+)/);
    const fontWeight = fontWeightMatch ? parseInt(fontWeightMatch[1]) : 400;
    
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
    const requiredRatio = isLargeText ? 3 : 4.5;
    
    if (ratio < requiredRatio) {
      issues.push({
        type: ratio < requiredRatio - 1 ? 'error' : 'warning',
        message: `Insufficient color contrast ratio: ${ratio.toFixed(2)}:1`,
        code: 'COLOR_CONTRAST_LOW',
        element: element.outerHTML,
        impact: ratio < 2 ? 'critical' : ratio < 3 ? 'serious' : 'moderate',
        suggestion: `Increase contrast ratio to at least ${requiredRatio}:1 for ${isLargeText ? 'large' : 'normal'} text`
      });
    }
  });

  return {
    score: 0, // Will be calculated by AnalysisService
    issues,
    summary: `Analyzed ${elementsChecked} text elements for color contrast`,
    recommendations: [
      'Ensure text has sufficient contrast with its background',
      'Aim for at least 4.5:1 contrast ratio for normal text',
      'Aim for at least 3:1 contrast ratio for large text',
      'Consider using darker text colors on light backgrounds',
      'Avoid light gray text on white backgrounds'
    ]
  };
}