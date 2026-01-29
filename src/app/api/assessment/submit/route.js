import { auth } from '@/../auth';
import connectDB from '@/lib/db/connect';
import DiagnosisSession from '@/models/DiagnosisSession';
import CaseFile from '@/models/CaseFile';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import {
  getAiPreliminaryAnalysis,
  convertToTherapistFacingAnalysis,
} from '../../../../lib/ai-agent';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bodyRegion, symptomData, mediaUrls, aiAnalysis } = await req.json();

    if (!bodyRegion || !symptomData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Fetch user for naming convention
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Use existing AI analysis or regenerate if missing
    let finalAiResult = aiAnalysis;

    if (!finalAiResult) {
      try {
        const result = await getAiPreliminaryAnalysis({
          selectedRegion: bodyRegion,
          symptomData,
        });
        finalAiResult = result.analysis;
      } catch (error) {
        console.error('AI analysis error in submission:', error);
        // We don't necessarily want to fail the whole submission if AI fails,
        // but for now we follow the existing logic which throws.
        throw new Error('AI analysis failed');
      }
    }

    // 1b. Convert to Therapist-Facing Analysis before persistence
    // The patient-facing version is ephemeral and must never be stored.
    let therapistFacingResult;
    try {
      therapistFacingResult = await convertToTherapistFacingAnalysis(finalAiResult);
    } catch (error) {
      console.error('Conversion to therapist format failed:', error);
      throw new Error('Could not prepare assessment for clinical record');
    }

    // 2. Persist DiagnosisSession
    const diagnosisSession = await DiagnosisSession.create({
      patientId: session.user.id,
      bodyRegion,
      symptomData,
      mediaUrls,
      aiAnalysis: {
        ...therapistFacingResult,
        isProvisional: true, // Crucial medical disclaimer requirement
      },
      patientFacingAnalysis: finalAiResult, // Persist for patient-dashboard consistency
      status: 'pending_review',
    });

    // 3. Create CaseFile entry for Admin
    const caseFileId = `${user.firstName.toLowerCase()}_${user.lastName.toLowerCase()}-${diagnosisSession._id.toString().slice(-6)}`;

    await CaseFile.create({
      patientId: user._id,
      sessionId: diagnosisSession._id,
      caseFileId,
      fileName: `${bodyRegion} Assessment - ${new Date().toLocaleDateString()}`,
      fileUrl: 'internal://assessment-session', // Indicating this is a session record
      fileType: 'application/json',
      category: 'Other',
    });

    return NextResponse.json(
      {
        success: true,
        sessionId: diagnosisSession._id,
        aiAnalysis: diagnosisSession.aiAnalysis,
        caseFileId,
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
