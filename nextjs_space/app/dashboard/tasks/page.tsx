'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, CheckCircle2, Circle, Clock, MapPin, User } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  recurrence: string;
  status: string;
  location: { id: string; name: string } | null;
  assignments: Array<{
    user: { id: string; name: string; email: string; age: number | null; role: string | null };
  }>;
  completions: Array<{
    user: { id: string; name: string };
    completedAt: Date;
  }>;
}

export default function TasksPage() {
  const { data: session } = useSession() || {};
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly'>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: null })
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 
                     currentStatus === 'pending' ? 'in_progress' : 'completed';
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const filteredTasks = tasks?.filter((task: any) => {
    if (filter === 'all') return true;
    return task?.recurrence === filter;
  }) ?? [];

  const dailyTasks = filteredTasks?.filter((t: any) => t?.recurrence === 'daily') ?? [];
  const weeklyTasks = filteredTasks?.filter((t: any) => t?.recurrence === 'weekly') ?? [];
  const otherTasks = filteredTasks?.filter((t: any) => t?.recurrence === 'none') ?? [];

  const TaskCard = ({ task }: { task: Task }) => {
    const isCompleted = task?.status === 'completed';
    const isInProgress = task?.status === 'in_progress';
    const isAssignedToMe = task?.assignments?.some((a: any) => a?.user?.id === (session?.user as any)?.id) ?? false;

    return (
      <Card className={`shadow-md hover:shadow-lg transition-all ${
        isCompleted ? 'bg-green-50 border-green-200' : 
        isInProgress ? 'bg-blue-50 border-blue-200' : 
        'bg-white'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => handleToggleStatus(task?.id ?? '', task?.status ?? 'pending')}
              className="mt-1 flex-shrink-0"
            >
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : isInProgress ? (
                <Clock className="w-6 h-6 text-blue-600" />
              ) : (
                <Circle className="w-6 h-6 text-gray-400" />
              )}
            </button>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className={`font-semibold text-base ${
                  isCompleted ? 'line-through text-muted-foreground' : ''
                }`}>
                  {task?.title ?? 'Untitled Task'}
                </h3>
                <Badge variant={task?.recurrence === 'daily' ? 'default' : 'secondary'} className="text-xs">
                  {task?.recurrence ?? 'none'}
                </Badge>
              </div>
              {task?.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {task?.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{task.location.name}</span>
                  </div>
                )}
                {task?.assignments && task.assignments.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{task.assignments.map((a: any) => a?.user?.name).join(', ')}</span>
                  </div>
                )}
                {isAssignedToMe && (
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-300">
                    Assigned to you
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Tasks & Checklists
        </h1>
        <p className="text-muted-foreground text-lg">
          Keep track of your daily and weekly tidying tasks
        </p>
      </div>

      {/* Daily Tasks */}
      {dailyTasks && dailyTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Daily Tasks</h2>
              <p className="text-sm text-muted-foreground">
                {dailyTasks.filter((t: any) => t?.status !== 'completed').length} pending
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyTasks.map((task: any) => (
              <TaskCard key={task?.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Weekly Tasks */}
      {weeklyTasks && weeklyTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Weekly Tasks</h2>
              <p className="text-sm text-muted-foreground">
                {weeklyTasks.filter((t: any) => t?.status !== 'completed').length} pending
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weeklyTasks.map((task: any) => (
              <TaskCard key={task?.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Other Tasks */}
      {otherTasks && otherTasks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Other Tasks</h2>
              <p className="text-sm text-muted-foreground">
                {otherTasks.filter((t: any) => t?.status !== 'completed').length} pending
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherTasks.map((task: any) => (
              <TaskCard key={task?.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {(!tasks || tasks.length === 0) && (
        <Card className="shadow-md">
          <CardContent className="p-12 text-center">
            <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground">
              Tasks will appear here once they are created
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
