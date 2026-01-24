/**
 * File Upload API Route
 * Handles medical image and document uploads via Cloudinary
 */

import { NextResponse } from 'next/server';
import { uploadFile, generateSignedUploadParams } from '@/lib/cloudinary';

/**
 * POST /api/upload
 * Upload a file to Cloudinary
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const preset = formData.get('preset') || 'medical_image';
    const sessionId = formData.get('sessionId');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a base64 data URI for Cloudinary upload
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const result = await uploadFile(dataUri, {
      preset,
      customOptions: {
        context: `session_id=${sessionId || 'unknown'}`,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        format: result.format,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/upload
 * Get signed upload parameters for direct client uploads
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const preset = searchParams.get('preset') || 'medical_image';

    const params = generateSignedUploadParams({ preset });

    return NextResponse.json({
      success: true,
      data: params,
    });
  } catch (error) {
    console.error('Get upload params error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
