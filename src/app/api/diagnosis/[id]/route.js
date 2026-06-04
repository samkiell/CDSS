/**
 * Single Diagnosis Session API Routes
 * Get, update, delete specific session
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import DiagnosisSession from '@/models/DiagnosisSession';
import { ROLES } from '@/models';

/**
 * Authorize access to a single diagnosis session (PHI).
 *
 * Returns { ok: true, user } when allowed, or { ok: false, status, error }.
 * @param {object} authedUser - session.user
 * @param {object} record     - the DiagnosisSession document (lean or full)
 * @param {boolean} allowUnassignedForClinician - clinicians may act on unassigned cases
 */
function authorizeSessionAccess(authedUser, record, allowUnassignedForClinician) {
  const role = authedUser.role;
  if (role === ROLES.ADMIN) return { ok: true };

  if (role === ROLES.PATIENT) {
    if (record.patientId?.toString() === authedUser.id) return { ok: true };
    return { ok: false, status: 403, error: 'Forbidden' };
  }

  if (role === ROLES.CLINICIAN) {
    const assignedTo = record.clinicianId?.toString() || null;
    if (assignedTo === authedUser.id) return { ok: true };
    if (allowUnassignedForClinician && assignedTo === null) return { ok: true };
    return { ok: false, status: 403, error: 'Forbidden' };
  }

  return { ok: false, status: 403, error: 'Forbidden' };
}

/**
 * GET /api/diagnosis/[id]
 * Retrieve a specific diagnosis session.
 *
 * Access: patient (own), clinician (assigned or unassigned/triage), admin (all).
 */
export async function GET(request, { params }) {
  try {
    const authSession = await auth();
    if (!authSession?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
    }

    await connectDB();

    const session = await DiagnosisSession.findById(id)
      .populate({
        path: 'patientId',
        select: 'firstName lastName email gender dateOfBirth avatar',
        options: { strictPopulate: false },
      })
      .populate({
        path: 'clinicianReview.reviewedBy',
        select: 'firstName lastName',
        options: { strictPopulate: false },
      })
      .lean();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // patientId is populated here, clinicianId is not — normalize both to id strings.
    const decision = authorizeSessionAccess(
      authSession.user,
      {
        patientId: session.patientId?._id || session.patientId,
        clinicianId: session.clinicianId,
      },
      /* allowUnassignedForClinician */ true
    );
    if (!decision.ok) {
      return NextResponse.json({ error: decision.error }, { status: decision.status });
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
    const authSession = await auth();
    if (!authSession?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only clinicians (and admins) may write clinician reviews.
    const role = authSession.user.role;
    if (role !== ROLES.CLINICIAN && role !== ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
    }
    const body = await request.json();

    await connectDB();

    const session = await DiagnosisSession.findById(id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // A clinician may review a case assigned to them, or claim an unassigned one.
    const decision = authorizeSessionAccess(
      authSession.user,
      { patientId: session.patientId, clinicianId: session.clinicianId },
      /* allowUnassignedForClinician */ true
    );
    if (!decision.ok) {
      return NextResponse.json({ error: decision.error }, { status: decision.status });
    }

    // Claim the case for this clinician if it is not yet assigned.
    if (role === ROLES.CLINICIAN && !session.clinicianId) {
      session.clinicianId = authSession.user.id;
    }

    // Update allowed fields
    const allowedUpdates = ['status', 'clinicianReview', 'finalDiagnosis'];

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        session[key] = body[key];
      }
    }

    // If clinician review is being added, update status and stamp the reviewer.
    if (body.clinicianReview?.confirmedDiagnosis) {
      session.status = 'completed';
      session.clinicianReview.reviewedAt = new Date();
      session.clinicianReview.reviewedBy = authSession.user.id;
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
    const authSession = await auth();
    if (!authSession?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Archiving a clinical record is restricted to the assigned clinician or an admin.
    const role = authSession.user.role;
    if (role !== ROLES.CLINICIAN && role !== ROLES.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
    }

    await connectDB();

    const session = await DiagnosisSession.findById(id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const decision = authorizeSessionAccess(
      authSession.user,
      { patientId: session.patientId, clinicianId: session.clinicianId },
      /* allowUnassignedForClinician */ false
    );
    if (!decision.ok) {
      return NextResponse.json({ error: decision.error }, { status: decision.status });
    }

    // Soft delete by setting status to archived
    session.status = 'archived';
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
