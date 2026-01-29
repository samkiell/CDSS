import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import DiagnosticModule from '@/models/DiagnosticModule';
import { auth } from '@/auth';

// GET - Fetch all diagnostic modules
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const region = searchParams.get('region');

    const query = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (region && region !== 'ALL') {
      query.region = region;
    }

    const modules = await DiagnosticModule.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    // Add question count since virtuals don't work with lean()
    const modulesWithCount = modules.map((m) => ({
      ...m,
      questionCount: m.questions?.length || 0,
    }));

    return NextResponse.json({ modules: modulesWithCount });
  } catch (error) {
    console.error('Error fetching diagnostic modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diagnostic modules' },
      { status: 500 }
    );
  }
}

// POST - Create a new diagnostic module
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can create modules
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { title, description, region, status, questions } = body;

    if (!title || !region) {
      return NextResponse.json(
        { error: 'Title and region are required' },
        { status: 400 }
      );
    }

    const newModule = await DiagnosticModule.create({
      title,
      description: description || '',
      region,
      status: status || 'Draft',
      questions: questions || [],
      createdBy: session.user.id,
    });

    return NextResponse.json({ module: newModule }, { status: 201 });
  } catch (error) {
    console.error('Error creating diagnostic module:', error);
    return NextResponse.json(
      { error: 'Failed to create diagnostic module' },
      { status: 500 }
    );
  }
}
