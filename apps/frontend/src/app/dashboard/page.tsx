'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import { Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, List, ListItem, Button as MuiButton } from '@mui/material';
import { isAuthenticated, logout } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api/dashboard';
import { api } from '@/lib/api';
import PortfolioSummaryCards from '@/components/dashboard/PortfolioSummaryCards';
import PropertyDistributionChart from '@/components/dashboard/PropertyDistributionChart';
import DateRangePicker from '@/components/dashboard/DateRangePicker';
import IncomeExpenseChart from '@/components/charts/IncomeExpenseChart';
import PropertyValueChart from '@/components/charts/PropertyValueChart';
import LeaseExpirationTimeline from '@/components/dashboard/LeaseExpirationTimeline';
import CashFlowChart from '@/components/dashboard/CashFlowChart';
import ROIMetricCard from '@/components/dashboard/ROIMetricCard';

/**
 * Dashboard & Analytics page - Epic 10
 * 
 * Features:
 * - Portfolio summary cards (US10.1)
 * - Property distribution chart (US10.2)
 * - Income vs expenses chart (US10.3)
 * - Property value over time (US10.4)
 * - Mortgage summary (US10.5)
 * - Lease expiration timeline (US10.6)
 * - Date range filtering (US10.7)
 * - ROI metrics (US10.10)
 * - Cash flow summary (US10.12)
 */
