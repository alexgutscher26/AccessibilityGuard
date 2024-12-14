import { AnalysisSection, AnalysisIssue } from '@/lib/types/analysis';

export function analyzeAltText(document: Document): AnalysisSection {
  const issues: AnalysisIssue[] = [];
  const images = document.getElementsByTagName('img');
  
  Array.from(images).forEach((img) => {
    const alt = img.getAttribute('alt');
    const src = img.getAttribute('src') || '';
    
    if (!alt) {
      issues.push({
        type: 'error',
        message: 'Missing alt text',
        code: 'ALT_MISSING',
        element: `<img src="${src}">`,
        impact: 'critical',
        suggestion: 'Add descriptive alt text that conveys the image content or purpose'
      });
    } else if (alt.trim() === '') {
      issues.push({
        type: 'warning',
        message: 'Empty alt text',
        code: 'ALT_EMPTY',
        element: `<img src="${src}" alt="">`,
        impact: 'serious',
        suggestion: 'Either add meaningful alt text or remove the alt attribute if the image is decorative'
      });
    } else if (alt.toLowerCase().includes('image of') || alt.toLowerCase().includes('picture of')) {
      issues.push({
        type: 'info',
        message: 'Redundant alt text',
        code: 'ALT_REDUNDANT',
        element: `<img src="${src}" alt="${alt}">`,
        impact: 'minor',
        suggestion: 'Remove phrases like "image of" or "picture of" as they are redundant'
      });
    }
  });

  const totalImages = images.length;
  const issuesCount = issues.length;
  
  return {
    score: 0, // Will be calculated by AnalysisService
    issues,
    summary: `Found ${issuesCount} issue${issuesCount === 1 ? '' : 's'} in ${totalImages} image${totalImages === 1 ? '' : 's'}`,
    recommendations: [
      'Ensure all meaningful images have descriptive alt text',
      'Use empty alt="" for decorative images',
      'Avoid redundant phrases in alt text',
      'Make sure alt text conveys the image\'s purpose or content'
    ]
  };
}