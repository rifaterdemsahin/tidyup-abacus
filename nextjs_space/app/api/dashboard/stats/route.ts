import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total items count
    const totalItems = await prisma.item.count();

    // Get items by category
    const itemsByCategory = await prisma.category.findMany({
      select: {
        name: true,
        color: true,
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get items by location
    const itemsByLocation = await prisma.location.findMany({
      select: {
        name: true,
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get task completion stats
    const totalTasks = await prisma.task.count();
    const completedTasks = await prisma.task.count({
      where: { status: 'completed' }
    });
    const pendingTasks = await prisma.task.count({
      where: { status: 'pending' }
    });
    const inProgressTasks = await prisma.task.count({
      where: { status: 'in_progress' }
    });

    // Get task completions over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completionsOverTime = await prisma.taskCompletion.groupBy({
      by: ['completedAt'],
      where: {
        completedAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: true
    });

    // Get completion stats by user
    const completionsByUser = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            taskCompletions: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      totalItems,
      itemsByCategory: itemsByCategory.map((cat: any) => ({
        name: cat.name,
        color: cat.color,
        count: cat._count?.items ?? 0
      })),
      itemsByLocation: itemsByLocation.map((loc: any) => ({
        name: loc.name,
        count: loc._count?.items ?? 0
      })),
      taskStats: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      },
      completionsOverTime,
      completionsByUser: completionsByUser.map((user: any) => ({
        id: user.id,
        name: user.name,
        count: user._count?.taskCompletions ?? 0
      }))
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
