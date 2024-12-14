import { AccessibilityResult } from '../types/accessibility';

export async function analyzeWebsite(url: string): Promise<AccessibilityResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error('Analysis failed');
  }

  return response.json();
}