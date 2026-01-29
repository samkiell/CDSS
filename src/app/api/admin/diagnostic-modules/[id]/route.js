import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import DiagnosticModule from '@/models/DiagnosticModule';
import { auth } from '@/auth';

// GET - Fetch a single diagnostic module
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const module = await DiagnosticModule.findById(id)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    return NextResponse.json({ module });
  } catch (error) {
    console.error('Error fetching diagnostic module:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diagnostic module' },
      { status: 500 }
    );
  }
}

// PUT - Update a diagnostic module
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { title, description, region, status, questions } = body;

    const module = await DiagnosticModule.findById(id);
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Update fields
    if (title) module.title = title;
    if (description !== undefined) module.description = description;
    if (region) module.region = region;
    if (status) module.status = status;
    if (questions) module.questions = questions;
    module.updatedBy = session.user.id;
    module.version += 1;

    await module.save();

    return NextResponse.json({ module });
  } catch (error) {
    console.error('Error updating diagnostic module:', error);
    return NextResponse.json(
      { error: 'Failed to update diagnostic module' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a diagnostic module
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    const module = await DiagnosticModule.findById(id);
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Don't allow deleting default modules
    if (module.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default modules' },
        { status: 400 }
      );
    }

    await DiagnosticModule.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting diagnostic module:', error);
    return NextResponse.json(
      { error: 'Failed to delete diagnostic module' },
      { status: 500 }
    );
  }
}
