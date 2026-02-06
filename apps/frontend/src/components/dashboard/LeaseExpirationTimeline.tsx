'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { LeaseExpiration } from '@/lib/api/dashboard';

interface LeaseExpirationTimelineProps {
  data?: LeaseExpiration[];
  loading?: boolean;
}

export default function LeaseExpirationTimeline({
  data,
  loading = false,
}: LeaseExpirationTimelineProps) {
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
        <CardHeader title="ציר זמן פקיעת חוזים" />
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center" p={4}>
            אין חוזים שפוקעים ב-12 החודשים הקרובים
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Group by month
  const monthlyData = data.reduce((acc, lease) => {
    const month = new Date(lease.endDate).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
    });
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month]++;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    count,
  }));

  return (
    <Card>
      <CardHeader title="ציר זמן פקיעת חוזים (12 חודשים הקרובים)" />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#FF6B6B" />
          </BarChart>
        </ResponsiveContainer>
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            סה"כ חוזים שפוקעים: {data.length}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
