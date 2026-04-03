'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface UserCompletionsChartProps {
  data: Array<{ id: string; name: string; count: number }>;
}

const COLORS = ['#60B5FF', '#FF9149', '#FF90BB', '#72BF78', '#A19AD3'];

export function UserCompletionsChart({ data }: UserCompletionsChartProps) {
  const chartData = data?.map((item: any) => ({
    name: item?.name ?? 'Unknown',
    count: item?.count ?? 0
  })) ?? [];

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No completion data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 15 }}>
        <XAxis 
          dataKey="name" 
          tickLine={false}
          tick={{ fontSize: 10 }}
          label={{ value: 'Family Member', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fontSize: 11 } }}
        />
        <YAxis 
          tickLine={false}
          tick={{ fontSize: 10 }}
          label={{ value: 'Completions', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
        />
        <Tooltip 
          wrapperStyle={{ fontSize: 11 }}
          contentStyle={{ fontSize: 11 }}
        />
        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
          {chartData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
