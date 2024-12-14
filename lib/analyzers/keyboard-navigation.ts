import { AnalysisSection, AnalysisIssue } from '@/lib/types/analysis';
import { getElementSelector, isVisibleElement } from '@/lib/utils/dom';

export function analyzeKeyboardNavigation(document: Document): AnalysisSection {
  const issues: AnalysisIssue[] = [];
  
  // Check for focusable elements
  const focusableElements = document.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  let elementsChecked = 0;
  
  focusableElements.forEach((element) => {
    elementsChecked++;
    const tabIndex = element.getAttribute('tabindex');
    
    // Check for positive tabindex
    if (tabIndex && parseInt(tabIndex) > 0) {
      issues.push({
        type: 'error',
        message: 'Positive tabindex found',
        code: 'KEYBOARD_POSITIVE_TABINDEX',
        element: element.outerHTML,
        impact: 'serious',
        suggestion: 'Remove positive tabindex values to maintain natural tab order'
      });
    }
    
    // Check for focus styles
    const style = element.getAttribute('style') || '';
    const hasOutlineNone = style.includes('outline: none') || style.includes('outline:none');
    const hasTabIndex = element.hasAttribute('tabindex');
    
    if (hasOutlineNone && hasTabIndex) {
      issues.push({
        type: 'warning',
        message: 'Focus indicator removed',
        code: 'KEYBOARD_NO_FOCUS_INDICATOR',
        element: element.outerHTML,
        impact: 'serious',
        suggestion: 'Ensure visible focus indicators are present for keyboard navigation'
      });
    }
  });
  
  // Check for keyboard traps
  const modalElements = document.querySelectorAll('[role="dialog"], [role="alertdialog"], dialog');
  modalElements.forEach((modal) => {
    elementsChecked++;
    if (!modal.querySelector('[aria-label="Close"]') && !modal.querySelector('button')) {
      issues.push({
        type: 'error',
        message: 'Modal without close button',
        code: 'KEYBOARD_MODAL_TRAP',
        element: modal.outerHTML,
        impact: 'critical',
        suggestion: 'Add a close button to allow keyboard users to exit the modal'
      });
    }
  });
  
  // Check for skip links
  const hasSkipLink = Array.from(document.querySelectorAll('a')).some(
    link => link.textContent?.toLowerCase().includes('skip to') || 
           link.textContent?.toLowerCase().includes('skip navigation')
  );
  
  if (!hasSkipLink && document.querySelector('nav')) {
    issues.push({
      type: 'warning',
      message: 'No skip link found',
      code: 'KEYBOARD_NO_SKIP_LINK',
      impact: 'moderate',
      suggestion: 'Add a skip link to bypass repetitive navigation'
    });
  }

  // Check for elements that are visible but not keyboard accessible
  const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
  interactiveElements.forEach((element) => {
    const tabIndex = element.getAttribute('tabindex');
    const isVisible = isVisibleElement(element);

    if (tabIndex === '-1' && isVisible) {
      issues.push({
        type: 'error',
        message: 'Element is visible but not keyboard accessible',
        code: 'KEYBOARD_INACCESSIBLE_ELEMENT',
        element: getElementSelector(element),
        impact: 'serious',
        suggestion: 'Make the element keyboard accessible by setting tabindex to 0 or removing it'
      });
    }
  });

  return {
    score: 0, // Will be calculated by AnalysisService
    issues,
    summary: `Analyzed ${elementsChecked} elements for keyboard accessibility`,
    recommendations: [
      'Ensure all interactive elements are keyboard accessible',
      'Maintain visible focus indicators',
      'Avoid positive tabindex values',
      'Provide skip links for navigation',
      'Ensure modals can be closed with keyboard'
    ]
  };
}