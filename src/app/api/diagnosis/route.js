/**
 * Diagnosis Sessions API Routes
 * CRUD operations for diagnosis sessions
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import DiagnosisSession from '@/models/DiagnosisSession';
import { ROLES } from '@/models';
import { calculateTemporalDiagnosis } from '@/lib/decision-engine/heuristic';

/**
 * GET /api/diagnosis
 * Retrieve diagnosis sessions with optional filtering.
 *
 * Access control (PHI):
 * - PATIENT   → can only ever see their own sessions (patientId is forced to self).
 * - CLINICIAN → sees sessions assigned to them, or may filter by a specific patientId.
 * - ADMIN     → may see all sessions.
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedPatientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 100);
    const page = Math.max(parseInt(searchParams.get('page')) || 1, 1);

    await connectDB();

    // Build query with server-side authorization scoping — never trust client patientId blindly.
    const query = {};
    const role = session.user.role;

    if (role === ROLES.PATIENT) {
      // Patients are locked to their own records regardless of any supplied patientId.
      query.patientId = session.user.id;
    } else if (role === ROLES.CLINICIAN) {
      if (requestedPatientId) {
        if (!/^[0-9a-fA-F]{24}$/.test(requestedPatientId)) {
          return NextResponse.json(
            { error: 'Invalid patientId format' },
            { status: 400 }
          );
        }
        query.patientId = requestedPatientId;
      } else {
        // No specific patient → show the triage queue: cases assigned to this
        // clinician OR still unassigned (e.g. pending_review awaiting pickup).
        query.$or = [{ clinicianId: session.user.id }, { clinicianId: null }];
      }
    } else if (role === ROLES.ADMIN) {
      if (requestedPatientId) {
        if (!/^[0-9a-fA-F]{24}$/.test(requestedPatientId)) {
          return NextResponse.json(
            { error: 'Invalid patientId format' },
            { status: 400 }
          );
        }
        query.patientId = requestedPatientId;
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (status) query.status = status;

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
    const authSession = await auth();
    if (!authSession?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { patientId: bodyPatientId, symptoms, affectedRegions } = body;

    // Validate input
    if (!symptoms || !Array.isArray(symptoms)) {
      return NextResponse.json(
        { error: 'symptoms array is required' },
        { status: 400 }
      );
    }

    // Never trust a client-supplied patientId for a patient. Patients always
    // create sessions for themselves; clinicians/admins may create on behalf of
    // a specific (validated) patient.
    let patientId;
    if (authSession.user.role === ROLES.PATIENT) {
      patientId = authSession.user.id;
    } else {
      patientId = bodyPatientId;
      if (!patientId || !/^[0-9a-fA-F]{24}$/.test(patientId)) {
        return NextResponse.json(
          { error: 'A valid patientId is required' },
          { status: 400 }
        );
      }
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
