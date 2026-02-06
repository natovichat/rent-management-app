'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

interface PreviewRow {
  rowNumber: number;
  data: Record<string, string>;
  errors: Array<{ row: number; field?: string; message: string }>;
  valid: boolean;
}

interface CsvImportPreviewProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  preview: {
    valid: boolean;
    rows: PreviewRow[];
    summary: {
      total: number;
      valid: number;
      invalid: number;
    };
  };
  loading?: boolean;
}

export default function CsvImportPreview({
  open,
  onClose,
  onConfirm,
  preview,
  loading = false,
}: CsvImportPreviewProps) {
  const { rows, summary } = preview;

  // Get all column names from first row
  const columns = rows.length > 0 ? Object.keys(rows[0].data) : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>תצוגה מקדימה של ייבוא</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Alert
            severity={summary.invalid === 0 ? 'success' : 'warning'}
            icon={<InfoIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2">
              <strong>סה"כ שורות:</strong> {summary.total}
            </Typography>
            <Typography variant="body2">
              <strong>תקינות:</strong> {summary.valid}
            </Typography>
            <Typography variant="body2">
              <strong>שגיאות:</strong> {summary.invalid}
            </Typography>
          </Alert>
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>שורה</TableCell>
                <TableCell>סטטוס</TableCell>
                {columns.map((col) => (
                  <TableCell key={col}>{col}</TableCell>
                ))}
                <TableCell>שגיאות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.rowNumber}
                  sx={{
                    backgroundColor: row.valid ? 'transparent' : 'error.lighter',
                  }}
                >
                  <TableCell>{row.rowNumber}</TableCell>
                  <TableCell>
                    {row.valid ? (
                      <Chip
                        icon={<CheckIcon />}
                        label="תקין"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<ErrorIcon />}
                        label="שגיאה"
                        color="error"
                        size="small"
                      />
                    )}
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col}>
                      {row.data[col] || '-'}
                    </TableCell>
                  ))}
                  <TableCell>
                    {row.errors.length > 0 ? (
                      <Tooltip
                        title={row.errors.map((e) => e.message).join('; ')}
                      >
                        <IconButton size="small" color="error">
                          <ErrorIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {summary.invalid > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              יש {summary.invalid} שורות עם שגיאות. שורות אלה יידלגו בעת הייבוא.
            </Typography>
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          ביטול
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading || summary.valid === 0}
        >
          {loading ? 'מייבא...' : 'ייבוא'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
