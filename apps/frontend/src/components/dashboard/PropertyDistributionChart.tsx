'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PropertyDistribution } from '@/lib/api/dashboard';

interface PropertyDistributionChartProps {
  data?: PropertyDistribution;
  loading?: boolean;
}

const COLORS = ['#4A90E2', '#50C878', '#FFB347', '#FF6B6B', '#9B59B6'];

export default function PropertyDistributionChart({
  data,
  loading = false,
}: PropertyDistributionChartProps) {
  const [view, setView] = useState<'type' | 'status'>('type');

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

  if (!data) {
    return null;
  }

  const typeData = Object.entries(data.distributionByType).map(([name, value]) => ({
    name,
    value,
  }));

  const statusData = Object.entries(data.distributionByStatus).map(([name, value]) => ({
    name,
    value,
  }));

  const chartData = view === 'type' ? typeData : statusData;

  return (
    <Card>
      <CardHeader
        title="התפלגות נכסים"
        action={
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, newView) => newView && setView(newView)}
            size="small"
          >
            <ToggleButton value="type">לפי סוג</ToggleButton>
            <ToggleButton value="status">לפי סטטוס</ToggleButton>
          </ToggleButtonGroup>
        }
      />
      <CardContent>
        {chartData.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" p={4}>
            אין נתונים להצגה
          </Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {view === 'type' ? (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4A90E2" />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
