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
import { extractRecommendedTests } from '@/lib/guided-test-engine';

/**
 * ASSESSMENT SUBMISSION API
 * ==========================
 * Handles submission of branching assessment data with full traceability.
 *
 * TASK 5 & 6 IMPLEMENTATION:
 * - Receives structured symptom data from branching engine
 * - Triggers AI temporal diagnosis (non-ML)
 * - Stores full assessment trace for therapist review
 * - Marks assessment as pending_review (locks editing)
 *
 * TASK 7 HANDOFF:
 * - After submission, status is set to 'pending_review'
 * - Patient answers are locked from editing
 * - Assessment becomes visible in therapist dashboard
 */
export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    /**
     * REQUEST BODY - BRANCHING ENGINE PAYLOAD
     * ========================================
     * region: Selected body region
     * biodata: Per-assessment biodata snapshot
     * symptomData: Array of question/answer pairs with effects
     * redFlags: Array of detected red flags
     * conditionAnalysis: Ranked conditions by likelihood
     * primarySuspicion: Primary suspected condition
     * differentialDiagnoses: Ranked differential diagnoses
     * assessmentMetadata: Timestamps and completion info
     */
    const {
      region,
      biodata,
      symptomData,
      redFlags,
      conditionAnalysis,
      primarySuspicion,
      differentialDiagnoses,
      assessmentMetadata,
      mediaUrls,
    } = await req.json();

    // Validate required fields
    if (!region || !symptomData || symptomData.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: region and symptomData are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Fetch user for naming convention and validation
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    /**
     * AI TEMPORAL DIAGNOSIS
     * ======================
     * The AI must:
     * - Reason over the structured answers
     * - Apply clinical logic based on the rule context
     * - Produce a TEMPORAL diagnosis, not a final diagnosis
     *
     * IMPORTANT:
     * - This is NOT machine learning
     * - AI is used for reasoning and summarization only
     * - Diagnosis is always marked as provisional
     */
    let aiAnalysisResult;
    try {
      const result = await getAiPreliminaryAnalysis({
        selectedRegion: region,
        symptomData: symptomData.map((sd) => ({
          questionId: sd.questionId,
          question: sd.question,
          response: sd.response,
          questionCategory: sd.questionCategory,
        })),
        redFlags: redFlags || [],
        conditionAnalysis: conditionAnalysis || [],
        primarySuspicion: primarySuspicion || null,
        differentialDiagnoses: differentialDiagnoses || [],
        patientBiodata: biodata,
      });
      aiAnalysisResult = result.analysis;
    } catch (error) {
      console.error('AI temporal diagnosis error:', error);

      /**
       * FALLBACK ANALYSIS
       * ==================
       * If AI fails, create a safe fallback that still allows submission
       * but requires immediate therapist review.
       */
      aiAnalysisResult = {
        temporalDiagnosis: 'Unable to generate AI analysis - Therapist review required',
        confidenceScore: 0,
        riskLevel: redFlags?.length > 0 ? 'Urgent' : 'Moderate',
        reasoning: [
          'AI analysis could not be completed',
          'Manual therapist review is required',
          ...(redFlags?.map(
            (rf) => `Red flag detected: ${rf.redFlagText || rf.question}`
          ) || []),
        ],
        differentialDiagnoses: primarySuspicion
          ? [primarySuspicion.name]
          : conditionAnalysis?.slice(0, 3).map((c) => c.name) || [],
      };
    }

    // Convert to therapist-facing format
    let therapistFacingResult;
    try {
      therapistFacingResult = await convertToTherapistFacingAnalysis(aiAnalysisResult);
    } catch (error) {
      console.error('Conversion to therapist format failed:', error);
      therapistFacingResult = aiAnalysisResult;
    }

    /**
     * EXTRACT RECOMMENDED TESTS
     * ==========================
     * Determine physical tests to be performed by therapist based on AI analysis.
     * Captured at submission time to ensure immutability and traceability.
     */
    let recommendedTests = [];
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const regionName = region.charAt(0).toUpperCase() + region.slice(1);
      const rulesPath = path.join(
        process.cwd(),
        'public',
        'rules',
        `${regionName} Region.json`
      );
      const rulesContent = await fs.readFile(rulesPath, 'utf-8');
      const rulesJson = JSON.parse(rulesContent);

      const suspectedConditionsForTests = [
        therapistFacingResult.temporalDiagnosis,
        ...(aiAnalysisResult.differentialDiagnoses || []),
      ].filter(Boolean);

      recommendedTests = extractRecommendedTests(rulesJson, suspectedConditionsForTests);
      console.log(`Extracted ${recommendedTests.length} recommended tests for ${region}`);
    } catch (err) {
      console.warn(`Could not load rules for ${region} to extract tests:`, err.message);
    }

    /**
     * BIODATA SNAPSHOT PERSISTENCE
     * =============================
     * Preserves patient information at the exact time of assessment.
     */
    const biodataSnapshot = biodata
      ? {
          fullName: biodata.fullName,
          sex: biodata.sex,
          ageRange: biodata.ageRange,
          occupation: biodata.occupation,
          education: biodata.education,
          notes: biodata.notes || null,
          confirmedAt: biodata.confirmedAt || new Date(),
        }
      : null;

    /**
     * ASSESSMENT TRACE
     * =================
     * Full traceability record for therapist review.
     *
     * TASK 6: Stores the following per assessment:
     * - Biodata snapshot
     * - Selected region
     * - Full question and answer log
     * - Rule-out decisions
     * - AI temporal diagnosis output
     * - Timestamped events
     */
    const assessmentTrace = {
      region,
      startedAt: assessmentMetadata?.startedAt || new Date(),
      completedAt: assessmentMetadata?.completedAt || new Date(),
      totalQuestions: symptomData.length,
      questionsAnswered: symptomData,
      conditionAnalysis: conditionAnalysis || [],
      redFlags: redFlags || [],
      primarySuspicion: primarySuspicion || null,
      differentialDiagnoses: differentialDiagnoses || [],
    };

    /**
     * PERSIST DIAGNOSIS SESSION
     * ==========================
     * Creates the assessment record with all traceability data.
     *
     * TASK 7: Status is set to 'pending_review'
     * - Locks patient answers from editing
     * - Makes assessment visible in therapist dashboard
     */
    const diagnosisSession = await DiagnosisSession.create({
      patientId: session.user.id,
      biodata: biodataSnapshot,
      bodyRegion: region,
      symptomData: symptomData,
      mediaUrls: mediaUrls || [],
      assessmentTrace,
      recommendedTests, // Storing pre-determined tests for therapist guidance
      aiAnalysis: {
        temporalDiagnosis: therapistFacingResult.temporalDiagnosis,
        confidenceScore: therapistFacingResult.confidenceScore,
        riskLevel: therapistFacingResult.riskLevel,
        reasoning: therapistFacingResult.reasoning,
        differentialDiagnoses: aiAnalysisResult.differentialDiagnoses || [],
        isProvisional: true, // ALWAYS provisional - medical disclaimer requirement
        disclaimer:
          'This is a preliminary AI-generated assessment and not a final diagnosis. ' +
          'A qualified therapist will review your case and provide clinical confirmation.',
      },
      patientFacingAnalysis: aiAnalysisResult,
      /* TASK 7: Handoff to Therapist - status set to pending_review */
      status: 'pending_review',
      submittedToTherapistAt: new Date(),
      assessmentType: 'MSK_BRANCHING_ENGINE_V1',
    });

    // Create CaseFile entry for Admin/Therapist dashboard
    const caseFileId = `${user.firstName?.toLowerCase() || 'patient'}_${user.lastName?.toLowerCase() || 'unknown'}-${diagnosisSession._id.toString().slice(-6)}`;

    await CaseFile.create({
      patientId: user._id,
      sessionId: diagnosisSession._id,
      caseFileId,
      fileName: `${region} Assessment - ${new Date().toLocaleDateString()}`,
      fileUrl: 'internal://assessment-session',
      fileType: 'application/json',
      category: 'Other',
    });

    /**
     * RESPONSE INCLUDES:
     * - sessionId for tracking
     * - Patient-facing AI analysis for display
     * - Red flags count for emphasis
     * - Status confirmation
     */
    return NextResponse.json(
      {
        success: true,
        sessionId: diagnosisSession._id,
        aiAnalysis: {
          temporalDiagnosis: aiAnalysisResult.temporalDiagnosis,
          confidenceScore: aiAnalysisResult.confidenceScore,
          riskLevel: aiAnalysisResult.riskLevel,
          reasoning: aiAnalysisResult.reasoning,
          disclaimer:
            'This is a preliminary assessment. A therapist will review your case.',
        },
        redFlagsCount: redFlags?.length || 0,
        status: 'pending_review',
        caseFileId,
        /**
         * TODO: THERAPIST-GUIDED TESTING
         * ===============================
         * After this point, the therapist dashboard will show the case.
         * Implementation of therapist-side logic is pending.
         */
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
