"use client";

import { Card } from "@/components/ui/card";
import { DetailedAnalysisResult, AnalysisIssue } from "@/lib/types/analysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  AlertCircle,
} from "lucide-react";

interface AnalysisResultsProps {
  results: DetailedAnalysisResult;
}

const SECTION_NAMES = {
  altText: 'Alt Text',
  colorContrast: 'Color Contrast',
  semanticStructure: 'Semantic Structure',
  keyboardNavigation: 'Keyboard Navigation',
  readability: 'Readability'
} as const;

function getIssueIcon(type: AnalysisIssue['type']) {
  switch (type) {
    case 'error':
      return <XCircle className="h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-500 dark:text-yellow-400" />;
    case 'info':
      return <Info className="h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-400" />;
    default:
      return <AlertCircle className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />;
  }
}

function getIssueColor(type: AnalysisIssue['type']) {
  switch (type) {
    case 'error':
      return 'text-red-600 dark:text-red-400';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'info':
      return 'text-blue-600 dark:text-blue-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

function getScoreColor(score: number) {
  if (score >= 90) return 'text-green-600 dark:text-green-400';
  if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function AnalysisResults({ results }: AnalysisResultsProps) {
  return (
    <Card className="p-6 mt-8 bg-white dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analysis Results</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Score:</span>
          <span 
            className={`text-lg font-bold ${getScoreColor(results.overallScore)}`}
            role="status"
            aria-label={`Overall accessibility score: ${results.overallScore} out of 100`}
          >
            {results.overallScore}
          </span>
        </div>
      </div>

      <Tabs defaultValue="altText" className="w-full">
        <TabsList className="mb-4 flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-700" aria-label="Accessibility test categories">
          {(Object.keys(results.sections) as Array<keyof typeof SECTION_NAMES>).map((key) => (
            <TabsTrigger 
              key={key}
              value={key}
              aria-controls={`${key}-panel`}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
            >
              {SECTION_NAMES[key]} ({results.sections[key].issues.length})
            </TabsTrigger>
          ))}
        </TabsList>

        {(Object.keys(results.sections) as Array<keyof typeof SECTION_NAMES>).map((key) => {
          const section = results.sections[key];
          return (
            <TabsContent 
              key={key} 
              value={key}
              id={`${key}-panel`}
              role="tabpanel"
              aria-labelledby={key}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[70%]">{section.summary}</p>
                  <span 
                    className={`text-lg font-bold ${getScoreColor(section.score)}`}
                    role="status"
                    aria-label={`${SECTION_NAMES[key]} score: ${section.score} out of 100`}
                  >
                    Score: {section.score}
                  </span>
                </div>

                {section.issues.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400" role="status">
                    <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    <p>No issues found!</p>
                  </div>
                ) : (
                  <>
                    <ul className="space-y-3" role="list" aria-label={`${SECTION_NAMES[key]} issues`}>
                      {section.issues.map((issue, index) => (
                        <li 
                          key={index} 
                          className="rounded-lg border border-gray-200 dark:border-gray-600 p-3 bg-white dark:bg-gray-700"
                          role="listitem"
                        >
                          <div className="flex items-start gap-2">
                            <span className="flex-shrink-0" aria-hidden="true">
                              {getIssueIcon(issue.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p 
                                className={`font-medium ${getIssueColor(issue.type)} truncate`}
                                role="alert"
                                title={issue.message}
                              >
                                {issue.message}
                              </p>
                              {issue.element && (
                                <pre className="mt-1 text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-x-auto border border-gray-200 dark:border-gray-600">
                                  <code className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">{issue.element}</code>
                                </pre>
                              )}
                              {issue.suggestion && (
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 truncate" title={issue.suggestion}>
                                  Suggestion: {issue.suggestion}
                                </p>
                              )}
                            </div>
                            <span 
                              className="text-xs font-medium uppercase px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 flex-shrink-0"
                              role="status"
                            >
                              {issue.impact}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {section.recommendations && section.recommendations.length > 0 && (
                      <div className="mt-4 rounded-lg border border-blue-200 dark:border-blue-800 p-4 bg-blue-50 dark:bg-blue-900/50">
                        <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Recommendations</h3>
                        <ul className="list-disc pl-5 space-y-1" role="list">
                          {section.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-blue-700 dark:text-blue-300 truncate" title={rec}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400" role="contentinfo">
        <p>Last analyzed: {new Date(results.timestamp).toLocaleString()}</p>
        <p className="flex items-center gap-1">
          URL: <span className="truncate max-w-[300px]">
            <a href={results.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 dark:text-blue-400" title={results.url}>
              {results.url}
            </a>
          </span>
        </p>
        <p>Response time: {results.metadata.responseTime}ms</p>
      </div>
    </Card>
  );
}