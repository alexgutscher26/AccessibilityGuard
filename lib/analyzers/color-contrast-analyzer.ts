import { AccessibilityIssue } from "../services/analysis-service";

interface RGB {
  r: number;
  g: number;
  b: number;
}

export async function analyzeColorContrast(document: Document): Promise<{
  score: number;
  issues: AccessibilityIssue[];
}> {
  const issues: AccessibilityIssue[] = [];
  let score = 100;

  // Get all text elements
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label');

  textElements.forEach((element) => {
    const style = window.getComputedStyle(element);
    const textColor = style.color;
    const backgroundColor = getBackgroundColor(element);

    if (textColor && backgroundColor) {
      const contrast = calculateContrastRatio(
        parseColor(textColor),
        parseColor(backgroundColor)
      );

      const fontSize = parseFloat(style.fontSize);
      const isLargeText = fontSize >= 18 || (fontSize >= 14 && style.fontWeight === 'bold');
      const requiredRatio = isLargeText ? 3 : 4.5;

      if (contrast < requiredRatio) {
        issues.push({
          type: 'color-contrast',
          message: `Insufficient color contrast ratio: ${contrast.toFixed(2)}:1 (required: ${requiredRatio}:1)`,
          code: 'color-contrast-insufficient',
          impact: contrast < requiredRatio - 1 ? 'critical' : 'serious',
          selector: generateSelector(element),
        });
        score -= 10;
      }
    }
  });

  // Normalize score
  score = Math.max(0, Math.min(100, score));

  return { score, issues };
}

function getBackgroundColor(element: Element): string | null {
  if (!(element instanceof HTMLElement)) return null;

  const style = window.getComputedStyle(element);
  const backgroundColor = style.backgroundColor;

  if (backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)') {
    const parent = element.parentElement;
    return parent ? getBackgroundColor(parent) : '#FFFFFF';
  }

  return backgroundColor;
}

function parseColor(color: string): RGB {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
  };
}

function calculateContrastRatio(foreground: RGB, background: RGB): number {
  const l1 = calculateRelativeLuminance(foreground);
  const l2 = calculateRelativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function calculateRelativeLuminance(color: RGB): number {
  const { r, g, b } = color;
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function generateSelector(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classes = Array.from(element.classList).map(c => `.${c}`).join('');
  return `${tag}${id}${classes}`;
}
