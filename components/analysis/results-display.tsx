'use client';

import { useState } from 'react';
import { AccessibilityIssue } from "@/lib/services/analysis-service";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  ChevronDown, 
  ChevronUp, 
  Filter,
  AlertTriangle,
  AlertCircle,
  Info,
  Globe,
  CheckCircle,
  XCircle
} from "lucide-react";

interface ResultsDisplayProps {
  url: string;
  score: number;
  issues: AccessibilityIssue[];
}

export function ResultsDisplay({ url, score, issues }: ResultsDisplayProps) {
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImpact, setSelectedImpact] = useState<string[]>([]);

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500';
      case 'serious':
        return 'bg-orange-500/10 text-orange-500 border-orange-500';
      case 'moderate':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'critical':
        return <AlertCircle className="w-4 h-4" />;
      case 'serious':
        return <AlertTriangle className="w-4 h-4" />;
      case 'moderate':
        return <Info className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const toggleExpand = (type: string) => {
    setExpandedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const toggleImpactFilter = (impact: string) => {
    setSelectedImpact(prev => 
      prev.includes(impact) 
        ? prev.filter(i => i !== impact)
        : [...prev, impact]
    );
  };

  const groupedIssues = issues.reduce((acc, issue) => {
    const type = issue.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(issue);
    return acc;
  }, {} as Record<string, AccessibilityIssue[]>);

  const filteredIssues = Object.entries(groupedIssues).reduce((acc, [type, typeIssues]) => {
    const filtered = typeIssues.filter(issue => {
      const matchesSearch = issue.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          issue.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesImpact = selectedImpact.length === 0 || selectedImpact.includes(issue.impact.toLowerCase());
      return matchesSearch && matchesImpact;
    });
    if (filtered.length > 0) {
      acc[type] = filtered;
    }
    return acc;
  }, {} as Record<string, AccessibilityIssue[]>);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border bg-card text-card-foreground p-6 shadow-sm"
      >
        <div className="mb-8 border-b pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground tracking-tight">Analysis Results</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium break-all">{url}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {score}
                  <span className="text-lg text-muted-foreground">%</span>
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                score >= 90 ? 'border-green-500 text-green-500' :
                score >= 70 ? 'border-yellow-500 text-yellow-500' :
                'border-red-500 text-red-500'
              }`}>
                {score >= 90 ? <CheckCircle className="w-8 h-8" /> :
                 score >= 70 ? <AlertTriangle className="w-8 h-8" /> :
                 <XCircle className="w-8 h-8" />}
              </div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">Critical Issues</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {issues.filter(i => i.impact.toLowerCase() === 'critical').length}
              </p>
            </div>
            <div className="p-4 bg-muted/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Serious Issues</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {issues.filter(i => i.impact.toLowerCase() === 'serious').length}
              </p>
            </div>
            <div className="p-4 bg-muted/50">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Moderate Issues</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {issues.filter(i => i.impact.toLowerCase() === 'moderate').length}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Overall Score</span>
              <span className="text-sm font-medium text-foreground">{score}%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full transition-all ${
                  score >= 90 ? 'bg-green-500' :
                  score >= 70 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
              />
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['critical', 'serious', 'moderate'].map((impact) => (
                <Button
                  key={impact}
                  variant={selectedImpact.includes(impact) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleImpactFilter(impact)}
                  className="capitalize"
                >
                  {impact}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {Object.entries(filteredIssues).map(([type, typeIssues]) => (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <Button
                    variant="ghost"
                    className="w-full flex justify-between items-center py-2"
                    onClick={() => toggleExpand(type)}
                  >
                    <span className="text-lg font-semibold capitalize">{type}</span>
                    {expandedTypes[type] ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                  
                  <AnimatePresence>
                    {expandedTypes[type] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        {typeIssues.map((issue, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-muted/50 p-4 rounded-lg hover:bg-muted/70 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className={`${getImpactColor(issue.impact)} flex items-center gap-1`}>
                                    {getImpactIcon(issue.impact)}
                                    {issue.impact}
                                  </Badge>
                                  <code className="text-sm bg-muted px-2 py-1 rounded">
                                    {issue.code}
                                  </code>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {issue.message}
                                </p>
                                {issue.selector && (
                                  <code className="text-xs bg-muted p-2 rounded block mt-2 text-foreground overflow-x-auto">
                                    {issue.selector}
                                  </code>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
