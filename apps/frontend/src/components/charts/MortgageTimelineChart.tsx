/**
 * MortgageTimelineChart - Gantt-style chart for mortgage payoff timeline
 * 
 * Features:
 * - Visual timeline of all mortgages
 * - Start and end dates
 * - Color coding by status
 * - Interactive bars
 * - Responsive design
 * - Today indicator
 */

'use client';

import React from 'react';
import { Card, CardHeader, CardContent, Box, Typography, Chip } from '@mui/material';
import { differenceInMonths, format, isAfter, isBefore } from 'date-fns';
import { he } from 'date-fns/locale';

// Types
interface Mortgage {
  id: string;
  bank: string;
  loanAmount: number;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'PAID_OFF' | 'REFINANCED' | 'DEFAULTED';
  propertyAddress?: string;
}

interface MortgageTimelineChartProps {
  mortgages: Mortgage[];
  title?: string;
  height?: number;
}

// Helper functions
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return '#50C878';
    case 'PAID_OFF':
      return '#9E9E9E';
    case 'REFINANCED':
      return '#FFB347';
    case 'DEFAULTED':
      return '#FF6B6B';
    default:
      return '#4A90E2';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'פעיל';
    case 'PAID_OFF':
      return 'סולק';
    case 'REFINANCED':
      return 'מימון מחדש';
    case 'DEFAULTED':
      return 'ברירת מחדל';
    default:
      return status;
  }
};

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `₪${(value / 1000000).toFixed(1)}M`;
  }
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
};

export const MortgageTimelineChart: React.FC<MortgageTimelineChartProps> = ({
  mortgages,
  title = 'לוח סילוק משכנתאות',
  height = 300,
}) => {
  // Filter mortgages with end dates
  const validMortgages = mortgages.filter((m) => m.endDate);

  if (validMortgages.length === 0) {
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
              אין נתוני משכנתאות להצגה
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Find min and max dates
  const allDates = validMortgages.flatMap((m) => [
    new Date(m.startDate),
    m.endDate ? new Date(m.endDate) : new Date(),
  ]);
  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
  const totalMonths = differenceInMonths(maxDate, minDate);
  const today = new Date();
  const todayPosition = ((today.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100;

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <Box sx={{ position: 'relative', minHeight: height }}>
          {/* Time axis */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 2,
              px: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {format(minDate, 'MMM yyyy', { locale: he })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(maxDate, 'MMM yyyy', { locale: he })}
            </Typography>
          </Box>

          {/* Today indicator */}
          {todayPosition >= 0 && todayPosition <= 100 && (
            <Box
              sx={{
                position: 'absolute',
                left: `${todayPosition}%`,
                top: 40,
                bottom: 20,
                width: 2,
                bgcolor: 'error.main',
                zIndex: 10,
                '&::before': {
                  content: '"היום"',
                  position: 'absolute',
                  top: -25,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '10px',
                  color: 'error.main',
                  fontWeight: 'bold',
                },
              }}
            />
          )}

          {/* Mortgage bars */}
          <Box sx={{ position: 'relative' }}>
            {validMortgages.map((mortgage, index) => {
              const start = new Date(mortgage.startDate);
              const end = mortgage.endDate ? new Date(mortgage.endDate) : new Date();
              
              const startPercent =
                ((start.getTime() - minDate.getTime()) /
                  (maxDate.getTime() - minDate.getTime())) *
                100;
              const widthPercent =
                ((end.getTime() - start.getTime()) /
                  (maxDate.getTime() - minDate.getTime())) *
                100;

              const isExpired = mortgage.endDate && isAfter(today, end);
              const isActive = mortgage.status === 'ACTIVE' && !isExpired;

              return (
                <Box
                  key={mortgage.id}
                  sx={{
                    position: 'relative',
                    mb: 3,
                    height: 60,
                  }}
                >
                  {/* Mortgage bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${startPercent}%`,
                      width: `${widthPercent}%`,
                      height: 40,
                      bgcolor: getStatusColor(mortgage.status),
                      borderRadius: 1,
                      opacity: isActive ? 1 : 0.6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                      },
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'white',
                          fontWeight: 'bold',
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {mortgage.bank}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'white',
                          fontSize: '10px',
                        }}
                      >
                        {formatCurrency(mortgage.loanAmount)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Property address below bar */}
                  {mortgage.propertyAddress && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        position: 'absolute',
                        top: 45,
                        left: `${startPercent}%`,
                        whiteSpace: 'nowrap',
                        fontSize: '10px',
                      }}
                    >
                      {mortgage.propertyAddress}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Legend */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mt: 4,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {['ACTIVE', 'PAID_OFF', 'REFINANCED', 'DEFAULTED'].map((status) => (
              <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    bgcolor: getStatusColor(status),
                    borderRadius: 0.5,
                  }}
                />
                <Typography variant="caption">{getStatusLabel(status)}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MortgageTimelineChart;
