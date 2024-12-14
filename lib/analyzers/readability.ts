import { ReadabilityResult, AnalysisSection, AnalysisIssue } from '@/lib/types/accessibility';

function calculateReadabilityScore(text: string): number {
  // Simple readability calculation based on sentence and word length
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);
  
  if (sentences.length === 0 || words.length === 0) {
    return 100;
  }

  const avgWordsPerSentence = words.length / sentences.length;
  const longWords = words.filter(word => word.length > 6).length;
  const longWordsPercentage = (longWords / words.length) * 100;

  // Score calculation:
  // - Deduct points for long average sentence length (ideal is 15-20 words)
  // - Deduct points for high percentage of long words (ideal is less than 15%)
  let score = 100;

  if (avgWordsPerSentence > 20) {
    score -= Math.min(30, (avgWordsPerSentence - 20) * 2);
  }

  if (longWordsPercentage > 15) {
    score -= Math.min(30, (longWordsPercentage - 15) * 1.5);
  }

  return Math.max(0, Math.min(100, score));
}

export async function analyzeReadability(text: string): Promise<AnalysisSection> {
  const issues: AnalysisIssue[] = [];
  
  // Split text into sentences and words
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  
  // Calculate metrics
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  const longWords = words.filter(w => w.length > 6).length;
  const longWordPercentage = words.length > 0 ? (longWords / words.length) * 100 : 0;
  
  // Check sentence length
  if (avgWordsPerSentence > 25) {
    issues.push({
      type: 'warning',
      message: 'Sentences are too long on average',
      code: 'READABILITY_LONG_SENTENCES',
      impact: 'moderate',
      suggestion: 'Try to keep sentences shorter than 25 words for better readability'
    });
  }
  
  // Check complex words
  if (longWordPercentage > 25) {
    issues.push({
      type: 'warning',
      message: 'Too many complex words',
      code: 'READABILITY_COMPLEX_WORDS',
      impact: 'moderate',
      suggestion: 'Use simpler words where possible. Complex words can make text harder to understand'
    });
  }
  
  // Check text length
  if (words.length < 50 && sentences.length > 0) {
    issues.push({
      type: 'info',
      message: 'Content might be too brief',
      code: 'READABILITY_BRIEF_CONTENT',
      impact: 'minor',
      suggestion: 'Consider adding more content to provide better context and information'
    });
  }

  return {
    score: 0, // Will be calculated by AnalysisService
    issues,
    summary: `Analyzed ${sentences.length} sentences and ${words.length} words. Average words per sentence: ${avgWordsPerSentence.toFixed(1)}`,
    recommendations: [
      'Keep sentences under 25 words when possible',
      'Use simpler words to improve readability',
      'Break up long paragraphs into smaller chunks',
      'Use headings and lists to organize content'
    ]
  };
}