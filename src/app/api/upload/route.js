import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadFile } from '@/lib/cloudinary';

// Server-side upload guards (defence-in-depth on top of the Cloudinary preset).
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/dicom',
]);

export async function POST(request) {
  try {
    // Only authenticated users may push files to our Cloudinary account.
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate size and type before spending an upload.
    if (typeof file.size === 'number' && file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File exceeds the 15 MB limit' },
        { status: 413 }
      );
    }
    if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${file.type}` },
        { status: 415 }
      );
    }

    // Convert file to array buffer and then to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Guard again on the actual byte length (FormData size can be spoofed/absent).
    if (buffer.length > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File exceeds the 15 MB limit' },
        { status: 413 }
      );
    }

    // Upload to Cloudinary using the existing medical_image preset or a generic one
    const result = await uploadFile(buffer, {
      preset: 'medical_image', // Or create a new one for chat
    });

    if (result.success) {
      return NextResponse.json({ success: true, url: result.url });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('API Upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
