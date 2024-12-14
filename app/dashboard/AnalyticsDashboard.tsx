'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { BarChart, LineChart } from '@/components/visualizations';
import { ChartData } from '@/components/visualizations/types';
import { Loader2 } from 'lucide-react';

const processAnalysisData = (analyses: any[]) => {
  // Group analyses by day
  const dailyData = analyses.reduce((acc: { [key: string]: any }, analysis) => {
    const date = new Date(analysis.timestamp).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = {
        count: 0,
        totalScore: 0,
        issues: [],
      };
    }
    acc[date].count += 1;
    acc[date].totalScore += analysis.score;
    acc[date].issues = [...acc[date].issues, ...analysis.issues];
    return acc;
  }, {});

  // Prepare data for charts
  const dates = Object.keys(dailyData).slice(-7); // Last 7 days

  const scoreData: ChartData = {
    labels: dates,
    datasets: [{
      label: 'Average Daily Score',
      data: dates.map(date => 
        dailyData[date].totalScore / dailyData[date].count || 0
      ),
      borderColor: '#60A5FA',
      backgroundColor: ['rgba(96, 165, 250, 0.1)'],
      tension: 0.3,
    }],
  };

  const issueTypeData: ChartData = {
    labels: ['Critical', 'Serious', 'Moderate', 'Minor'],
    datasets: [{
      label: 'Issues by Impact',
      data: ['critical', 'serious', 'moderate', 'minor'].map(impact =>
        dates.reduce((sum, date) => 
          sum + dailyData[date].issues.filter((i: any) => 
            i.impact.toLowerCase() === impact
          ).length
        , 0)
      ),
      backgroundColor: [
        'rgba(248, 113, 113, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(250, 204, 21, 0.8)',
        'rgba(74, 222, 128, 0.8)',
      ],
      borderWidth: 0,
    }],
  };

  return { scoreData, issueTypeData };
};

export default function AnalyticsDashboard({ userId }: { userId: string }) {
  const analyses = useQuery(api.analysis.getUserAnalyses, { userId });

  if (!analyses) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { scoreData, issueTypeData } = processAnalysisData(analyses);

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-gray-900 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Average Daily Scores</h2>
          <div className="h-[300px]">
            <LineChart 
              data={scoreData}
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Issues by Impact Level</h2>
          <div className="h-[300px]">
            <BarChart 
              data={issueTypeData}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-100">Analysis Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-500/10 rounded-lg">
            <p className="text-sm text-blue-400 font-medium">Total Analyses</p>
            <p className="text-2xl font-bold text-blue-300 mt-1">
              {analyses.length}
            </p>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg">
            <p className="text-sm text-green-400 font-medium">Average Score</p>
            <p className="text-2xl font-bold text-green-300 mt-1">
              {(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length).toFixed(1)}
            </p>
          </div>
          <div className="p-4 bg-yellow-500/10 rounded-lg">
            <p className="text-sm text-yellow-400 font-medium">Total Issues</p>
            <p className="text-2xl font-bold text-yellow-300 mt-1">
              {analyses.reduce((sum, a) => sum + a.issues.length, 0)}
            </p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-lg">
            <p className="text-sm text-purple-400 font-medium">Critical Issues</p>
            <p className="text-2xl font-bold text-purple-300 mt-1">
              {analyses.reduce((sum, a) => sum + a.issues.filter((i: any) => i.impact.toLowerCase() === 'critical').length, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
