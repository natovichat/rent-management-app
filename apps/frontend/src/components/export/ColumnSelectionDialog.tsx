'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import { useState, useEffect } from 'react';

export interface ColumnOption {
  id: string;
  label: string;
  default?: boolean;
}

interface ColumnSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedColumns: string[]) => void;
  columns: ColumnOption[];
  title?: string;
  loading?: boolean;
}

/**
 * Column selection dialog for CSV/Excel exports.
 * Allows users to select which columns to include in exports.
 */
export default function ColumnSelectionDialog({
  open,
  onClose,
  onConfirm,
  columns,
  title = 'בחר עמודות לייצוא',
  loading = false,
}: ColumnSelectionDialogProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // Initialize with default columns
  useEffect(() => {
    if (open) {
      const defaults = columns.filter((col) => col.default !== false).map((col) => col.id);
      setSelectedColumns(defaults.length > 0 ? defaults : columns.map((col) => col.id));
    }
  }, [open, columns]);

  const handleToggleColumn = (columnId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(columns.map((col) => col.id));
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const handleSelectDefaults = () => {
    const defaults = columns.filter((col) => col.default !== false).map((col) => col.id);
    setSelectedColumns(defaults.length > 0 ? defaults : columns.map((col) => col.id));
  };

  const handleConfirm = () => {
    if (selectedColumns.length > 0) {
      onConfirm(selectedColumns);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button size="small" onClick={handleSelectAll}>
              בחר הכל
            </Button>
            <Button size="small" onClick={handleDeselectAll}>
              בטל הכל
            </Button>
            <Button size="small" onClick={handleSelectDefaults}>
              ברירת מחדל
            </Button>
          </Stack>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            נבחרו {selectedColumns.length} מתוך {columns.length} עמודות
          </Typography>
        </Box>

        <FormGroup>
          {columns.map((column) => (
            <FormControlLabel
              key={column.id}
              control={
                <Checkbox
                  checked={selectedColumns.includes(column.id)}
                  onChange={() => handleToggleColumn(column.id)}
                />
              }
              label={column.label}
            />
          ))}
        </FormGroup>

        {selectedColumns.length === 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="error">
              יש לבחור לפחות עמודה אחת
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          ביטול
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={selectedColumns.length === 0 || loading}
        >
          {loading ? 'מייצא...' : 'ייצוא'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
