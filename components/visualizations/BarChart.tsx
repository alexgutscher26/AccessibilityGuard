'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { cn } from '@/lib/utils';
import { ChartProps } from './types';

Chart.register(...registerables);

export const BarChart = ({
  data,
  title,
  height = 400,
  width = 600,
  className,
}: ChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!title,
            text: title || '',
            font: {
              size: 16,
              weight: 'bold',
            },
          },
          legend: {
            position: 'top' as const,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, title]);

  return (
    <div className={cn('relative', className)}>
      <canvas
        ref={chartRef}
        height={height}
        width={width}
        className="w-full h-full"
      />
    </div>
  );
};
