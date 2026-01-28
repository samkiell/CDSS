import { auth } from '@/../auth';
import dbConnect from '@/lib/db/connect';
import { CaseFile, User } from '@/models';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fileUrl, fileName, fileType, fileSize, category, patientId } = body;

    if (!fileUrl || !fileName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Use provided patientId if clinician is uploading, or session user id if patient is uploading
    const targetPatientId =
      session.user.role === 'CLINICIAN' ? patientId : session.user.id;

    if (!targetPatientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    // Generate a unique caseFileId
    const patientData = await User.findById(targetPatientId)
      .select('firstName lastName')
      .lean();
    if (!patientData) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const nameSlug = `${patientData.firstName.toLowerCase()}_${patientData.lastName.toLowerCase()}`;
    const timestamp = Date.now();
    const caseFileId = `${nameSlug}-${timestamp}`;

    const newCaseFile = await CaseFile.create({
      patientId: targetPatientId,
      caseFileId,
      fileName,
      fileUrl,
      fileType,
      fileSize,
      category: category || 'Other',
    });

    return NextResponse.json({ success: true, caseFile: newCaseFile });
  } catch (error) {
    console.error('CaseFile creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    await dbConnect();

    // Patients can only see their own docs, clinicians can see patient docs they are assigned to (simplified check here)
    let targetPatientId = session.user.role === 'CLINICIAN' ? patientId : session.user.id;

    if (
      !targetPatientId ||
      targetPatientId === 'undefined' ||
      targetPatientId === 'null'
    ) {
      return NextResponse.json(
        { error: 'Valid Patient ID is required' },
        { status: 400 }
      );
    }

    // Basic hex check for MongoDB ObjectId
    if (!/^[0-9a-fA-F]{24}$/.test(targetPatientId)) {
      return NextResponse.json({ error: 'Invalid Patient ID format' }, { status: 400 });
    }

    const documents = await CaseFile.find({
      patientId: targetPatientId,
      fileUrl: { $not: /^internal:\/\// }, // Filter out dummy internal session records
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error('Fetch documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    await dbConnect();

    // Verify ownership or role
    const doc = await CaseFile.findById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (
      doc.patientId.toString() !== session.user.id &&
      session.user.role !== 'CLINICIAN'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await CaseFile.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
