'use server';

import { auth } from '@/../auth';
import connectDB from '@/lib/db/connect';
import DiagnosisSession from '@/models/DiagnosisSession';
import { revalidatePath } from 'next/cache';

/**
 * Assigns a patient (diagnosis session) to a clinician.
 * Only accessible by ADMIN users.
 */
export async function assignPatientToClinician(sessionId, clinicianId) {
  try {
    const session = await auth();

    // 1. Verify Admin Role
    if (!session || session.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }

    await connectDB();

    // 2. Update DiagnosisSession
    const updatedSession = await DiagnosisSession.findByIdAndUpdate(
      sessionId,
      {
        clinicianId,
        status: 'assigned',
      },
      { new: true }
    );

    if (!updatedSession) {
      throw new Error('Diagnosis session not found');
    }

    // 3. Revalidate paths for dashboard updates
    revalidatePath('/admin/dashboard');
    revalidatePath('/clinician/dashboard');

    return { success: true, session: JSON.parse(JSON.stringify(updatedSession)) };
  } catch (error) {
    console.error('Assignment Error:', error);
    return { success: false, error: error.message };
  }
}

import CaseFile from '@/models/CaseFile';

/**
 * Fetch new cases (pending review) for the admin dashboard.
 * This now fetches from the 'CaseFile' collection which is 'sent' to admin.
 */
export async function getNewCases() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    await connectDB();

    // Fetch CaseFiles that are linked to sessions pending review
    const caseFiles = await CaseFile.find()
      .populate('patientId', 'firstName lastName gender email')
      .populate({
        path: 'sessionId',
        match: { status: 'pending_review' },
        select: 'aiAnalysis bodyRegion status createdAt',
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out case files without a pending session (if we only want new cases)
    const newCases = caseFiles.filter((cf) => cf.sessionId !== null);

    // Sort by risk level (Urgent first)
    const riskPriority = { Urgent: 3, Moderate: 2, Low: 1 };
    newCases.sort((a, b) => {
      const priorityA = riskPriority[a.sessionId?.aiAnalysis?.riskLevel] || 0;
      const priorityB = riskPriority[b.sessionId?.aiAnalysis?.riskLevel] || 0;
      if (priorityB !== priorityA) return priorityB - priorityA;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return { success: true, cases: JSON.parse(JSON.stringify(newCases)) };
  } catch (error) {
    console.error('Fetch New Cases Error:', error);
    return { success: false, error: error.message };
  }
}
