'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ClipboardCheck, ListTodo, TrendingUp } from 'lucide-react';
import { ItemsByCategoryChart } from './_components/items-by-category-chart';
import { ItemsByLocationChart } from './_components/items-by-location-chart';
import { TaskCompletionChart } from './_components/task-completion-chart';
import { UserCompletionsChart } from './_components/user-completions-chart';

interface DashboardStats {
  totalItems: number;
  itemsByCategory: Array<{ name: string; color: string; count: number }>;
  itemsByLocation: Array<{ name: string; count: number }>;
  taskStats: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    completionRate: number;
  };
  completionsByUser: Array<{ id: string; name: string; count: number }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your family's tidying progress and inventory
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Total Items
            </CardTitle>
            <Package className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {stats?.totalItems ?? 0}
            </div>
            <p className="text-xs text-blue-700 mt-1">Items in inventory</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              Completed Tasks
            </CardTitle>
            <ClipboardCheck className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {stats?.taskStats?.completed ?? 0}
            </div>
            <p className="text-xs text-green-700 mt-1">
              Out of {stats?.taskStats?.total ?? 0} total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              Completion Rate
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {Math.round(stats?.taskStats?.completionRate ?? 0)}%
            </div>
            <p className="text-xs text-purple-700 mt-1">
              {stats?.taskStats?.pending ?? 0} tasks pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Items by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemsByCategoryChart data={stats?.itemsByCategory ?? []} />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Items by Location</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemsByLocationChart data={stats?.itemsByLocation ?? []} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Task Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskCompletionChart 
              completed={stats?.taskStats?.completed ?? 0}
              pending={stats?.taskStats?.pending ?? 0}
              inProgress={stats?.taskStats?.inProgress ?? 0}
            />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Completions by Family Member</CardTitle>
          </CardHeader>
          <CardContent>
            <UserCompletionsChart data={stats?.completionsByUser ?? []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
