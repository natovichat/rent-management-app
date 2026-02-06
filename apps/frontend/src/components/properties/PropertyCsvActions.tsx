'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { api } from '@/lib/api';
import CsvImportPreview from './CsvImportPreview';
import ColumnSelectionDialog, { ColumnOption } from '../export/ColumnSelectionDialog';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

interface PreviewResult {
  valid: boolean;
  rows: Array<{
    rowNumber: number;
    data: Record<string, string>;
    errors: Array<{ row: number; field?: string; message: string }>;
    valid: boolean;
  }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

/**
 * Component for CSV import/export actions.
 */
export default function PropertyCsvActions() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Download example CSV
  const handleDownloadExample = async () => {
    handleMenuClose();
    try {
      const response = await api.get('/properties/csv/example', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'properties-example.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download example:', error);
    }
  };

  // Available columns for export
  const propertyColumns: ColumnOption[] = [
    { id: 'address', label: 'כתובת', default: true },
    { id: 'type', label: 'סוג', default: true },
    { id: 'status', label: 'סטטוס', default: true },
    { id: 'city', label: 'עיר', default: true },
    { id: 'totalArea', label: 'שטח כולל', default: true },
    { id: 'estimatedValue', label: 'שווי משוער', default: true },
    { id: 'gush', label: 'גוש', default: true },
    { id: 'helka', label: 'חלקה', default: true },
    { id: 'landArea', label: 'שטח קרקע', default: false },
    { id: 'country', label: 'מדינה', default: false },
    { id: 'fileNumber', label: 'מספר תיק', default: false },
    { id: 'notes', label: 'הערות', default: false },
    { id: 'createdAt', label: 'תאריך יצירה', default: false },
    { id: 'updatedAt', label: 'תאריך עדכון', default: false },
  ];

  // Open column selection dialog
  const handleExport = () => {
    handleMenuClose();
    setColumnDialogOpen(true);
  };

  // Export with selected columns
  const handleExportWithColumns = async (selectedColumns: string[]) => {
    setColumnDialogOpen(false);
    setExporting(true);
    try {
      const columnsParam = selectedColumns.join(',');
      const response = await api.get(`/export/properties/csv?columns=${columnsParam}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `properties-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to export:', error);
      alert(error.response?.data?.message || 'שגיאה בייצוא נכסים');
    } finally {
      setExporting(false);
    }
  };

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<PreviewResult>(
        '/properties/csv/preview',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      setPreviewResult(data);
      setPreviewDialogOpen(true);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to preview CSV file');
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('skipErrors', 'true');

      const response = await api.post<ImportResult>(
        '/properties/csv/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      setImportResult(data);
      setImportDialogOpen(true);
      setPreviewDialogOpen(false);
      setPreviewResult(null);
      setPendingFile(null);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to import properties');
    },
  });

  const handleImport = () => {
    handleMenuClose();
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // First show preview
      setPendingFile(file);
      previewMutation.mutate(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (pendingFile) {
      importMutation.mutate(pendingFile);
    }
  };

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
    setImportResult(null);
  };

  return (
    <>
      <IconButton onClick={handleMenuOpen} title="CSV Actions">
        <MoreIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleImport} disabled={importMutation.isPending}>
          <UploadIcon sx={{ mr: 1 }} />
          ייבוא מ-CSV
        </MenuItem>
        <MenuItem onClick={handleExport}>
          <DownloadIcon sx={{ mr: 1 }} />
          ייצוא ל-CSV
        </MenuItem>
        <MenuItem onClick={handleDownloadExample}>
          <DownloadIcon sx={{ mr: 1 }} />
          הורדת קובץ לדוגמה
        </MenuItem>
      </Menu>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {(importMutation.isPending || previewMutation.isPending || exporting) && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9999,
            bgcolor: 'background.paper',
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>
            {previewMutation.isPending
              ? 'מציג תצוגה מקדימה...'
              : exporting
              ? 'מייצא נכסים...'
              : 'מייבא נכסים...'}
          </Typography>
        </Box>
      )}

      {previewResult && (
        <CsvImportPreview
          open={previewDialogOpen}
          onClose={() => {
            setPreviewDialogOpen(false);
            setPreviewResult(null);
            setPendingFile(null);
          }}
          onConfirm={handleConfirmImport}
          preview={previewResult}
          loading={importMutation.isPending}
        />
      )}

      <Dialog
        open={importDialogOpen}
        onClose={handleCloseImportDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>תוצאות ייבוא</DialogTitle>
        <DialogContent>
          {importResult && (
            <>
              <Alert
                severity={importResult.failed === 0 ? 'success' : 'warning'}
                sx={{ mb: 2 }}
              >
                <Typography>
                  <strong>הצלחה:</strong> {importResult.success} נכסים
                </Typography>
                <Typography>
                  <strong>כשלון:</strong> {importResult.failed} נכסים
                </Typography>
              </Alert>

              {importResult.errors.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    שגיאות:
                  </Typography>
                  <List dense>
                    {importResult.errors.map((error, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={error}
                          sx={{ color: 'error.main' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog}>סגור</Button>
        </DialogActions>
      </Dialog>

      <ColumnSelectionDialog
        open={columnDialogOpen}
        onClose={() => setColumnDialogOpen(false)}
        onConfirm={handleExportWithColumns}
        columns={propertyColumns}
        title="בחר עמודות לייצוא נכסים"
        loading={exporting}
      />
    </>
  );
}
