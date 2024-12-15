import tinycolor from 'tinycolor2';

const TAILWIND_COLORS: Record<string, string> = {
  'primary': '#0070f3',
  'secondary': '#666666',
  'background': '#ffffff',
  'foreground': '#000000',
  'muted': '#f5f5f5',
  'muted-foreground': '#737373',
  'accent': '#f5f5f5',
  'accent-foreground': '#0070f3',
  'destructive': '#ff0000',
  'destructive-foreground': '#ffffff',
  'border': '#e5e5e5',
  'input': '#e5e5e5',
  'ring': '#0070f3',
} as const;

type TailwindColorKey = keyof typeof TAILWIND_COLORS;

function calculateContrastRatio(color1: string, color2: string): number {
  try {
    const c1 = tinycolor(color1);
    const c2 = tinycolor(color2);
    if (!c1.isValid() || !c2.isValid()) {
      console.warn('Invalid color values:', { color1, color2 });
      return 21; // Maximum contrast ratio as fallback
    }
    return tinycolor.readability(c1, c2);
  } catch (error) {
    console.error('Error calculating contrast ratio:', error);
    return 21; // Maximum contrast ratio as fallback
  }
}

function getTailwindColor(className: string): string | null {
  // Handle Tailwind color classes
  const colorMatch = className.match(/(?:text|bg|border|ring)-([a-z]+)(?:-([0-9]+))?/);
  if (!colorMatch) return null;

  const baseColor = colorMatch[1];
  const shade = colorMatch[2] || '500';

  // Check if it's a theme color
  if (baseColor in TAILWIND_COLORS) {
    return TAILWIND_COLORS[baseColor];
  }

  // Handle numeric shades (100-900)
  const shadeMap: Record<string, string> = {
    '50': '#fafafa',
    '100': '#f5f5f5',
    '200': '#e5e5e5',
    '300': '#d4d4d4',
    '400': '#a3a3a3',
    '500': '#737373',
    '600': '#525252',
    '700': '#404040',
    '800': '#262626',
    '900': '#171717',
  };

  return shadeMap[shade] || null;
}

function getComputedColor(element: Element): { color: string; backgroundColor: string } {
  let color = '#000000';
  let backgroundColor = '#ffffff';

  // Check for CSS variables
  const style = window.getComputedStyle(element as HTMLElement);
  const rawColor = style.getPropertyValue('color');
  const rawBgColor = style.getPropertyValue('background-color');

  if (rawColor && rawColor !== 'inherit') {
    color = rawColor;
  }
  if (rawBgColor && rawBgColor !== 'inherit' && rawBgColor !== 'transparent') {
    backgroundColor = rawBgColor;
  }

  // Check for Tailwind classes
  const classNames = element.className.split(' ');
  for (const className of classNames) {
    if (className.startsWith('text-')) {
      const tailwindColor = getTailwindColor(className);
      if (tailwindColor) color = tailwindColor;
    }
    if (className.startsWith('bg-')) {
      const tailwindColor = getTailwindColor(className);
      if (tailwindColor) backgroundColor = tailwindColor;
    }
  }

  // If background is transparent, traverse up the DOM tree
  if (backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)') {
    let parent = element.parentElement;
    while (parent) {
      const parentStyle = window.getComputedStyle(parent as HTMLElement);
      const parentBg = parentStyle.getPropertyValue('background-color');
      if (parentBg && parentBg !== 'transparent' && parentBg !== 'rgba(0, 0, 0, 0)') {
        backgroundColor = parentBg;
        break;
      }
      parent = parent.parentElement;
    }
  }

  return { color, backgroundColor };
}

export interface AnalysisIssue {
  type: 'error' | 'warning';
  message: string;
  code: string;
  element: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  suggestion: string;
}

export interface AnalysisSection {
  score: number;
  issues: AnalysisIssue[];
  summary: string;
  recommendations: string[];
}

export function analyzeColorContrast(document: Document): AnalysisSection {
  const issues: AnalysisIssue[] = [];
  let score = 100;

  // Get all text elements
  const textElements = document.querySelectorAll('*');
  textElements.forEach(element => {
    const { color, backgroundColor } = getComputedColor(element);
    const ratio = calculateContrastRatio(color, backgroundColor);

    if (ratio < 4.5) {
      const impact = ratio < 3 ? 'critical' : ratio < 4 ? 'serious' : 'moderate';
      issues.push({
        type: ratio < 3 ? 'error' : 'warning',
        message: `Insufficient color contrast ratio (${ratio.toFixed(2)}:1)`,
        code: 'color-contrast',
        element: element.tagName.toLowerCase(),
        impact,
        suggestion: `Consider using a darker color for text or a lighter background color to achieve a minimum contrast ratio of 4.5:1`
      });
      score -= (4.5 - ratio) * 10;
    }
  });

  return {
    score: Math.max(0, Math.round(score)),
    issues,
    summary: `Found ${issues.length} color contrast ${issues.length === 1 ? 'issue' : 'issues'}`,
    recommendations: issues.length > 0 
      ? ['Ensure all text has sufficient contrast with its background to maintain readability']
      : []
  };
}