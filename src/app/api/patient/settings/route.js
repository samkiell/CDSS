import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PatientSettingsController } from '@/controllers/patientSettings.controller';
import { ROLES } from '@/models/User';

/**
 * GET /api/patient/settings
 * Fetch settings for the authenticated patient.
 * Securely wraps the controller and enforces authorization.
 */
export async function GET() {
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

    const result = await PatientSettingsController.getSettings(session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error (GET settings):', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: error.status || 500 }
    );
  }
}

/**
 * PUT /api/patient/settings
 * Update settings for the authenticated patient.
 * Handles partial updates and rejects unknown fields via the Controller.
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

    const updateData = await req.json();
    const result = await PatientSettingsController.updateSettings(
      session.user.id,
      updateData
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error (PUT settings):', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: error.status || 500 }
    );
  }
}
