/**
 * IncomeExpenseChart - Bar chart comparing income vs expenses
 * 
 * Features:
 * - Monthly/yearly comparison
 * - Stacked or grouped bars
 * - Net income calculation
 * - Custom colors
 * - Responsive design
 * - Period selection
 */

'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardContent, Box, Typography } from '@mui/material';

// Types
interface FinancialDataPoint {
  period: string; // e.g., "Jan 2024" or "2024"
  income: number;
  expenses: number;
  net?: number;
}

interface IncomeExpenseChartProps {
  data: FinancialDataPoint[];
  title?: string;
  height?: number;
  variant?: 'grouped' | 'stacked';
  showNet?: boolean;
  showGrid?: boolean;
}

// Helper functions
const formatCurrency = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1000000) {
    return `₪${(value / 1000000).toFixed(1)}M`;
  }
  if (absValue >= 1000) {
    return `₪${(value / 1000).toFixed(0)}K`;
  }
  return `₪${value}`;
};

const formatFullCurrency = (value: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
};

// Custom Tooltip
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
    const expenses = payload.find((p: any) => p.dataKey === 'expenses')?.value || 0;
    const net = income - expenses;

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
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: '#50C878' }}>
          הכנסות: {formatFullCurrency(income)}
        </Typography>
        <Typography variant="body2" sx={{ color: '#FF6B6B' }}>
          הוצאות: {formatFullCurrency(expenses)}
        </Typography>
        <Box
          sx={{
            mt: 1,
            pt: 1,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="body2"
            fontWeight="600"
            sx={{ color: net >= 0 ? '#4A90E2' : '#FF6B6B' }}
          >
            נטו: {formatFullCurrency(net)}
          </Typography>
        </Box>
      </Box>
    );
  }
  return null;
};

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  data,
  title = 'הכנסות מול הוצאות',
  height = 300,
  variant = 'grouped',
  showNet = true,
  showGrid = true,
}) => {
  // Calculate net for each data point
  const enhancedData = React.useMemo(() => {
    return data.map((point) => ({
      ...point,
      net: point.income - point.expenses,
    }));
  }, [data]);

  // Calculate totals
  const totals = React.useMemo(() => {
    return enhancedData.reduce(
      (acc, point) => ({
        income: acc.income + point.income,
        expenses: acc.expenses + point.expenses,
        net: acc.net + point.net,
      }),
      { income: 0, expenses: 0, net: 0 }
    );
  }, [enhancedData]);

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
              אין נתונים כספיים להצגה
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
          <BarChart data={enhancedData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="period" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="#666" />
            
            <Bar
              dataKey="income"
              name="הכנסות"
              fill="#50C878"
              radius={[4, 4, 0, 0]}
              stackId={variant === 'stacked' ? 'stack' : undefined}
            />
            <Bar
              dataKey="expenses"
              name="הוצאות"
              fill="#FF6B6B"
              radius={[4, 4, 0, 0]}
              stackId={variant === 'stacked' ? 'stack' : undefined}
            />
            {showNet && (
              <Bar
                dataKey="net"
                name="נטו"
                fill="#4A90E2"
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-around',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              סה״כ הכנסות
            </Typography>
            <Typography variant="h6" sx={{ color: '#50C878' }}>
              {formatCurrency(totals.income)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              סה״כ הוצאות
            </Typography>
            <Typography variant="h6" sx={{ color: '#FF6B6B' }}>
              {formatCurrency(totals.expenses)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              נטו
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: totals.net >= 0 ? '#4A90E2' : '#FF6B6B' }}
            >
              {formatCurrency(totals.net)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseChart;
