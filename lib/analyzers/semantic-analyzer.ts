import { AccessibilityIssue } from "../services/analysis-service";

export async function analyzeSemantics(document: Document): Promise<{
  score: number;
  issues: AccessibilityIssue[];
}> {
  const issues: AccessibilityIssue[] = [];
  let score = 100;

  // Check for proper heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;

  headings.forEach((heading) => {
    const currentLevel = parseInt(heading.tagName[1]);
    
    if (previousLevel === 0 && currentLevel !== 1) {
      issues.push({
        type: 'semantics',
        message: 'Document should start with an h1 heading',
        code: 'heading-order',
        impact: 'moderate',
        selector: generateSelector(heading),
      });
      score -= 5;
    } else if (currentLevel - previousLevel > 1) {
      issues.push({
        type: 'semantics',
        message: `Heading level skipped from h${previousLevel} to h${currentLevel}`,
        code: 'heading-order',
        impact: 'moderate',
        selector: generateSelector(heading),
      });
      score -= 5;
    }
    previousLevel = currentLevel;
  });

  // Check for images without alt text
  const images = document.querySelectorAll('img');
  images.forEach((image) => {
    if (!image.hasAttribute('alt')) {
      issues.push({
        type: 'semantics',
        message: 'Image is missing alt text',
        code: 'img-alt',
        impact: 'critical',
        selector: generateSelector(image),
      });
      score -= 10;
    }
  });

  // Check for proper list structure
  const listItems = document.querySelectorAll('li');
  listItems.forEach((item) => {
    if (!item.parentElement || !['UL', 'OL'].includes(item.parentElement.tagName)) {
      issues.push({
        type: 'semantics',
        message: 'List item not contained within ul or ol',
        code: 'list-structure',
        impact: 'serious',
        selector: generateSelector(item),
      });
      score -= 8;
    }
  });

  // Check for proper form labels
  const formControls = document.querySelectorAll('input, select, textarea');
  formControls.forEach((control) => {
    if (!(control instanceof HTMLElement)) return;
    
    const hasLabel = control.id && document.querySelector(`label[for="${control.id}"]`);
    const hasAriaLabel = control.hasAttribute('aria-label');
    const hasAriaLabelledBy = control.hasAttribute('aria-labelledby');

    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push({
        type: 'semantics',
        message: 'Form control is missing a label',
        code: 'form-label',
        impact: 'critical',
        selector: generateSelector(control),
      });
      score -= 10;
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
