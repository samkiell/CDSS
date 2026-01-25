import { NextResponse } from 'next/server';
import { getAiPreliminaryAnalysis } from '../../../../lib/ai-agent';

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.responses || !body.selectedRegion) {
      return NextResponse.json({ error: 'Missing assessment data' }, { status: 400 });
    }

    const aiResult = await getAiPreliminaryAnalysis(body);

    return NextResponse.json(aiResult);
  } catch (error) {
    console.error('AI Analysis Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
