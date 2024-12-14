export interface AccessibilityResult {
  altText: AltTextIssue[];
  colorContrast: ColorContrastResult[];
  semanticStructure: SemanticStructureIssue[];
  keyboardNavigation: KeyboardNavigationResult[];
  readability: ReadabilityResult;
}

export interface AltTextIssue {
  src: string;
  message: string;
}

export interface ColorContrastResult {
  element: string;
  ratio: number;
  passes: boolean;
}

export interface SemanticStructureIssue {
  element: string;
  message: string;
}

export interface KeyboardNavigationResult {
  element: string;
  issue: string;
  selector: string;
}

export interface ReadabilityResult {
  score: number;
  messages: ReadabilityMessage[];
}

export interface ReadabilityMessage {
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface AnalysisError {
  error: string;
  details?: string;
}

export type AnalysisResponse = AccessibilityResult | AnalysisError;