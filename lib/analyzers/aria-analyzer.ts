import { AccessibilityIssue } from "../services/analysis-service";

export async function analyzeAria(document: Document): Promise<{
  score: number;
  issues: AccessibilityIssue[];
}> {
  const issues: AccessibilityIssue[] = [];
  let score = 100;

  // Check for missing ARIA labels
  const elementsNeedingLabels = document.querySelectorAll(
    'button:not([aria-label]):not([aria-labelledby]), ' +
    '[role]:not([aria-label]):not([aria-labelledby])'
  );

  elementsNeedingLabels.forEach((element) => {
    issues.push({
      type: 'aria',
      message: 'Element is missing an ARIA label',
      code: 'aria-label-missing',
      impact: 'serious',
      selector: generateSelector(element),
    });
    score -= 10;
  });

  // Check for invalid ARIA roles
  const elementsWithRoles = document.querySelectorAll('[role]');
  const validRoles = [
    'alert', 'alertdialog', 'button', 'checkbox', 'dialog', 'grid',
    'heading', 'link', 'listbox', 'menu', 'menuitem', 'navigation',
    'progressbar', 'radio', 'search', 'slider', 'tab', 'tabpanel',
  ];

  elementsWithRoles.forEach((element) => {
    const role = element.getAttribute('role');
    if (role && !validRoles.includes(role)) {
      issues.push({
        type: 'aria',
        message: `Invalid ARIA role: ${role}`,
        code: 'aria-role-invalid',
        impact: 'critical',
        selector: generateSelector(element),
      });
      score -= 15;
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
