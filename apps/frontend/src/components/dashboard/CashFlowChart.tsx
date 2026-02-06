'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CashFlowData } from '@/lib/api/dashboard';

interface CashFlowChartProps {
  data?: CashFlowData[];
  loading?: boolean;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function CashFlowChart({
  data,
  loading = false,
}: CashFlowChartProps) {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader title="סיכום תזרים מזומנים" />
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center" p={4}>
            אין נתוני תזרים מזומנים להצגה
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const totalCashFlow = data.reduce((sum, d) => sum + d.cashFlow, 0);
  const avgCashFlow = totalCashFlow / data.length;

  return (
    <Card>
      <CardHeader title="סיכום תזרים מזומנים" />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={(value: number | undefined) => formatCurrency(value ?? 0)} />
            <Legend />
            <Bar dataKey="income" fill="#50C878" name="הכנסות" />
            <Bar dataKey="expenses" fill="#FF6B6B" name="הוצאות" />
            <Bar dataKey="mortgagePayments" fill="#FFB347" name="תשלומי משכנתא" />
            <Bar
              dataKey="cashFlow"
              fill={data[0]?.cashFlow >= 0 ? '#4A90E2' : '#FF6B6B'}
              name="תזרים מזומנים"
            />
          </BarChart>
        </ResponsiveContainer>
        <Box mt={2} display="flex" gap={2}>
          <Typography variant="body2">
            <strong>סה"כ תזרים:</strong> {formatCurrency(totalCashFlow)}
          </Typography>
          <Typography variant="body2">
            <strong>ממוצע חודשי:</strong> {formatCurrency(avgCashFlow)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
