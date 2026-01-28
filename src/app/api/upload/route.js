import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to array buffer and then to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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
