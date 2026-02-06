'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { ROIMetrics } from '@/lib/api/dashboard';

interface ROIMetricCardProps {
  data?: ROIMetrics;
  loading?: boolean;
}

export default function ROIMetricCard({
  data,
  loading = false,
}: ROIMetricCardProps) {
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

  const isPositive = data.portfolioROI >= 0;
  const color = isPositive ? '#50C878' : '#FF6B6B';

  return (
    <Card>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6">תשואה על השקעה (ROI)</Typography>
            <Tooltip title="תשואה מחושבת כ: (הכנסה נטו / שווי נכסים כולל) × 100">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <CardContent>
        <Box textAlign="center">
          <Typography
            variant="h3"
            component="div"
            sx={{ fontWeight: 'bold', color }}
          >
            {data.portfolioROI.toFixed(2)}%
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            הכנסה נטו: ₪{data.netIncome.toLocaleString('he-IL')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            שווי נכסים: ₪{data.totalPropertyValue.toLocaleString('he-IL')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
