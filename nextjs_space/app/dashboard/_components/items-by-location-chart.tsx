'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ItemsByLocationChartProps {
  data: Array<{ name: string; count: number }>;
}

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#80D8C3', '#A19AD3', '#72BF78', '#FF6363'];

export function ItemsByLocationChart({ data }: ItemsByLocationChartProps) {
  const chartData = data?.map((item: any) => ({
    name: item?.name ?? 'Unknown',
    count: item?.count ?? 0
  })) ?? [];

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No location data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 35 }}>
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          height={60}
          tickLine={false}
          tick={{ fontSize: 10 }}
          label={{ value: 'Location', position: 'insideBottom', offset: -30, style: { textAnchor: 'middle', fontSize: 11 } }}
        />
        <YAxis 
          tickLine={false}
          tick={{ fontSize: 10 }}
          label={{ value: 'Items', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 11 } }}
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
