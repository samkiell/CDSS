import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import DiagnosisSession from '@/models/DiagnosisSession';
import {
  initializeGuidedTestEngine,
  getCurrentTest,
  recordTestResult,
  generateRefinedDiagnosis,
  prepareForPersistence,
} from '@/lib/guided-test-engine';

/**
 * GET /api/diagnosis/[id]/guided-test
 */
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'CLINICIAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const diagnosisSession = await DiagnosisSession.findById(id).lean();
    if (!diagnosisSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if locked
    if (diagnosisSession.guidedTestResults?.isLocked) {
      return NextResponse.json({
        success: true,
        isLocked: true,
        guidedTestResults: diagnosisSession.guidedTestResults,
      });
    }

    // Initialize or Resume engine state
    let engineState = {
      assessmentId: id,
      therapistId: session.user.id,
      region: diagnosisSession.bodyRegion,
      completedTests: diagnosisSession.guidedTestResults?.tests || [],
      currentNodeId: diagnosisSession.guidedTestResults?.currentNodeId,
    };

    // If never started, initialize
    if (!engineState.currentNodeId) {
      const initialState = initializeGuidedTestEngine({
        assessmentId: id,
        therapistId: session.user.id,
        region: diagnosisSession.bodyRegion,
      });
      engineState = { ...engineState, ...initialState };

      // Save initial currentNodeId
      await DiagnosisSession.findByIdAndUpdate(id, {
        'guidedTestResults.currentNodeId': engineState.currentNodeId,
        'guidedTestResults.therapistId': session.user.id,
      });
    } else {
      // Re-initialize graph for existing session
      const baseState = initializeGuidedTestEngine({
        assessmentId: id,
        therapistId: session.user.id,
        region: diagnosisSession.bodyRegion,
      });
      engineState.graph = baseState.graph;
    }

    const currentTest = getCurrentTest(engineState);

    return NextResponse.json({
      success: true,
      assessmentId: id,
      region: diagnosisSession.bodyRegion,
      currentTest,
      recommendedTests: diagnosisSession.recommendedTests || [],
      completedTestsCount: engineState.completedTests.length,
      isLocked: false,
    });
  } catch (error) {
    console.error('GET guided-test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/diagnosis/[id]/guided-test
 * Records a result and advances the flowchart
 */
export async function POST(request, { params }) {
  try {
    const authSession = await auth();
    if (!authSession?.user || authSession.user.role !== 'CLINICIAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { testId, result, notes } = await request.json();

    await connectDB();
    const ds = await DiagnosisSession.findById(id);
    if (!ds) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (ds.guidedTestResults?.isLocked) {
      return NextResponse.json({ error: 'Locked' }, { status: 403 });
    }

    // Load engine state
    const baseState = initializeGuidedTestEngine({
      assessmentId: id,
      therapistId: authSession.user.id,
      region: ds.bodyRegion,
    });

    const currentState = {
      ...baseState,
      completedTests: ds.guidedTestResults?.tests || [],
      currentNodeId: ds.guidedTestResults?.currentNodeId || baseState.currentNodeId,
    };

    // Advance engine
    const nextState = recordTestResult(currentState, testId, result, notes);

    // Persist changes
    ds.guidedTestResults = ds.guidedTestResults || {
      therapistId: authSession.user.id,
      tests: [],
    };

    // Add the new test to the list
    ds.guidedTestResults.tests = nextState.completedTests;
    ds.guidedTestResults.currentNodeId = nextState.currentNodeId;

    if (nextState.isComplete) {
      const persistenceData = prepareForPersistence(nextState, authSession.user.id);
      ds.guidedTestResults.refinedDiagnosis = persistenceData.refinedDiagnosis;
      ds.guidedTestResults.completedAt = new Date();
      ds.guidedTestResults.isLocked = true;
      ds.status = 'completed';
    }

    await ds.save();

    return NextResponse.json({
      success: true,
      nextState: {
        isComplete: nextState.isComplete,
        currentNodeId: nextState.currentNodeId,
      },
    });
  } catch (error) {
    console.error('POST guided-test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/diagnosis/[id]/guided-test
 * Manual completion (optional, mainly handled by POST terminal nodes)
 */
export async function PUT(request, { params }) {
  // Similar logic to POST completion but triggered manually
  // For now, let's keep it simple as POST handles terminal nodes
  return NextResponse.json({ success: true, message: 'Flow managed by decision graph' });
}
