import { NextRequest, NextResponse } from 'next/server';
import { recommendArtists } from '@/ai/flows/recommend-artists-flow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, festivalId } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const result = await recommendArtists({ 
      prompt: prompt.trim(),
      festivalId: festivalId
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('AI recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
