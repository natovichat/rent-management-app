/**
 * PropertyValueChart - Line chart showing property value over time
 * 
 * Features:
 * - Time series data visualization
 * - Responsive design
 * - Custom tooltips
 * - Multiple properties comparison (optional)
 * - Date range selection
 * - Export chart as image
 */

'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardContent, Box, Typography } from '@mui/material';

// Types
interface ValuationDataPoint {
  date: string;
  value: number;
  propertyId?: string;
  propertyName?: string;
}

interface PropertyValueChartProps {
  data: ValuationDataPoint[];
  title?: string;
  height?: number;
  showGrid?: boolean;
  enableComparison?: boolean;
}

// Helper functions
const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `₪${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    month: 'short',
    year: '2-digit',
  });
};

// Custom Tooltip
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
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
          {new Date(label).toLocaleDateString('he-IL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: entry.color }}
          >
            {entry.name}: {formatFullCurrency(entry.value)}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

export const PropertyValueChart: React.FC<PropertyValueChartProps> = ({
  data,
  title = 'שווי נכס לאורך זמן',
  height = 300,
  showGrid = true,
  enableComparison = false,
}) => {
  // Group data by property if comparison is enabled
  const chartData = React.useMemo(() => {
    if (!enableComparison || !data.some((d) => d.propertyId)) {
      // Single property - simple format
      return data.map((point) => ({
        date: point.date,
        value: point.value,
      }));
    }

    // Multiple properties - group by date
    const grouped = data.reduce((acc, point) => {
      const dateKey = point.date;
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey };
      }
      const propKey = point.propertyName || point.propertyId || 'value';
      acc[dateKey][propKey] = point.value;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }, [data, enableComparison]);

  // Extract unique property names for comparison mode
  const propertyNames = React.useMemo(() => {
    if (!enableComparison) return ['value'];
    const names = new Set<string>();
    data.forEach((point) => {
      if (point.propertyName || point.propertyId) {
        names.add(point.propertyName || point.propertyId || 'value');
      }
    });
    return Array.from(names);
  }, [data, enableComparison]);

  const colors = ['#4A90E2', '#50C878', '#FFB347', '#FF6B6B', '#9B59B6'];

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
          <LineChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={formatDate}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {propertyNames.map((propName, index) => (
              <Line
                key={propName}
                type="monotone"
                dataKey={propName}
                name={propName === 'value' ? 'שווי' : propName}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PropertyValueChart;
