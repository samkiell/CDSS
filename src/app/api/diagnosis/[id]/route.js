/**
 * Single Diagnosis Session API Routes
 * Get, update, delete specific session
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import DiagnosisSession from '@/models/DiagnosisSession';

/**
 * GET /api/diagnosis/[id]
 * Retrieve a specific diagnosis session
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    await connectDB();

    const session = await DiagnosisSession.findById(id)
      .populate('patientId', 'firstName lastName email')
      .populate('clinicianReview.reviewedBy', 'firstName lastName')
      .lean();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Get diagnosis session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/diagnosis/[id]
 * Update a diagnosis session (clinician review)
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    await connectDB();

    const session = await DiagnosisSession.findById(id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update allowed fields
    const allowedUpdates = ['sessionStatus', 'clinicianReview', 'finalDiagnosis'];

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        session[key] = body[key];
      }
    }

    // If clinician review is being added, update status
    if (body.clinicianReview?.confirmedDiagnosis) {
      session.sessionStatus = 'reviewed';
      session.clinicianReview.reviewedAt = new Date();
    }

    await session.save();

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Update diagnosis session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/diagnosis/[id]
 * Archive a diagnosis session (soft delete)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await connectDB();

    const session = await DiagnosisSession.findById(id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Soft delete by setting status to archived
    session.sessionStatus = 'archived';
    await session.save();

    return NextResponse.json({
      success: true,
      message: 'Session archived successfully',
    });
  } catch (error) {
    console.error('Delete diagnosis session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
