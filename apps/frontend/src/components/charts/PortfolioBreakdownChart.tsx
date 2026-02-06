/**
 * PortfolioBreakdownChart - Donut/Pie chart for portfolio composition
 * 
 * Features:
 * - Donut or pie chart display
 * - Category breakdown
 * - Custom colors per category
 * - Percentage labels
 * - Interactive legend
 * - Responsive design
 */

'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardContent, Box, Typography } from '@mui/material';

// Types
interface PortfolioCategory {
  name: string;
  value: number;
  count?: number;
  color?: string;
}

interface PortfolioBreakdownChartProps {
  data: PortfolioCategory[];
  title?: string;
  height?: number;
  variant?: 'donut' | 'pie';
  showPercentages?: boolean;
}

// Default colors
const DEFAULT_COLORS = [
  '#4A90E2', // Blue
  '#50C878', // Green
  '#FFB347', // Orange
  '#FF6B6B', // Red
  '#9B59B6', // Purple
  '#3498DB', // Light Blue
  '#E74C3C', // Dark Red
  '#F39C12', // Yellow
];

// Helper functions
const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `₪${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `₪${(value / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatFullCurrency = (value: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
};

// Custom Label
const renderCustomLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label for small slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontWeight: 'bold', fontSize: '14px' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom Tooltip
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 2,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 2,
        }}
      >
        <Typography variant="body2" fontWeight="600" gutterBottom>
          {data.name}
        </Typography>
        <Typography variant="body2">
          ערך: {formatFullCurrency(data.value)}
        </Typography>
        {data.count !== undefined && (
          <Typography variant="body2">
            מספר: {data.count}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {((data.value / payload[0].payload.totalValue) * 100).toFixed(1)}%
        </Typography>
      </Box>
    );
  }
  return null;
};

export const PortfolioBreakdownChart: React.FC<PortfolioBreakdownChartProps> = ({
  data,
  title = 'התפלגות תיק נכסים',
  height = 300,
  variant = 'donut',
  showPercentages = true,
}) => {
  // Calculate total for percentages
  const total = React.useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  // Enhance data with total for tooltip
  const enhancedData = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      totalValue: total,
    }));
  }, [data, total]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader title={title} />
        <CardContent>
          <Box
            sx={{
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              אין נתונים להצגה
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={enhancedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={showPercentages ? renderCustomLabel : undefined}
              outerRadius={variant === 'donut' ? 100 : 120}
              innerRadius={variant === 'donut' ? 60 : 0}
              fill="#8884d8"
              dataKey="value"
            >
              {enhancedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => {
                const percentage = ((entry.payload.value / total) * 100).toFixed(1);
                return `${value} (${percentage}%)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Summary Stats Below Chart */}
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            סה״כ: {formatFullCurrency(total)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PortfolioBreakdownChart;
