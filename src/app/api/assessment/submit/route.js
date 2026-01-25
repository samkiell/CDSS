import { auth } from '@/../auth';
import connectDB from '@/lib/db/connect';
import DiagnosisSession from '@/models/DiagnosisSession';
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bodyRegion, symptomData, mediaUrls } = await req.json();

    if (!bodyRegion || !symptomData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // 1. Prepare symptoms for Mistral AI
    const symptomText = symptomData
      .map((s) => `Question: ${s.question}\nAnswer: ${s.answer}`)
      .join('\n\n');

    const prompt = `
      You are a diagnostic engine using the Weighted Matching Paradigm. 
      Compare the following symptoms for the ${bodyRegion} region against clinical heuristics.
      
      Symptoms:
      ${symptomText}
      
      Output JSON only:
      {
        "temporalDiagnosis": "String (e.g., Lumbar Disc Herniation)",
        "confidenceScore": "Number (0-100)",
        "riskLevel": "String (Low, Moderate, Urgent)",
        "reasoning": ["String (Key indicator 1)", "String (Key indicator 2)"]
      }
    `;

    // 2. Call Mistral AI Agent
    // Using the Mistral AI API as a placeholder/standard REST call since no SDK is configured
    // Note: Adjust the endpoint/payload based on the specific agent provider if it's not standard Mistral
    let aiResult;
    try {
      const response = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: 'mistral-medium', // Fallback model if agent is not available via this endpoint
          messages: [
            {
              role: 'system',
              content:
                'You are a diagnostic engine using the Weighted Matching Paradigm. Compare symptoms against clinical heuristics. Output JSON only.',
            },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env['CDSS-AI_API_KEY']}`,
            'Content-Type': 'application/json',
          },
        }
      );

      aiResult = JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Mistral AI Error:', error.response?.data || error.message);
      // Fallback or handle error
      throw new Error('AI analysis failed');
    }

    // 3. Persist to Database
    const diagnosisSession = await DiagnosisSession.create({
      patientId: session.user.id,
      bodyRegion,
      symptomData,
      mediaUrls,
      aiAnalysis: {
        ...aiResult,
        isProvisional: true, // Crucial medical disclaimer requirement
      },
      status: 'pending_review',
    });

    return NextResponse.json(
      {
        success: true,
        sessionId: diagnosisSession._id,
        aiAnalysis: diagnosisSession.aiAnalysis,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Assessment Submission Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
