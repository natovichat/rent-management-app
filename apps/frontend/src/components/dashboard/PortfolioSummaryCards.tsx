'use client';

import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  AttachMoney as MoneyIcon,
  AccountBalance as BankIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  SquareFoot as SquareFootIcon,
} from '@mui/icons-material';
import { PortfolioSummary } from '@/lib/api/dashboard';

interface PortfolioSummaryCardsProps {
  data?: PortfolioSummary;
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

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('he-IL').format(value);
};

export default function PortfolioSummaryCards({
  data,
  loading = false,
}: PortfolioSummaryCardsProps) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  const cards = [
    {
      title: 'סה"כ נכסים',
      value: formatNumber(data.totalProperties),
      icon: <HomeIcon />,
      color: '#4A90E2',
    },
    {
      title: 'סה"כ יחידות',
      value: formatNumber(data.totalUnits),
      icon: <ApartmentIcon />,
      color: '#50C878',
    },
    {
      title: 'שווי כולל משוער',
      value: formatCurrency(data.totalEstimatedValue),
      icon: <MoneyIcon />,
      color: '#FFB347',
    },
    {
      title: 'חוב משכנתאות',
      value: formatCurrency(data.totalMortgageDebt),
      icon: <BankIcon />,
      color: '#FF6B6B',
    },
    {
      title: 'הון עצמי נטו',
      value: formatCurrency(data.netEquity),
      icon: <TrendingUpIcon />,
      color: '#50C878',
    },
    {
      title: 'אחוז תפוסה',
      value: `${data.occupancyRate.toFixed(1)}%`,
      icon: <PeopleIcon />,
      color: data.occupancyRate >= 80 ? '#50C878' : data.occupancyRate >= 60 ? '#FFB347' : '#FF6B6B',
    },
    {
      title: 'חוזים פעילים',
      value: formatNumber(data.activeLeases),
      icon: <PeopleIcon />,
      color: '#4A90E2',
    },
    {
      title: 'שטח כולל',
      value: `${formatNumber(data.totalArea)} מ"ר`,
      icon: <SquareFootIcon />,
      color: '#9B59B6',
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box sx={{ color: card.color }}>{card.icon}</Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {card.value}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {card.title}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
