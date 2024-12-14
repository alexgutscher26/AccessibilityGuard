import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    try {
      new URL(url); // Validate URL format
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const response = await axios.get(url, {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (compatible; AccessibilityBot/1.0)',
      },
      timeout: 10000,
      maxRedirects: 5,
    });

    return NextResponse.json({
      html: response.data,
    });
  } catch (error) {
    console.error('URL fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch website',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
