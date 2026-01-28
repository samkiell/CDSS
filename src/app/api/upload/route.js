/**
 * File Upload API Route
 * Handles medical image and document uploads via Cloudinary
 */

import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/cloudinary';

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

    // Detect if file is PDF for better Cloudinary handling
    const isPDF =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    // Upload to Cloudinary directly using the buffer
    const result = await uploadFile(buffer, {
      preset,
      customOptions: {
        context: `session_id=${sessionId || 'unknown'}`,
        // Force 'raw' for PDFs to avoid Cloudinary's "Authenticated/Private" image-pdf restriction (401 error)
        resource_type: isPDF ? 'raw' : 'auto',
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
 * GET - Removed for security or unused
 */
