/**
 * Diagnosis Sessions API Routes
 * CRUD operations for diagnosis sessions
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import DiagnosisSession from '@/models/DiagnosisSession';
import { calculateTemporalDiagnosis } from '@/lib/decision-engine/heuristic';

/**
 * GET /api/diagnosis
 * Retrieve diagnosis sessions with optional filtering
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;

    await connectDB();

    // Build query
    const query = {};
    if (patientId) query.patientId = patientId;
    if (status) query.sessionStatus = status;

    // Execute query with pagination
    const sessions = await DiagnosisSession.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('patientId', 'firstName lastName email')
      .lean();

    const total = await DiagnosisSession.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: sessions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get diagnosis sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/diagnosis
 * Create a new diagnosis session and calculate temporal diagnosis
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { patientId, symptoms, affectedRegions } = body;

    // Validate input
    if (!patientId || !symptoms || !Array.isArray(symptoms)) {
      return NextResponse.json(
        { error: 'patientId and symptoms array are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Calculate temporal diagnosis using heuristic engine
    const temporalDiagnosisResult = calculateTemporalDiagnosis(symptoms);

    // Create diagnosis session
    const session = await DiagnosisSession.create({
      patientId,
      symptoms,
      affectedRegions: affectedRegions || [],
      sessionStatus: 'completed',
      completedAt: new Date(),
      temporalDiagnosis: temporalDiagnosisResult,
    });

    return NextResponse.json(
      {
        success: true,
        data: session,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create diagnosis session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
