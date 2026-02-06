/**
 * PropertyReportActions - UI controls for generating and exporting reports
 * 
 * Features:
 * - Export to Excel button
 * - Export to CSV button
 * - Print button
 * - Generate detailed report
 * - Report options dialog
 * - Loading states
 * - Error handling
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  MoreVert as MoreIcon,
  Description as DescriptionIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import {
  exportPropertiesToExcel,
  exportPropertiesToCSV,
  generateDetailedReport,
  printPropertiesList,
} from '@/lib/reports/propertyReportGenerator';

// Types
interface Property {
  id: string;
  address: string;
  city?: string;
  country: string;
  type?: string;
  status?: string;
  totalArea?: number;
  estimatedValue?: number;
  ownerships?: any[];
  mortgages?: any[];
  _count?: {
    units: number;
    mortgages: number;
  };
}

interface PropertyReportActionsProps {
  properties: Property[];
  selectedProperties?: Property[];
  disabled?: boolean;
}

export const PropertyReportActions: React.FC<PropertyReportActionsProps> = ({
  properties,
  selectedProperties,
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [detailedReportDialogOpen, setDetailedReportDialogOpen] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    includeFinancialSummary: true,
    includeOwnershipDetails: true,
    includeMortgageDetails: true,
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const dataToExport = selectedProperties && selectedProperties.length > 0
    ? selectedProperties
    : properties;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      handleMenuClose();
      exportPropertiesToExcel(dataToExport, {
        filename: `properties_${new Date().toISOString().split('T')[0]}.xlsx`,
      });
      setSnackbar({
        open: true,
        message: 'הדוח יוצא בהצלחה לאקסל',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'שגיאה בייצוא לאקסל',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      handleMenuClose();
      exportPropertiesToCSV(dataToExport, {
        filename: `properties_${new Date().toISOString().split('T')[0]}.csv`,
      });
      setSnackbar({
        open: true,
        message: 'הדוח יוצא בהצלחה ל-CSV',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'שגיאה בייצוא ל-CSV',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    try {
      handleMenuClose();
      printPropertiesList(dataToExport);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'שגיאה בהדפסה',
        severity: 'error',
      });
    }
  };

  const handleOpenDetailedReportDialog = () => {
    handleMenuClose();
    setDetailedReportDialogOpen(true);
  };

  const handleCloseDetailedReportDialog = () => {
    setDetailedReportDialogOpen(false);
  };

  const handleGenerateDetailedReport = async () => {
    try {
      setLoading(true);
      generateDetailedReport(dataToExport, reportOptions);
      setDetailedReportDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'הדוח המפורט נוצר בהצלחה',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'שגיאה ביצירת דוח מפורט',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportOptionChange = (option: keyof typeof reportOptions) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setReportOptions({
      ...reportOptions,
      [option]: event.target.checked,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {/* Quick Export to Excel */}
        <Tooltip title="ייצא לאקסל">
          <span>
            <Button
              variant="outlined"
              startIcon={
                loading ? <CircularProgress size={16} /> : <TableChartIcon />
              }
              onClick={handleExportExcel}
              disabled={disabled || loading || dataToExport.length === 0}
            >
              Excel
            </Button>
          </span>
        </Tooltip>

        {/* Print */}
        <Tooltip title="הדפס">
          <span>
            <IconButton
              onClick={handlePrint}
              disabled={disabled || dataToExport.length === 0}
              color="primary"
            >
              <PrintIcon />
            </IconButton>
          </span>
        </Tooltip>

        {/* More Options Menu */}
        <Tooltip title="אפשרויות נוספות">
          <span>
            <IconButton
              onClick={handleMenuOpen}
              disabled={disabled || dataToExport.length === 0}
            >
              <MoreIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* More Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleExportCSV}>
          <DownloadIcon sx={{ mr: 1 }} />
          ייצא ל-CSV
        </MenuItem>
        <MenuItem onClick={handleOpenDetailedReportDialog}>
          <DescriptionIcon sx={{ mr: 1 }} />
          דוח מפורט
        </MenuItem>
      </Menu>

      {/* Detailed Report Dialog */}
      <Dialog
        open={detailedReportDialogOpen}
        onClose={handleCloseDetailedReportDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>יצירת דוח מפורט</DialogTitle>
        <DialogContent>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={reportOptions.includeFinancialSummary}
                  onChange={handleReportOptionChange('includeFinancialSummary')}
                />
              }
              label="כלול סיכום כספי"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={reportOptions.includeOwnershipDetails}
                  onChange={handleReportOptionChange('includeOwnershipDetails')}
                />
              }
              label="כלול פרטי בעלויות"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={reportOptions.includeMortgageDetails}
                  onChange={handleReportOptionChange('includeMortgageDetails')}
                />
              }
              label="כלול פרטי משכנתאות"
            />
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailedReportDialog}>ביטול</Button>
          <Button
            onClick={handleGenerateDetailedReport}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
          >
            צור דוח
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PropertyReportActions;
