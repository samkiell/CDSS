import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db/connect';
import { AdminSettings } from '@/models';
import { logAudit } from '@/lib/audit';

export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { platformName, allowClinicianSignup, allowPatientSignup, maintenanceMode } =
      body;

    await connectDB();
    const settings = await AdminSettings.getSettings();

    // Update system settings
    if (platformName !== undefined) settings.system.platformName = platformName;
    if (allowClinicianSignup !== undefined)
      settings.system.allowClinicianSignup = allowClinicianSignup;
    if (allowPatientSignup !== undefined)
      settings.system.allowPatientSignup = allowPatientSignup;
    if (maintenanceMode !== undefined) settings.system.maintenanceMode = maintenanceMode;

    await settings.save();

    await logAudit({
      adminId: session.user.id,
      action: 'UPDATE_SYSTEM_SETTINGS',
      metadata: body,
    });

    return NextResponse.json(settings.system);
  } catch (error) {
    console.error('System settings update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
