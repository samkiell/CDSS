'use server';

import connectDB from '@/lib/db/connect';
import User, { ROLES } from '@/models/User';
import DiagnosisSession from '@/models/DiagnosisSession';
import PatientProfile from '@/models/PatientProfile';
import Notification from '@/models/Notification';
import {
  sendClinicianAssignmentEmail,
  sendPatientAssignmentEmail,
} from '@/services/emailService';
import bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';

export async function upgradeUserRole(userId) {
  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.role = ROLES.CLINICIAN;
    await user.save();

    // Send notification to the user
    await Notification.create({
      userId: user._id,
      title: 'Role Upgraded',
      description:
        'Your account has been upgraded to Clinician (Therapist). You can now manage patient cases.',
      type: 'SYSTEM',
      link: '/clinician/dashboard',
    });

    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error upgrading user role:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Assigns a case (DiagnosisSession) to a clinician.
 */
export async function assignCase(sessionId, clinicianId) {
  try {
    await connectDB();
    const session = await DiagnosisSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Fetch clinician and patient details for notifications and emails
    const [clinician, patient] = await Promise.all([
      User.findById(clinicianId),
      User.findById(session.patientId),
    ]);

    if (!clinician || !patient) {
      throw new Error('Clinician or Patient not found');
    }

    session.clinicianId = clinicianId;
    session.status = 'assigned';
    await session.save();

    // Sync with PatientProfile so messaging system detects the assignment
    const profile = await PatientProfile.findOneAndUpdate(
      { userId: session.patientId },
      { assignedClinician: clinicianId },
      { upsert: true, new: true }
    );

    // Notify Clinician
    await Notification.create({
      userId: clinicianId,
      title: 'New Case Assigned',
      description:
        'A new patient case has been assigned to you. Please review the details.',
      type: 'SYSTEM',
      link: `/clinician/cases/${sessionId}`,
    });

    // Notify Patient
    await Notification.create({
      userId: session.patientId,
      title: 'Clinician Assigned',
      description:
        'A clinician has been assigned to review your assessment. You can now start communicating.',
      type: 'SYSTEM',
      link: '/patient/messages',
    });

    // Send Emails asynchronously (don't block the UI)
    const clinicianName = `${clinician.firstName} ${clinician.lastName}`;
    const patientName = `${patient.firstName} ${patient.lastName}`;

    sendClinicianAssignmentEmail(
      clinician.email,
      clinician.lastName,
      patientName,
      sessionId
    ).catch((err) => console.error('Clinician email error:', err));

    sendPatientAssignmentEmail(
      patient.email,
      patient.firstName,
      clinician.lastName
    ).catch((err) => console.error('Patient email error:', err));

    revalidatePath('/admin/sessions');
    revalidatePath('/admin/dashboard');
    revalidatePath('/patient/messages');
    revalidatePath('/clinician/messages');
    revalidatePath('/clinician/dashboard');
    revalidatePath('/clinician/patients');
    return { success: true };
  } catch (error) {
    console.error('Error assigning case:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verifies a clinician's professional credentials.
 */
export async function verifyClinician(clinicianId) {
  try {
    await connectDB();
    const clinician = await User.findById(clinicianId);
    
    if (!clinician) {
      throw new Error('Clinician not found');
    }

    if (clinician.role !== ROLES.CLINICIAN) {
      throw new Error('User is not a clinician');
    }

    // Update the professional verification status
    clinician.professional = {
      ...clinician.professional,
      verified: true,
      verifiedAt: new Date(),
    };
    await clinician.save();

    // Notify the clinician about verification
    await Notification.create({
      userId: clinicianId,
      title: 'Account Verified',
      description:
        'Your professional credentials have been verified. You can now receive patient assignments.',
      type: 'SYSTEM',
      link: '/clinician/dashboard',
    });

    revalidatePath('/admin/therapists');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error verifying clinician:', error);
    return { success: false, error: error.message };
  }
}
