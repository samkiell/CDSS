import { NextResponse } from 'next/server';
import { getWeightedAiAnalysis } from '@/lib/ai-agent';

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.responses || !body.selectedRegion) {
      return NextResponse.json({ error: 'Missing assessment data' }, { status: 400 });
    }

    // Map existing structure to new getWeightedAiAnalysis structure
    const aiResult = await getWeightedAiAnalysis({
      bodyRegion: body.selectedRegion,
      symptomData: body.responses,
    });

    return NextResponse.json(aiResult);
  } catch (error) {
    console.error('AI Analysis Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
