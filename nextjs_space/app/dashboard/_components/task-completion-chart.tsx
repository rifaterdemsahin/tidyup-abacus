'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface TaskCompletionChartProps {
  completed: number;
  pending: number;
  inProgress: number;
}

export function TaskCompletionChart({ completed, pending, inProgress }: TaskCompletionChartProps) {
  const data = [
    { name: 'Completed', value: completed ?? 0, color: '#72BF78' },
    { name: 'Pending', value: pending ?? 0, color: '#FF9898' },
    { name: 'In Progress', value: inProgress ?? 0, color: '#60B5FF' }
  ].filter((item: any) => (item?.value ?? 0) > 0);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No task data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }: any) => `${name}: ${value}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={entry?.color ?? '#60B5FF'} />
          ))}
        </Pie>
        <Tooltip 
          wrapperStyle={{ fontSize: 11 }}
          contentStyle={{ fontSize: 11 }}
        />
        <Legend 
          verticalAlign="top" 
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
