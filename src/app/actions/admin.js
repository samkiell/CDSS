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

/**
 * Fetch new cases (pending review) for the admin dashboard.
 */
export async function getNewCases() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    await connectDB();

    const cases = await DiagnosisSession.find({ status: 'pending_review' })
      .populate('patientId', 'firstName lastName gender')
      .sort({ 'aiAnalysis.riskLevel': -1, createdAt: 1 }) // Urgent first
      .lean();

    // Map risk levels to sort correctly (Urgent > Moderate > Low)
    const riskPriority = { Urgent: 3, Moderate: 2, Low: 1 };
    cases.sort((a, b) => {
      const priorityA = riskPriority[a.aiAnalysis.riskLevel] || 0;
      const priorityB = riskPriority[b.aiAnalysis.riskLevel] || 0;
      if (priorityB !== priorityA) return priorityB - priorityA;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    return { success: true, cases: JSON.parse(JSON.stringify(cases)) };
  } catch (error) {
    console.error('Fetch New Cases Error:', error);
    return { success: false, error: error.message };
  }
}
