import { NextResponse } from 'next/server';
import { AnalysisService } from '@/lib/services/analysis-service';

export async function POST(req: Request) {
  try {
    console.log('API: Starting analysis request');
    const { url } = await req.json();
    console.log('API: Received URL:', url);

    if (!url) {
      console.log('API: URL is missing');
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    try {
      new URL(url); // Validate URL format
    } catch {
      console.log('API: Invalid URL format');
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log('API: Creating analysis service');
    const analysisService = new AnalysisService();
    console.log('API: Starting URL analysis');
    const results = await analysisService.analyzeUrl(url);
    console.log('API: Analysis complete, results:', JSON.stringify(results, null, 2));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze website',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}