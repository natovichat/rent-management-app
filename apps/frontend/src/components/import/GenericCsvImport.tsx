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
import CsvImportPreview from '../properties/CsvImportPreview';

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

interface GenericCsvImportProps {
  /** Import type: 'ownerships' | 'mortgages' | 'plot-info' */
  importType: 'ownerships' | 'mortgages' | 'plot-info';
  /** Hebrew label for the entity type */
  entityLabel: string;
  /** Query key to invalidate after import */
  queryKey: string[];
  /** Optional example CSV download endpoint */
  exampleEndpoint?: string;
}

/**
 * Generic CSV import component for ownerships, mortgages, and plot-info.
 * Reusable component that handles preview, import, and error display.
 */
export default function GenericCsvImport({
  importType,
  entityLabel,
  queryKey,
  exampleEndpoint,
}: GenericCsvImportProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Download example CSV
  const handleDownloadExample = async () => {
    handleMenuClose();
    if (!exampleEndpoint) return;
    
    try {
      const response = await api.get(exampleEndpoint, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${importType}-example.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download example:', error);
      alert('שגיאה בהורדת קובץ הדוגמה');
    }
  };

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<PreviewResult>(
        `/import/${importType}/preview`,
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
      alert(error.response?.data?.message || 'שגיאה בתצוגה מקדימה של קובץ CSV');
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('skipErrors', 'true');

      const response = await api.post<ImportResult>(
        `/import/${importType}`,
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
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || `שגיאה בייבוא ${entityLabel}`);
    },
  });

  const handleImport = () => {
    handleMenuClose();
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPendingFile(file);
      previewMutation.mutate(file);
    }
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
      <IconButton onClick={handleMenuOpen} title={`ייבוא ${entityLabel} מ-CSV`}>
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
        {exampleEndpoint && (
          <MenuItem onClick={handleDownloadExample}>
            <DownloadIcon sx={{ mr: 1 }} />
            הורדת קובץ לדוגמה
          </MenuItem>
        )}
      </Menu>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {(importMutation.isPending || previewMutation.isPending) && (
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
            {previewMutation.isPending ? 'מציג תצוגה מקדימה...' : `מייבא ${entityLabel}...`}
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
                  <strong>הצלחה:</strong> {importResult.success} {entityLabel}
                </Typography>
                <Typography>
                  <strong>כשלון:</strong> {importResult.failed} {entityLabel}
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
    </>
  );
}
