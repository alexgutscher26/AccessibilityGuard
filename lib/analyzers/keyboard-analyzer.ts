import { AccessibilityIssue } from "../services/analysis-service";

export async function analyzeKeyboardNavigation(document: Document): Promise<{
  score: number;
  issues: AccessibilityIssue[];
}> {
  const issues: AccessibilityIssue[] = [];
  let score = 100;

  // Check for proper focus indicators
  const focusableElements = document.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  focusableElements.forEach((element) => {
    if (!(element instanceof HTMLElement)) return;
    
    const style = window.getComputedStyle(element);
    const hasOutline = style.outlineStyle !== 'none' && style.outlineWidth !== '0px';
    const hasCustomFocus = element.matches(':focus-visible');

    if (!hasOutline && !hasCustomFocus) {
      issues.push({
        type: 'keyboard',
        message: 'Interactive element is missing a visible focus indicator',
        code: 'focus-visible',
        impact: 'serious',
        selector: generateSelector(element),
      });
      score -= 8;
    }
  });

  // Check for proper tab order
  const elementsWithTabIndex = document.querySelectorAll('[tabindex]');
  elementsWithTabIndex.forEach((element) => {
    const tabIndex = parseInt(element.getAttribute('tabindex') || '0');
    if (tabIndex > 0) {
      issues.push({
        type: 'keyboard',
        message: 'Avoid positive tabindex values as they disrupt natural tab order',
        code: 'tabindex-positive',
        impact: 'moderate',
        selector: generateSelector(element),
      });
      score -= 5;
    }
  });

  // Check for keyboard traps
  const modalDialogs = document.querySelectorAll('[role="dialog"], dialog');
  modalDialogs.forEach((dialog) => {
    const hasFocusTrap = dialog.querySelector('[aria-modal="true"]');
    if (!hasFocusTrap) {
      issues.push({
        type: 'keyboard',
        message: 'Modal dialog should trap keyboard focus',
        code: 'focus-trap',
        impact: 'serious',
        selector: generateSelector(dialog),
      });
      score -= 8;
    }
  });

  // Check for click handlers without keyboard support
  const clickableElements = document.querySelectorAll('[onclick]');
  clickableElements.forEach((element) => {
    if (!(element instanceof HTMLElement)) return;
    
    const hasKeyboardHandler = 
      element.hasAttribute('onkeydown') || 
      element.hasAttribute('onkeyup') || 
      element.hasAttribute('onkeypress');

    if (!hasKeyboardHandler && !['a', 'button'].includes(element.tagName.toLowerCase())) {
      issues.push({
        type: 'keyboard',
        message: 'Element has click handler but no keyboard handler',
        code: 'keyboard-event',
        impact: 'serious',
        selector: generateSelector(element),
      });
      score -= 8;
    }
  });

  // Normalize score
  score = Math.max(0, Math.min(100, score));

  return { score, issues };
}

function generateSelector(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classes = Array.from(element.classList).map(c => `.${c}`).join('');
  return `${tag}${id}${classes}`;
}
