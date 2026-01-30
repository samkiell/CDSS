import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PatientSettingsController } from '@/controllers/patientSettings.controller';
import { ROLES } from '@/models/User';

/**
 * PUT /api/patient/settings/password
 * Update password for the authenticated patient.
 * Securely wraps the controller and enforces authorization.
 */
export async function PUT(req) {
  try {
    const session = await auth();

    // Auth Check
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Role Check
    if (session.user.role !== ROLES.PATIENT) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Patient role required.' },
        { status: 403 }
      );
    }

    const { currentPassword, newPassword } = await req.json();
    const result = await PatientSettingsController.updatePassword(
      session.user.id,
      currentPassword,
      newPassword
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error (PUT password):', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: error.status || 500 }
    );
  }
}
