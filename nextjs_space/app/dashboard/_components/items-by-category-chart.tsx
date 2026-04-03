'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ItemsByCategoryChartProps {
  data: Array<{ name: string; color: string; count: number }>;
}

export function ItemsByCategoryChart({ data }: ItemsByCategoryChartProps) {
  const chartData = data?.map((item: any) => ({
    name: item?.name ?? 'Unknown',
    value: item?.count ?? 0,
    color: item?.color ?? '#60B5FF'
  })) ?? [];

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No category data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry: any, index: number) => (
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
