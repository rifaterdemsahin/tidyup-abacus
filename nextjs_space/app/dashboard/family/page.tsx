'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, ClipboardCheck, ListTodo } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  age: number | null;
  role: string | null;
  _count: {
    taskAssignments: number;
    taskCompletions: number;
  };
}

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        // Filter out the test john@doe.com account
        const filtered = data?.filter((m: any) => m?.email !== 'john@doe.com') ?? [];
        setMembers(filtered);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string | null) => {
    if (role === 'parent') return 'from-blue-500 to-purple-600';
    if (role === 'child') return 'from-pink-500 to-rose-600';
    return 'from-gray-500 to-gray-600';
  };

  const getRoleLabel = (role: string | null, age: number | null) => {
    if (role === 'parent') return 'Parent';
    if (role === 'child' && age) return `${age} years old`;
    if (role === 'child') return 'Child';
    return 'Member';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          Family Members
        </h1>
        <p className="text-muted-foreground text-lg">
          Meet the Sahin family and their task progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {members?.map((member) => (
          <Card key={member?.id} className="shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${getRoleColor(member?.role ?? null)} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <User className="w-9 h-9 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1 group-hover:text-blue-600 transition-colors">
                    {member?.name ?? 'Unknown'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {getRoleLabel(member?.role ?? null, member?.age ?? null)}
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ListTodo className="w-4 h-4" />
                        <span>Assigned</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {member?._count?.taskAssignments ?? 0}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ClipboardCheck className="w-4 h-4" />
                        <span>Completed</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {member?._count?.taskCompletions ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )) ?? null}
      </div>
    </div>
  );
}
