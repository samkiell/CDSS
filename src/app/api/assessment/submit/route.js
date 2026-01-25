import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import DiagnosisSession from '@/models/DiagnosisSession';
import { getWeightedAiAnalysis } from '@/lib/ai-agent';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // 1. Validation: Verify the user session
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bodyRegion, symptomData, mediaUrls } = await req.json();

    if (!bodyRegion || !symptomData) {
      return NextResponse.json(
        { error: 'Missing required fields: bodyRegion or symptomData' },
        { status: 400 }
      );
    }

    await connectDB();

    // 2. AI Processing: Send the symptomData to the Mistral AI Agent
    // The getWeightedAiAnalysis already uses the "Weighted Matching Paradigm" system instruction
    let aiOutput;
    try {
      const aiResponse = await getWeightedAiAnalysis({ bodyRegion, symptomData });
      aiOutput = aiResponse.analysis;
    } catch (aiError) {
      console.error('AI Processing Error:', aiError);
      // Fallback or handle error - here we'll error out as AI is critical for this flow
      return NextResponse.json(
        { error: 'AI Diagnostic Engine failed. Please try again.' },
        { status: 500 }
      );
    }

    // 3. Persistence: Create a new DiagnosisSession document
    const newSession = await DiagnosisSession.create({
      patientId: session.user.id,
      bodyRegion,
      symptomData,
      mediaUrls: mediaUrls || [],
      aiAnalysis: {
        temporalDiagnosis: aiOutput.temporalDiagnosis,
        confidenceScore: aiOutput.confidenceScore,
        riskLevel: aiOutput.riskLevel,
        reasoning: aiOutput.reasoning,
        isProvisional: true, // Labeled as provisional
        label: 'Provisional AI Analysis',
      },
      status: 'pending_review', // 4. Case Status: Mark as pending_review
    });

    return NextResponse.json(
      {
        success: true,
        sessionId: newSession._id,
        analysis: newSession.aiAnalysis,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Assessment Submission Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
