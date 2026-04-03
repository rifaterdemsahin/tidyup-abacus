import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { notes } = body;
    const userId = (session.user as any).id;

    // Create completion record
    const completion = await prisma.taskCompletion.create({
      data: {
        taskId: params.id,
        userId,
        notes: notes || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        task: true
      }
    });

    // Update task status to completed
    await prisma.task.update({
      where: { id: params.id },
      data: { status: 'completed' }
    });

    return NextResponse.json(completion);
  } catch (error: any) {
    console.error('Error completing task:', error);
    return NextResponse.json(
      { error: 'Failed to complete task' },
      { status: 500 }
    );
  }
}