export default function DashboardPage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [exporting, setExporting] = useState(false);
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  const [widgetPreferences, setWidgetPreferences] = useState<{ visibleWidgets: string[]; widgetOrder: string[] } | null>(null);
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  // Format dates for API
  const startDateStr = startDate ? startDate.toISOString().split('T')[0] : undefined;
  const endDateStr = endDate ? endDate.toISOString().split('T')[0] : undefined;

  // Fetch all dashboard data
  const { data: portfolioSummary, isLoading: loadingSummary } = useQuery({
    queryKey: ['portfolioSummary', startDateStr, endDateStr],
    queryFn: () => dashboardApi.getPortfolioSummary(startDateStr, endDateStr),
  });

  const { data: distribution, isLoading: loadingDistribution } = useQuery({
    queryKey: ['propertyDistribution'],
    queryFn: () => dashboardApi.getPropertyDistribution(),
  });

  const { data: valuationHistory, isLoading: loadingValuation } = useQuery({
    queryKey: ['valuationHistory', startDateStr, endDateStr],
    queryFn: () => dashboardApi.getValuationHistory(startDateStr, endDateStr),
  });

  const { data: incomeExpenses, isLoading: loadingIncomeExpenses } = useQuery({
    queryKey: ['incomeExpenses', startDateStr, endDateStr],
    queryFn: () => dashboardApi.getIncomeExpenses(startDateStr, endDateStr, 'month'),
  });

  const { data: mortgageSummary, isLoading: loadingMortgage } = useQuery({
    queryKey: ['mortgageSummary'],
    queryFn: () => dashboardApi.getMortgageSummary(),
  });

  const { data: leaseTimeline, isLoading: loadingLease } = useQuery({
    queryKey: ['leaseTimeline'],
    queryFn: () => dashboardApi.getLeaseExpirationTimeline(12),
  });

  const { data: roiMetrics, isLoading: loadingROI } = useQuery({
    queryKey: ['roiMetrics', startDateStr, endDateStr],
    queryFn: () => dashboardApi.getROI(startDateStr, endDateStr),
  });

  const { data: cashFlow, isLoading: loadingCashFlow } = useQuery({
    queryKey: ['cashFlow', startDateStr, endDateStr],
    queryFn: () => dashboardApi.getCashFlow(startDateStr, endDateStr, 'month'),
  });

  const { data: preferences } = useQuery({
    queryKey: ['widgetPreferences'],
    queryFn: () => dashboardApi.getWidgetPreferences(),
  });

  // Use preferences if available, otherwise show all widgets
  const visibleWidgets = preferences?.visibleWidgets || [
    'portfolioSummary',
    'propertyDistribution',
    'incomeExpenses',
    'valuationHistory',
    'mortgageSummary',
    'leaseTimeline',
    'roiMetrics',
    'cashFlow',
  ];

  // Transform data for charts
  const incomeExpenseChartData = incomeExpenses?.map((item) => ({
    period: item.period,
    income: item.income,
    expenses: item.expenses,
    net: item.net,
  })) || [];

  const valuationChartData = valuationHistory?.map((item) => ({
    date: item.date,
    value: item.totalValue,
  })) || [];

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExportMenuAnchor(null);
    setExporting(true);
    try {
      let endpoint: string;
      let filename: string;
      let contentType: string;

      if (format === 'excel') {
        // US13.9: Export Financial Report to Excel
        endpoint = '/export/financial/excel';
        filename = `financial-report-${new Date().toISOString().split('T')[0]}.xlsx`;
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      } else {
        // US13.10: Export Portfolio Summary to PDF
        endpoint = '/export/portfolio/pdf';
        filename = `portfolio-summary-${new Date().toISOString().split('T')[0]}.pdf`;
        contentType = 'application/pdf';
      }

      const response = await api.get(endpoint, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(error.response?.data?.message || 'שגיאה בייצוא הנתונים');
    } finally {
      setExporting(false);
    }
  };

  const handleOpenCustomize = () => {
    if (preferences) {
      setWidgetPreferences({ ...preferences });
    } else {
      setWidgetPreferences({
        visibleWidgets: visibleWidgets,
        widgetOrder: visibleWidgets,
      });
    }
    setCustomizeDialogOpen(true);
  };

  const handleSavePreferences = async () => {
    if (!widgetPreferences) return;
    setSavingPreferences(true);
    try {
      await dashboardApi.saveWidgetPreferences(widgetPreferences);
      setCustomizeDialogOpen(false);
      // Refetch preferences
      window.location.reload(); // Simple refresh to reload preferences
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('שגיאה בשמירת העדפות');
    } finally {
      setSavingPreferences(false);
    }
  };

  const toggleWidget = (widgetId: string) => {
    if (!widgetPreferences) return;
    const isVisible = widgetPreferences.visibleWidgets.includes(widgetId);
    setWidgetPreferences({
      ...widgetPreferences,
      visibleWidgets: isVisible
        ? widgetPreferences.visibleWidgets.filter((id) => id !== widgetId)
        : [...widgetPreferences.visibleWidgets, widgetId],
    });
  };

  const allWidgets = [
    { id: 'portfolioSummary', label: 'סיכום תיק נכסים' },
    { id: 'propertyDistribution', label: 'התפלגות נכסים' },
    { id: 'roiMetrics', label: 'מדדי תשואה' },
    { id: 'incomeExpenses', label: 'הכנסות מול הוצאות' },
    { id: 'valuationHistory', label: 'שווי נכסים לאורך זמן' },
    { id: 'cashFlow', label: 'תזרים מזומנים' },
    { id: 'leaseTimeline', label: 'ציר זמן פקיעת חוזים' },
    { id: 'mortgageSummary', label: 'סיכום משכנתאות' },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          לוח בקרה ואנליטיקה
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleOpenCustomize}
          >
            התאם אישית
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            disabled={exporting}
          >
            {exporting ? 'מייצא...' : 'ייצא נתונים'}
          </Button>
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
          >
            <MenuItem onClick={() => handleExport('excel')}>ייצא דוח כספי ל-Excel</MenuItem>
            <MenuItem onClick={() => handleExport('pdf')}>ייצא סיכום תיק ל-PDF</MenuItem>
          </Menu>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={logout}
          >
            התנתק
          </Button>
        </Box>
      </Box>

      {/* Date Range Filter - US10.7 */}
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {/* Portfolio Summary Cards - US10.1 */}
      {visibleWidgets.includes('portfolioSummary') && (
        <Box mb={4}>
          <PortfolioSummaryCards data={portfolioSummary} loading={loadingSummary} />
        </Box>
      )}

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Property Distribution - US10.2 */}
        {visibleWidgets.includes('propertyDistribution') && (
          <Grid item xs={12} md={6}>
            <PropertyDistributionChart data={distribution} loading={loadingDistribution} />
          </Grid>
        )}

        {/* ROI Metrics - US10.10 */}
        {visibleWidgets.includes('roiMetrics') && (
          <Grid item xs={12} md={6}>
            <ROIMetricCard data={roiMetrics} loading={loadingROI} />
          </Grid>
        )}

        {/* Income vs Expenses - US10.3 */}
        {visibleWidgets.includes('incomeExpenses') && (
          <Grid item xs={12}>
            {loadingIncomeExpenses ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <IncomeExpenseChart
                data={incomeExpenseChartData || []}
                title="הכנסות מול הוצאות"
              />
            )}
          </Grid>
        )}

        {/* Property Value Over Time - US10.4 */}
        {visibleWidgets.includes('valuationHistory') && (
          <Grid item xs={12} md={6}>
            {loadingValuation ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <PropertyValueChart
                data={valuationChartData || []}
                title="שווי נכסים לאורך זמן"
              />
            )}
          </Grid>
        )}

        {/* Cash Flow - US10.12 */}
        {visibleWidgets.includes('cashFlow') && (
          <Grid item xs={12} md={6}>
            <CashFlowChart data={cashFlow} loading={loadingCashFlow} />
          </Grid>
        )}

        {/* Lease Expiration Timeline - US10.6 */}
        {visibleWidgets.includes('leaseTimeline') && (
          <Grid item xs={12}>
            <LeaseExpirationTimeline data={leaseTimeline} loading={loadingLease} />
          </Grid>
        )}

        {/* Mortgage Summary - US10.5 */}
        {visibleWidgets.includes('mortgageSummary') && mortgageSummary && (
          <Grid item xs={12}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                סיכום משכנתאות
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    חוב כולל
                  </Typography>
                  <Typography variant="h6">
                    ₪{mortgageSummary.totalMortgageDebt.toLocaleString('he-IL')}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    תשלומים חודשיים
                  </Typography>
                  <Typography variant="h6">
                    ₪{mortgageSummary.totalMonthlyPayments.toLocaleString('he-IL')}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    משכנתאות פעילות
                  </Typography>
                  <Typography variant="h6">
                    {mortgageSummary.activeMortgagesCount}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    ריבית ממוצעת
                  </Typography>
                  <Typography variant="h6">
                    {mortgageSummary.averageInterestRate.toFixed(2)}%
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Customize Dashboard Dialog - US10.13 */}
      <Dialog
        open={customizeDialogOpen}
        onClose={() => setCustomizeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>התאם אישית את לוח הבקרה</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            בחר את הווידג'טים שתרצה לראות בלוח הבקרה:
          </Typography>
          <List>
            {allWidgets.map((widget) => (
              <ListItem key={widget.id} disablePadding>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={widgetPreferences?.visibleWidgets.includes(widget.id) || false}
                      onChange={() => toggleWidget(widget.id)}
                    />
                  }
                  label={widget.label}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setCustomizeDialogOpen(false)}>
            ביטול
          </MuiButton>
          <MuiButton
            onClick={handleSavePreferences}
            variant="contained"
            disabled={savingPreferences}
          >
            {savingPreferences ? 'שומר...' : 'שמור'}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
