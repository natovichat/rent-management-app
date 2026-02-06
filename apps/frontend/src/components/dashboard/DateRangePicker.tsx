'use client';

import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Paper,
  Typography,
} from '@mui/material';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onPresetSelect?: (preset: string) => void;
}

const PRESETS = [
  { label: 'חודש אחרון', value: 'lastMonth' },
  { label: 'רבעון אחרון', value: 'lastQuarter' },
  { label: 'שנה אחרונה', value: 'lastYear' },
  { label: 'השנה הנוכחית', value: 'thisYear' },
  { label: 'הכל', value: 'all' },
];

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onPresetSelect,
}: DateRangePickerProps) {
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onStartDateChange(value ? new Date(value) : null);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onEndDateChange(value ? new Date(value) : null);
  };

  const handlePresetSelect = (preset: string) => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    switch (preset) {
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'lastQuarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3, 0);
        break;
      case 'lastYear':
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case 'all':
        start = null;
        end = null;
        break;
    }

    onStartDateChange(start);
    onEndDateChange(end);
    onPresetSelect?.(preset);
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        סינון לפי תאריכים
      </Typography>
      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
        <TextField
          label="תאריך התחלה"
          type="date"
          value={formatDateForInput(startDate)}
          onChange={handleStartDateChange}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="תאריך סיום"
          type="date"
          value={formatDateForInput(endDate)}
          onChange={handleEndDateChange}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          label="טווח מוגדר מראש"
          size="small"
          sx={{ minWidth: 150 }}
          onChange={(e) => handlePresetSelect(e.target.value)}
          defaultValue=""
        >
          {PRESETS.map((preset) => (
            <MenuItem key={preset.value} value={preset.value}>
              {preset.label}
            </MenuItem>
          ))}
        </TextField>
        {(startDate || endDate) && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              onStartDateChange(null);
              onEndDateChange(null);
            }}
          >
            נקה סינון
          </Button>
        )}
      </Box>
    </Paper>
  );
}
