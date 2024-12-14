'use client';

import { BarChart, LineChart } from '@/components/visualizations';
import { ChartData } from '@/components/visualizations/types';

const barChartData: ChartData = {
  labels: ['January', 'February', 'March', 'April', 'May'],
  datasets: [{
    label: 'Monthly Revenue',
    data: [12000, 19000, 15000, 22000, 25000],
    backgroundColor: [
      'rgba(54, 162, 235, 0.5)',
      'rgba(255, 99, 132, 0.5)',
      'rgba(255, 206, 86, 0.5)',
      'rgba(75, 192, 192, 0.5)',
      'rgba(153, 102, 255, 0.5)',
    ],
    borderColor: [
      'rgba(54, 162, 235, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
    ],
    borderWidth: 1,
  }],
};

const lineChartData: ChartData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [{
    label: 'Active Users',
    data: [1200, 1900, 2300, 2800],
    borderColor: 'rgba(75, 192, 192, 1)',
    backgroundColor: ['rgba(75, 192, 192, 0.2)'],
  }],
};

export default function VisualizationsDemo() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Data Visualizations</h1>
      
      <div className="space-y-12">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
          <div className="h-[400px]">
            <BarChart 
              data={barChartData}
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">User Growth Trend</h2>
          <div className="h-[400px]">
            <LineChart 
              data={lineChartData}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
