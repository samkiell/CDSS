'use server';

import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import DiagnosisSession from '@/models/DiagnosisSession';
import { revalidatePath } from 'next/cache';

/**
 * Assigns a patient's diagnosis session to a specific clinician.
 *
 * @param {string} sessionId - The ID of the DiagnosisSession.
 * @param {string} clinicianId - The ID of the User (Clinician).
 */
export async function assignPatientToClinician(sessionId, clinicianId) {
  try {
    // 1. Verify the requestor has role: 'ADMIN'
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Only admins can assign cases.');
    }

    if (!sessionId || !clinicianId) {
      throw new Error('Session ID and Clinician ID are required.');
    }

    await connectDB();

    // 2. Update the DiagnosisSession
    const updatedSession = await DiagnosisSession.findByIdAndUpdate(
      sessionId,
      {
        clinicianId: clinicianId,
        status: 'assigned',
      },
      { new: true }
    );

    if (!updatedSession) {
      throw new Error('Diagnosis session not found.');
    }

    // 3. Trigger revalidate path for the Clinician Dashboard
    // Assuming the clinician dashboard is at /clinician/dashboard or similar
    revalidatePath('/(dashboard)/(clinician)/clinician', 'layout');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      message: `Case successfully assigned to clinician.`,
      sessionId: updatedSession._id.toString(),
    };
  } catch (error) {
    console.error('Admin Assignment Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to assign case.',
    };
  }
}

/**
 * Fetches all new cases for the Admin Dashboard.
 * Populate "New Cases" card as seen in caseview.png.
 */
export async function getPendingCases() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    await connectDB();

    /**
     * Query: Fetch all DiagnosisSession where status is pending_review.
     * Sort: Order by aiAnalysis.riskLevel (Urgent first) and then createdAt.
     * Note: We use a custom sort order for riskLevel.
     */
    const cases = await DiagnosisSession.find({ status: 'pending_review' })
      .populate('patientId', 'firstName lastName gender email')
      .lean();

    // Custom sort for riskLevel: Urgent > Moderate > Low
    const riskPriority = { Urgent: 1, Moderate: 2, Low: 3, null: 4 };

    const sortedCases = cases.sort((a, b) => {
      const priorityA = riskPriority[a.aiAnalysis?.riskLevel] || 5;
      const priorityB = riskPriority[b.aiAnalysis?.riskLevel] || 5;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return {
      success: true,
      data: sortedCases.map((c) => ({
        id: c._id.toString(),
        patientName: `${c.patientId.firstName} ${c.patientId.lastName}`,
        sex: c.patientId.gender,
        status: c.aiAnalysis?.riskLevel || 'Unknown',
        riskLevel: c.aiAnalysis?.riskLevel,
        bodyRegion: c.bodyRegion,
        createdAt: c.createdAt,
      })),
    };
  } catch (error) {
    console.error('Fetch Pending Cases Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
