/**
 * FinancialDashboard - Comprehensive financial overview with charts
 * 
 * Features:
 * - Summary cards (total value, mortgages, income, net worth)
 * - Property value over time chart
 * - Income vs expenses chart
 * - Portfolio breakdown donut chart
 * - Mortgage payoff timeline
 * - Trend indicators
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Types
interface StatsCardData {
  title: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
  subtitle?: string;
  icon: string;
}

interface ValuationDataPoint {
  date: string;
  totalValue: number;
}

interface FinancialDataPoint {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface PortfolioBreakdown {
  type: string;
  value: number;
  count: number;
}

interface FinancialDashboardProps {
  // Summary stats
  totalValue: number;
  totalMortgages: number;
  monthlyIncome: number;
  netWorth: number;
  activeMortgagesCount: number;
  
  // Chart data
  valuationHistory?: ValuationDataPoint[];
  monthlyFinancials?: FinancialDataPoint[];
  portfolioBreakdown?: PortfolioBreakdown[];
  
  // Trend data
  valueGrowth?: number;
}

// Chart colors
const COLORS = ['#4A90E2', '#50C878', '#FFB347', '#FF6B6B', '#9B59B6', '#3498DB'];

// Helper functions
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

const formatFullCurrency = (value: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCompactNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

// Stats Card Component
const StatsCard: React.FC<StatsCardData> = ({
  title,
  value,
  trend,
  trendDirection,
  subtitle,
  icon,
}) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
      <Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="700">
          {value}
        </Typography>
      </Box>
      <Box sx={{ fontSize: '2rem' }}>{icon}</Box>
    </Box>
    
    {(trend || subtitle) && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {trend && (
          <Chip
            size="small"
            label={trend}
            color={trendDirection === 'up' ? 'success' : 'error'}
            icon={trendDirection === 'up' ? <TrendingUpIcon /> : <TrendingDownIcon />}
          />
        )}
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    )}
  </Paper>
);

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  totalValue,
  totalMortgages,
  monthlyIncome,
  netWorth,
  activeMortgagesCount,
  valuationHistory = [],
  monthlyFinancials = [],
  portfolioBreakdown = [],
  valueGrowth = 0,
}) => {
  // Summary cards data
  const summaryCards: StatsCardData[] = [
    {
      title: 'שווי נכסים',
      value: formatCurrency(totalValue),
      trend: valueGrowth > 0 ? `+${valueGrowth}%` : undefined,
      trendDirection: valueGrowth > 0 ? 'up' : 'down',
      icon: '💎',
    },
    {
      title: 'סה״כ משכנתאות',
      value: formatCurrency(totalMortgages),
      subtitle: `${activeMortgagesCount} משכנתאות פעילות`,
      icon: '🏦',
    },
    {
      title: 'הכנסות חודשיות',
      value: formatCurrency(monthlyIncome),
      subtitle: 'דמי שכירות',
      icon: '💵',
    },
    {
      title: 'נטו',
      value: formatCurrency(netWorth),
      subtitle: 'אחרי התחייבויות',
      icon: '📈',
    },
  ];

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatsCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Property Value Over Time */}
        {valuationHistory.length > 0 && (
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="שווי נכסים לאורך זמן" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={valuationHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('he-IL', { month: 'short', year: '2-digit' })}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCompactNumber(value)}
                    />
                    <RechartsTooltip
                      formatter={(value: number | undefined) => formatFullCurrency(value ?? 0)}
                      labelFormatter={(label) => new Date(label).toLocaleDateString('he-IL')}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalValue"
                      name="שווי כולל"
                      stroke="#4A90E2"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Income vs Expenses */}
        {monthlyFinancials.length > 0 && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="הכנסות מול הוצאות" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyFinancials}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCompactNumber(value)} />
                    <RechartsTooltip formatter={(value: number | undefined) => formatFullCurrency(value ?? 0)} />
                    <Legend />
                    <Bar dataKey="income" name="הכנסות" fill="#50C878" />
                    <Bar dataKey="expenses" name="הוצאות" fill="#FF6B6B" />
                    <Bar dataKey="net" name="נטו" fill="#4A90E2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Property Portfolio Breakdown */}
        {portfolioBreakdown.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="התפלגות תיק נכסים" />
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={portfolioBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${name}: ${formatCurrency(value)} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {portfolioBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number | undefined) => formatFullCurrency(value ?? 0)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Summary Stats */}
        {portfolioBreakdown.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="סטטיסטיקות תיק" />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {portfolioBreakdown.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: COLORS[index % COLORS.length],
                          }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {item.type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.count} נכסים
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="h6" fontWeight="600">
                        {formatCurrency(item.value)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default FinancialDashboard;
